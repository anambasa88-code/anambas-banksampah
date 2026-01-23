// src/services/analyticsService.js
import prisma from '../lib/prisma';

export const analyticsService = {
 
async getNasabahSummary(nasabahId, startDate = null, endDate = null) {
  const whereSetor = { nasabah_id: nasabahId };
  const whereTarik = { nasabah_id: nasabahId };

  if (startDate || endDate) {
    const waktuFilter = {};
    if (startDate) waktuFilter.gte = new Date(startDate);
    if (endDate) waktuFilter.lte = new Date(`${endDate}T23:59:59.999Z`);
    whereSetor.waktu = waktuFilter;
    whereTarik.waktu = waktuFilter;
  }

  const [tipeSummary, totalSetor, kategoriData, setorCount, tarikCount] = await Promise.all([
    prisma.transaksiSetor.groupBy({
      by: ['tipe_setoran'],
      where: whereSetor,
      _sum: { berat: true },
    }),
    prisma.transaksiSetor.aggregate({
      where: whereSetor,
      _sum: { berat: true, total_rp: true },
    }),
    prisma.transaksiSetor.groupBy({
      by: ['barang_id'],
      where: whereSetor,
      _sum: { berat: true },
    }),
    prisma.transaksiSetor.count({ where: whereSetor }),
    prisma.transaksiTarik.count({ where: whereTarik }),
  ]);

  const barangIds = [...new Set(kategoriData.map(item => item.barang_id))];
  const barangs = barangIds.length > 0
    ? await prisma.masterSampah.findMany({
        where: { id_barang: { in: barangIds } },
        select: { id_barang: true, kategori_utama: true },
      })
    : [];

  const barangMap = barangs.reduce((acc, b) => {
    acc[b.id_barang] = b.kategori_utama;
    return acc;
  }, {});

  const perKategori = kategoriData.reduce((acc, item) => {
    const kat = barangMap[item.barang_id];
    if (kat) acc[kat] = (acc[kat] || 0) + Number(item._sum.berat || 0);
    return acc;
  }, {});

  const perTipe = tipeSummary.reduce((acc, item) => {
    if (item.tipe_setoran) acc[item.tipe_setoran] = (acc[item.tipe_setoran] || 0) + Number(item._sum.berat || 0);
    return acc;
  }, {});

  return {
    total_kg: Number(totalSetor._sum.berat || 0),
    total_rp: Number(totalSetor._sum.total_rp || 0),
    per_tipe: perTipe,
    per_kategori: perKategori,
    total_transaksi_setor: setorCount,
    total_transaksi_tarik: tarikCount,
    periode: startDate || endDate ? { start: startDate, end: endDate } : null,
  };
},
 
async getPetugasUnitSummary(unitId) {
  const [tipeSummary, totalSetor, kategoriData, nasabahCount, genderCount, transaksiSetorCount, transaksiTarikCount, metodeBayarData] = await Promise.all([
    // per tipe setoran (berat)
    prisma.transaksiSetor.groupBy({
      by: ['tipe_setoran'],
      where: { nasabah: { bank_sampah_id: unitId } },
      _sum: { berat: true },
    }),
    // total setor
    prisma.transaksiSetor.aggregate({
      where: { nasabah: { bank_sampah_id: unitId } },
      _sum: { berat: true, total_rp: true },
    }),
    // per barang untuk kategori
    prisma.transaksiSetor.groupBy({
      by: ['barang_id'],
      where: { nasabah: { bank_sampah_id: unitId } },
      _sum: { berat: true },
    }),
    // total nasabah unit
    prisma.user.aggregate({
      where: { peran: 'NASABAH', bank_sampah_id: unitId },
      _count: { id_user: true },
    }),
    // gender nasabah unit
    prisma.user.groupBy({
      by: ['jenis_kelamin'],
      where: { peran: 'NASABAH', bank_sampah_id: unitId },
      _count: { id_user: true },
    }),
    // jumlah transaksi setor
    prisma.transaksiSetor.count({
      where: { nasabah: { bank_sampah_id: unitId } },
    }),
    // jumlah transaksi tarik (asumsi semua di tabel adalah sukses)
    prisma.transaksiTarik.count({
      where: { nasabah: { bank_sampah_id: unitId } },
    }),
    // breakdown metode bayar setor
    prisma.transaksiSetor.groupBy({
      by: ['metode_bayar'],
      where: { nasabah: { bank_sampah_id: unitId } },
      _count: { id_setor: true },
    }),
  ]);

  // Mapping kategori (sama seperti sebelumnya)
  const barangIds = [...new Set(kategoriData.map(item => item.barang_id))];
  const barangs = barangIds.length > 0
    ? await prisma.masterSampah.findMany({
        where: { id_barang: { in: barangIds } },
        select: { id_barang: true, kategori_utama: true },
      })
    : [];
  const barangMap = barangs.reduce((acc, b) => { acc[b.id_barang] = b.kategori_utama; return acc; }, {});

  const perKategori = kategoriData.reduce((acc, item) => {
    const kat = barangMap[item.barang_id];
    if (kat) acc[kat] = (acc[kat] || 0) + Number(item._sum.berat || 0);
    return acc;
  }, {});

  const perTipe = tipeSummary.reduce((acc, item) => {
    if (item.tipe_setoran) acc[item.tipe_setoran] = (acc[item.tipe_setoran] || 0) + Number(item._sum.berat || 0);
    return acc;
  }, {});

  const totalNasabah = nasabahCount._count.id_user || 0;
  const genderBreakdown = genderCount.reduce((acc, item) => {
    const count = item._count.id_user || 0;
    acc[item.jenis_kelamin] = {
      jumlah: count,
      persen: totalNasabah > 0 ? (count / totalNasabah * 100).toFixed(2) : '0.00'
    };
    return acc;
  }, {});

  const metodeBayar = metodeBayarData.reduce((acc, item) => {
    acc[item.metode_bayar] = item._count.id_setor || 0;
    return acc;
  }, {});

  return {
    total_kg: Number(totalSetor._sum.berat || 0),
    total_rp: Number(totalSetor._sum.total_rp || 0),
    per_tipe: perTipe,
    per_kategori: perKategori,
    total_nasabah: totalNasabah,
    gender_breakdown: genderBreakdown,  // { LAKI_LAKI: { jumlah: 234, persen: "58.50" }, ... }
    total_transaksi_setor: transaksiSetorCount || 0,
    total_transaksi_tarik: transaksiTarikCount || 0,
    transaksi_metode_bayar: metodeBayar,  // { TABUNG: 120, JUAL_LANGSUNG: 45 }
  };
},

async getAdminGlobalSummary() {
  try {
    // 1. Ambil data global & unit secara paralel tapi efisien
    const [
      globalTipe, globalTotal, globalKategori, globalNasabah, 
      globalGender, globalSetor, globalTarik, globalMetode,
      units
    ] = await Promise.all([
      prisma.transaksiSetor.groupBy({ by: ['tipe_setoran'], _sum: { berat: true } }),
      prisma.transaksiSetor.aggregate({ _sum: { berat: true, total_rp: true } }),
      prisma.transaksiSetor.groupBy({ by: ['barang_id'], _sum: { berat: true } }),
      prisma.user.count({ where: { peran: 'NASABAH' } }),
      prisma.user.groupBy({ by: ['jenis_kelamin'], where: { peran: 'NASABAH' }, _count: { id_user: true } }),
      prisma.transaksiSetor.count(),
      prisma.transaksiTarik.count(),
      prisma.transaksiSetor.groupBy({ by: ['metode_bayar'], _count: { id_setor: true } }),
      prisma.unitBankSampah.findMany({ select: { id_unit: true, nama_unit: true } })
    ]);

    // 2. Optimasi Master Sampah (Cukup 1x query untuk semua)
    const allBarangIds = [...new Set(globalKategori.map(item => item.barang_id))];
    const masterSampah = allBarangIds.length > 0 
      ? await prisma.masterSampah.findMany({
          where: { id_barang: { in: allBarangIds } },
          select: { id_barang: true, kategori_utama: true }
        })
      : [];
    const barangMap = Object.fromEntries(masterSampah.map(b => [b.id_barang, b.kategori_utama]));

    // 3. Mapping Data Global (Gunakan Number() untuk Decimal Prisma agar aman di JSON)
    const formatWeight = (val) => Number(val || 0);

    const globalPerKategori = globalKategori.reduce((acc, item) => {
      const kat = barangMap[item.barang_id];
      if (kat) acc[kat] = (acc[kat] || 0) + formatWeight(item._sum.berat);
      return acc;
    }, {});

    const globalPerTipe = Object.fromEntries(globalTipe.map(i => [i.tipe_setoran, formatWeight(i._sum.berat)]));
    
    const globalGenderBreakdown = Object.fromEntries(globalGender.map(i => [
      i.jenis_kelamin, 
      { 
        jumlah: i._count.id_user, 
        persen: globalNasabah > 0 ? ((i._count.id_user / globalNasabah) * 100).toFixed(2) : "0.00" 
      }
    ]));

    // 4. Ambil data per unit (Optimasi: Tarik semua data transaksi lalu grouping di memory JS)
    // Ini jauh lebih cepat daripada query berkali-kali di dalam loop map
    const perUnitData = await Promise.all(units.map(async (unit) => {
      const [uTotal, uCounts] = await Promise.all([
        prisma.transaksiSetor.aggregate({
          where: { nasabah: { bank_sampah_id: unit.id_unit } },
          _sum: { berat: true, total_rp: true }
        }),
        prisma.user.count({ where: { peran: 'NASABAH', bank_sampah_id: unit.id_unit } })
      ]);

      return {
        unit_id: unit.id_unit,
        nama_unit: unit.nama_unit,
        total_kg: formatWeight(uTotal._sum.berat),
        total_rp: formatWeight(uTotal._sum.total_rp),
        total_nasabah: uCounts,
        // Untuk detail tipe/gender per unit, jika tidak wajib tampil semua di awal,
        // sebaiknya dibuatkan API terpisah saat unit di-klik (expand) agar dashboard tidak berat.
        per_tipe: {}, 
        per_kategori: {},
        gender_breakdown: {}
      };
    }));

    return {
      global: {
        total_kg: formatWeight(globalTotal._sum.berat),
        total_rp: formatWeight(globalTotal._sum.total_rp),
        per_tipe: globalPerTipe,
        per_kategori: globalPerKategori,
        total_nasabah: globalNasabah,
        gender_breakdown: globalGenderBreakdown,
        total_transaksi_setor: globalSetor,
        total_transaksi_tarik: globalTarik,
        transaksi_metode_bayar: Object.fromEntries(globalMetode.map(i => [i.metode_bayar, i._count.id_setor]))
      },
      per_unit: perUnitData
    };
  } catch (error) {
    console.error("Critical Analytics Error:", error);
    throw error;
  }
}
};