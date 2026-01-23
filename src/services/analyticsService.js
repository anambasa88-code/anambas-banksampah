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
  // Global aggregates
  const [globalTipeSummary, globalTotalSetor, globalKategoriData, globalNasabahCount, globalGenderCount, globalSetorCount, globalTarikCount, globalMetodeBayarData] = await Promise.all([
    prisma.transaksiSetor.groupBy({ by: ['tipe_setoran'], _sum: { berat: true } }),
    prisma.transaksiSetor.aggregate({ _sum: { berat: true, total_rp: true } }),
    prisma.transaksiSetor.groupBy({ by: ['barang_id'], _sum: { berat: true } }),
    prisma.user.aggregate({ where: { peran: 'NASABAH' }, _count: { id_user: true } }),
    prisma.user.groupBy({ by: ['jenis_kelamin'], where: { peran: 'NASABAH' }, _count: { id_user: true } }),
    prisma.transaksiSetor.count(),
    prisma.transaksiTarik.count(),
    prisma.transaksiSetor.groupBy({ by: ['metode_bayar'], _count: { id_setor: true } }),
  ]);

  // Mapping kategori global
  const globalBarangIds = [...new Set(globalKategoriData.map(item => item.barang_id))];
  const globalBarangs = globalBarangIds.length > 0
    ? await prisma.masterSampah.findMany({
        where: { id_barang: { in: globalBarangIds } },
        select: { id_barang: true, kategori_utama: true },
      })
    : [];
  const globalBarangMap = globalBarangs.reduce((acc, b) => { acc[b.id_barang] = b.kategori_utama; return acc; }, {});

  const globalPerKategori = globalKategoriData.reduce((acc, item) => {
    const kat = globalBarangMap[item.barang_id];
    if (kat) acc[kat] = (acc[kat] || 0) + Number(item._sum.berat || 0);
    return acc;
  }, {});

  const globalPerTipe = globalTipeSummary.reduce((acc, item) => {
    if (item.tipe_setoran) acc[item.tipe_setoran] = (acc[item.tipe_setoran] || 0) + Number(item._sum.berat || 0);
    return acc;
  }, {});

  const globalTotalNasabah = globalNasabahCount._count.id_user || 0;
  const globalGenderBreakdown = globalGenderCount.reduce((acc, item) => {
    const count = item._count.id_user || 0;
    acc[item.jenis_kelamin] = {
      jumlah: count,
      persen: globalTotalNasabah > 0 ? (count / globalTotalNasabah * 100).toFixed(2) : '0.00'
    };
    return acc;
  }, {});

  const globalMetodeBayar = globalMetodeBayarData.reduce((acc, item) => {
    acc[item.metode_bayar] = item._count.id_setor || 0;
    return acc;
  }, {});

  // Per unit (lengkap seperti petugas)
  const units = await prisma.unitBankSampah.findMany({ select: { id_unit: true, nama_unit: true } });
  const perUnit = await Promise.all(units.map(async (unit) => {
    const [unitTipeSummary, unitTotalSetor, unitKategoriData, unitNasabahCount, unitGenderCount, unitSetorCount, unitTarikCount, unitMetodeBayarData] = await Promise.all([
      prisma.transaksiSetor.groupBy({ by: ['tipe_setoran'], where: { nasabah: { bank_sampah_id: unit.id_unit } }, _sum: { berat: true } }),
      prisma.transaksiSetor.aggregate({ where: { nasabah: { bank_sampah_id: unit.id_unit } }, _sum: { berat: true, total_rp: true } }),
      prisma.transaksiSetor.groupBy({ by: ['barang_id'], where: { nasabah: { bank_sampah_id: unit.id_unit } }, _sum: { berat: true } }),
      prisma.user.aggregate({ where: { peran: 'NASABAH', bank_sampah_id: unit.id_unit }, _count: { id_user: true } }),
      prisma.user.groupBy({ by: ['jenis_kelamin'], where: { peran: 'NASABAH', bank_sampah_id: unit.id_unit }, _count: { id_user: true } }),
      prisma.transaksiSetor.count({ where: { nasabah: { bank_sampah_id: unit.id_unit } } }),
      prisma.transaksiTarik.count({ where: { nasabah: { bank_sampah_id: unit.id_unit } } }),
      prisma.transaksiSetor.groupBy({ by: ['metode_bayar'], where: { nasabah: { bank_sampah_id: unit.id_unit } }, _count: { id_setor: true } }),
    ]);

    const unitBarangIds = [...new Set(unitKategoriData.map(item => item.barang_id))];
    const unitBarangs = unitBarangIds.length > 0
      ? await prisma.masterSampah.findMany({
          where: { id_barang: { in: unitBarangIds } },
          select: { id_barang: true, kategori_utama: true },
        })
      : [];
    const unitBarangMap = unitBarangs.reduce((acc, b) => { acc[b.id_barang] = b.kategori_utama; return acc; }, {});

    const unitPerKategori = unitKategoriData.reduce((acc, item) => {
      const kat = unitBarangMap[item.barang_id];
      if (kat) acc[kat] = (acc[kat] || 0) + Number(item._sum.berat || 0);
      return acc;
    }, {});

    const unitPerTipe = unitTipeSummary.reduce((acc, item) => {
      if (item.tipe_setoran) acc[item.tipe_setoran] = (acc[item.tipe_setoran] || 0) + Number(item._sum.berat || 0);
      return acc;
    }, {});

    const unitTotalNasabah = unitNasabahCount._count.id_user || 0;
    const unitGenderBreakdown = unitGenderCount.reduce((acc, item) => {
      const count = item._count.id_user || 0;
      acc[item.jenis_kelamin] = {
        jumlah: count,
        persen: unitTotalNasabah > 0 ? (count / unitTotalNasabah * 100).toFixed(2) : '0.00'
      };
      return acc;
    }, {});

    const unitMetodeBayar = unitMetodeBayarData.reduce((acc, item) => {
      acc[item.metode_bayar] = item._count.id_setor || 0;
      return acc;
    }, {});

    return {
      unit_id: unit.id_unit,
      nama_unit: unit.nama_unit,
      total_kg: Number(unitTotalSetor._sum.berat || 0),
      total_rp: Number(unitTotalSetor._sum.total_rp || 0),
      per_tipe: unitPerTipe,
      per_kategori: unitPerKategori,
      total_nasabah: unitTotalNasabah,
      gender_breakdown: unitGenderBreakdown,
      total_transaksi_setor: unitSetorCount || 0,
      total_transaksi_tarik: unitTarikCount || 0,
      transaksi_metode_bayar: unitMetodeBayar,
    };
  }));

  return {
    global: {
      total_kg: Number(globalTotalSetor._sum.berat || 0),
      total_rp: Number(globalTotalSetor._sum.total_rp || 0),
      per_tipe: globalPerTipe,
      per_kategori: globalPerKategori,
      total_nasabah: globalTotalNasabah,
      gender_breakdown: globalGenderBreakdown,
      total_transaksi_setor: globalSetorCount || 0,
      total_transaksi_tarik: globalTarikCount || 0,
      transaksi_metode_bayar: globalMetodeBayar,
    },
    per_unit: perUnit,
  };
},
};