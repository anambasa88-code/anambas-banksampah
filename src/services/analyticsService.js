// src/services/analyticsService.js
import prisma from "../lib/prisma";

export const analyticsService = {
  // src/services/analyticsService.js - getNasabahSummary Fixed
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

    const [
      tipeSummary,
      totalSetor,
      totalTabung,
      kategoriData,
      setorCount,
      tarikCount,
      metodeBayarData,
      metodeBayarRupiah,
      totalTarikRupiah,
    ] = await Promise.all([
      // Per tipe setoran (semua)
      prisma.transaksiSetor.groupBy({
        by: ["tipe_setoran"],
        where: whereSetor,
        _sum: { berat: true },
      }),
      // Total setor (semua - untuk total kg)
      prisma.transaksiSetor.aggregate({
        where: whereSetor,
        _sum: { berat: true, total_rp: true },
      }),
      // Total TABUNG aja (untuk saldo)
      prisma.transaksiSetor.aggregate({
        where: { ...whereSetor, metode_bayar: "TABUNG" },
        _sum: { total_rp: true },
      }),
      // Per barang untuk kategori
      prisma.transaksiSetor.groupBy({
        by: ["barang_id"],
        where: whereSetor,
        _sum: { berat: true },
      }),
      // Count transaksi
      prisma.transaksiSetor.count({ where: whereSetor }),
      prisma.transaksiTarik.count({ where: whereTarik }),
      // Breakdown metode bayar (jumlah transaksi)
      prisma.transaksiSetor.groupBy({
        by: ["metode_bayar"],
        where: whereSetor,
        _count: { id_setor: true },
      }),
      // Breakdown metode bayar (rupiah)
      prisma.transaksiSetor.groupBy({
        by: ["metode_bayar"],
        where: whereSetor,
        _sum: { total_rp: true },
      }),

      prisma.transaksiTarik.aggregate({
        where: whereTarik,
        _sum: { jumlah_tarik: true },
      }),
    ]);

    const barangIds = [...new Set(kategoriData.map((item) => item.barang_id))];
    const barangs =
      barangIds.length > 0
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
      if (item.tipe_setoran)
        acc[item.tipe_setoran] =
          (acc[item.tipe_setoran] || 0) + Number(item._sum.berat || 0);
      return acc;
    }, {});

    const metodeBayar = metodeBayarData.reduce((acc, item) => {
      acc[item.metode_bayar] = item._count.id_setor || 0;
      return acc;
    }, {});

    const metodeBayarRp = metodeBayarRupiah.reduce((acc, item) => {
      acc[item.metode_bayar] = Number(item._sum.total_rp || 0);
      return acc;
    }, {});

    return {
      total_kg: Number(totalSetor._sum.berat || 0),
      total_rp: Number(totalTabung._sum.total_rp || 0), // PERBAIKAN: Hanya TABUNG
      per_tipe: perTipe,
      per_kategori: perKategori,
      total_transaksi_setor: setorCount,
      total_transaksi_tarik: tarikCount,
      transaksi_metode_bayar: metodeBayar,
      perputaran_uang_per_metode: metodeBayarRp, // Rupiah per metode (TABUNG, JUAL_LANGSUNG)
      total_penarikan_rp: Number(totalTarikRupiah._sum.jumlah_tarik || 0),
      saldo_aktif:
        Number(totalTabung._sum.total_rp || 0) -
        Number(totalTarikRupiah._sum.jumlah_tarik || 0),
      periode: startDate || endDate ? { start: startDate, end: endDate } : null,
    };
  },

  async getPetugasUnitSummary(unitId) {
    const [
      tipeSummary,
      totalSetor,
      kategoriData,
      nasabahCount,
      genderCount,
      transaksiSetorCount,
      transaksiTarikCount,
      metodeBayarData,
      metodeBayarRupiah,
      totalTarikRupiah,
      totalTabungOnly,
    ] = await Promise.all([
      // per tipe setoran (berat)
      prisma.transaksiSetor.groupBy({
        by: ["tipe_setoran"],
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
        by: ["barang_id"],
        where: { nasabah: { bank_sampah_id: unitId } },
        _sum: { berat: true },
      }),
      // total nasabah unit
      prisma.user.aggregate({
        where: { peran: "NASABAH", bank_sampah_id: unitId },
        _count: { id_user: true },
      }),
      // gender nasabah unit
      prisma.user.groupBy({
        by: ["jenis_kelamin"],
        where: { peran: "NASABAH", bank_sampah_id: unitId },
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
      // breakdown metode bayar setor (jumlah transaksi)
      prisma.transaksiSetor.groupBy({
        by: ["metode_bayar"],
        where: { nasabah: { bank_sampah_id: unitId } },
        _count: { id_setor: true },
      }),
      // breakdown metode bayar setor (rupiah)
      prisma.transaksiSetor.groupBy({
        by: ["metode_bayar"],
        where: { nasabah: { bank_sampah_id: unitId } },
        _sum: { total_rp: true },
      }),
      // Total penarikan rupiah
      prisma.transaksiTarik.aggregate({
        where: { nasabah: { bank_sampah_id: unitId } },
        _sum: { jumlah_tarik: true },
      }),
      // Total tabung only
      prisma.transaksiSetor.aggregate({
        where: { nasabah: { bank_sampah_id: unitId }, metode_bayar: "TABUNG" },
        _sum: { total_rp: true },
      }),
    ]);

    // Mapping kategori (sama seperti sebelumnya)
    const barangIds = [...new Set(kategoriData.map((item) => item.barang_id))];
    const barangs =
      barangIds.length > 0
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
      if (item.tipe_setoran)
        acc[item.tipe_setoran] =
          (acc[item.tipe_setoran] || 0) + Number(item._sum.berat || 0);
      return acc;
    }, {});

    const totalNasabah = nasabahCount._count.id_user || 0;
    const genderBreakdown = genderCount.reduce((acc, item) => {
      const count = item._count.id_user || 0;
      acc[item.jenis_kelamin] = {
        jumlah: count,
        persen:
          totalNasabah > 0 ? ((count / totalNasabah) * 100).toFixed(2) : "0.00",
      };
      return acc;
    }, {});

    const metodeBayar = metodeBayarData.reduce((acc, item) => {
      acc[item.metode_bayar] = item._count.id_setor || 0;
      return acc;
    }, {});

    const metodeBayarRp = metodeBayarRupiah.reduce((acc, item) => {
      acc[item.metode_bayar] = Number(item._sum.total_rp || 0);
      return acc;
    }, {});

    return {
      total_kg: Number(totalSetor._sum.berat || 0),
      total_rp: Number(totalSetor._sum.total_rp || 0),
      per_tipe: perTipe,
      per_kategori: perKategori,
      total_nasabah: totalNasabah,
      gender_breakdown: genderBreakdown, // { LAKI_LAKI: { jumlah: 234, persen: "58.50" }, ... }
      total_transaksi_setor: transaksiSetorCount || 0,
      total_transaksi_tarik: transaksiTarikCount || 0,
      transaksi_metode_bayar: metodeBayar, // { TABUNG: 120, JUAL_LANGSUNG: 45 }
      perputaran_uang_per_metode: metodeBayarRp, // { TABUNG: 5000000, JUAL_LANGSUNG: 2000000 }
      total_penarikan_rp: Number(totalTarikRupiah._sum.jumlah_tarik || 0), // TAMBAH INI
      saldo_aktif:
        Number(totalTabungOnly._sum.total_rp || 0) -
        Number(totalTarikRupiah._sum.jumlah_tarik|| 0), // TAMBAH INI
    };
  },

  async getAdminGlobalSummary() {
    try {
      const [
        globalTipe,
        globalTotal,
        globalKategori,
        globalNasabah,
        globalGender,
        globalSetor,
        globalTarik,
        globalMetode,
        globalMetodeRupiah,
        globalTarikRupiah,
        globalTabungOnly,
        units,
      ] = await Promise.all([
        prisma.transaksiSetor.groupBy({
          by: ["tipe_setoran"],
          _sum: { berat: true },
        }),
        prisma.transaksiSetor.aggregate({
          _sum: { berat: true, total_rp: true },
        }),
        prisma.transaksiSetor.groupBy({
          by: ["barang_id"],
          _sum: { berat: true },
        }),
        prisma.user.count({ where: { peran: "NASABAH" } }),
        prisma.user.groupBy({
          by: ["jenis_kelamin"],
          where: { peran: "NASABAH" },
          _count: { id_user: true },
        }),
        prisma.transaksiSetor.count(),
        prisma.transaksiTarik.count(),
        prisma.transaksiSetor.groupBy({
          by: ["metode_bayar"],
          _count: { id_setor: true },
        }),
        prisma.transaksiSetor.groupBy({
          by: ["metode_bayar"],
          _sum: { total_rp: true },
        }),
        prisma.transaksiTarik.aggregate({ _sum: { jumlah_tarik: true } }),
        // Total tabung only global
        prisma.transaksiSetor.aggregate({
          where: { metode_bayar: "TABUNG" },
          _sum: { total_rp: true },
        }),
        prisma.unitBankSampah.findMany({
          select: { id_unit: true, nama_unit: true },
        }),
      ]);

      // 2. Optimasi Master Sampah (Cukup 1x query untuk semua)
      const allBarangIds = [
        ...new Set(globalKategori.map((item) => item.barang_id)),
      ];
      const masterSampah =
        allBarangIds.length > 0
          ? await prisma.masterSampah.findMany({
              where: { id_barang: { in: allBarangIds } },
              select: { id_barang: true, kategori_utama: true },
            })
          : [];
      const barangMap = Object.fromEntries(
        masterSampah.map((b) => [b.id_barang, b.kategori_utama]),
      );

      // 3. Mapping Data Global (Gunakan Number() untuk Decimal Prisma agar aman di JSON)
      const formatWeight = (val) => Number(val || 0);

      const globalPerKategori = globalKategori.reduce((acc, item) => {
        const kat = barangMap[item.barang_id];
        if (kat) acc[kat] = (acc[kat] || 0) + formatWeight(item._sum.berat);
        return acc;
      }, {});

      const globalPerTipe = Object.fromEntries(
        globalTipe.map((i) => [i.tipe_setoran, formatWeight(i._sum.berat)]),
      );

      const globalGenderBreakdown = Object.fromEntries(
        globalGender.map((i) => [
          i.jenis_kelamin,
          {
            jumlah: i._count.id_user,
            persen:
              globalNasabah > 0
                ? ((i._count.id_user / globalNasabah) * 100).toFixed(2)
                : "0.00",
          },
        ]),
      );

      const perUnitData = await Promise.all(
        units.map(async (unit) => {
          const [
            uTipe,
            uTotal,
            uKategori,
            uNasabahCount,
            uGender,
            uSetorCount,
            uTarikCount,
            uMetode,
            uMetodeRupiah,
            uTarikRupiah,
            uTabungOnly,
          ] = await Promise.all([
            // Per tipe setoran
            prisma.transaksiSetor.groupBy({
              by: ["tipe_setoran"],
              where: { nasabah: { bank_sampah_id: unit.id_unit } },
              _sum: { berat: true },
            }),
            // Total setor
            prisma.transaksiSetor.aggregate({
              where: { nasabah: { bank_sampah_id: unit.id_unit } },
              _sum: { berat: true, total_rp: true },
            }),
            // Per barang untuk kategori
            prisma.transaksiSetor.groupBy({
              by: ["barang_id"],
              where: { nasabah: { bank_sampah_id: unit.id_unit } },
              _sum: { berat: true },
            }),
            // Total nasabah
            prisma.user.count({
              where: { peran: "NASABAH", bank_sampah_id: unit.id_unit },
            }),
            // Gender breakdown
            prisma.user.groupBy({
              by: ["jenis_kelamin"],
              where: { peran: "NASABAH", bank_sampah_id: unit.id_unit },
              _count: { id_user: true },
            }),
            // Jumlah transaksi setor
            prisma.transaksiSetor.count({
              where: { nasabah: { bank_sampah_id: unit.id_unit } },
            }),
            // Jumlah transaksi tarik
            prisma.transaksiTarik.count({
              where: { nasabah: { bank_sampah_id: unit.id_unit } },
            }),
            // Metode bayar (jumlah transaksi)
            prisma.transaksiSetor.groupBy({
              by: ["metode_bayar"],
              where: { nasabah: { bank_sampah_id: unit.id_unit } },
              _count: { id_setor: true },
            }),
            // Metode bayar (rupiah)
            prisma.transaksiSetor.groupBy({
              by: ["metode_bayar"],
              where: { nasabah: { bank_sampah_id: unit.id_unit } },
              _sum: { total_rp: true },
            }),
            // Total penarikan rupiah per unit
            prisma.transaksiTarik.aggregate({
              where: { nasabah: { bank_sampah_id: unit.id_unit } },
              _sum: { jumlah_tarik: true },
            }),
            // Total tabung only per unit
            prisma.transaksiSetor.aggregate({
              where: {
                nasabah: { bank_sampah_id: unit.id_unit },
                metode_bayar: "TABUNG",
              },
              _sum: { total_rp: true },
            }),
          ]);

          // Mapping per tipe
          const uPerTipe = uTipe.reduce((acc, item) => {
            if (item.tipe_setoran)
              acc[item.tipe_setoran] = formatWeight(item._sum.berat);
            return acc;
          }, {});

          // Mapping per kategori
          const uPerKategori = uKategori.reduce((acc, item) => {
            const kat = barangMap[item.barang_id];
            if (kat) acc[kat] = (acc[kat] || 0) + formatWeight(item._sum.berat);
            return acc;
          }, {});

          // Mapping gender
          const uGenderBreakdown = uGender.reduce((acc, item) => {
            const count = item._count.id_user || 0;
            acc[item.jenis_kelamin] = {
              jumlah: count,
              persen:
                uNasabahCount > 0
                  ? ((count / uNasabahCount) * 100).toFixed(2)
                  : "0.00",
            };
            return acc;
          }, {});

          // Mapping metode bayar
          const uMetodeBayar = uMetode.reduce((acc, item) => {
            acc[item.metode_bayar] = item._count.id_setor || 0;
            return acc;
          }, {});

          const uMetodeBayarRp = uMetodeRupiah.reduce((acc, item) => {
            acc[item.metode_bayar] = formatWeight(item._sum.total_rp);
            return acc;
          }, {});

          return {
            unit_id: unit.id_unit,
            nama_unit: unit.nama_unit,
            total_kg: formatWeight(uTotal._sum.berat),
            total_rp: formatWeight(uTotal._sum.total_rp),
            total_nasabah: uNasabahCount,
            total_transaksi_setor: uSetorCount,
            total_transaksi_tarik: uTarikCount,
            per_tipe: uPerTipe,
            per_kategori: uPerKategori,
            gender_breakdown: uGenderBreakdown,
            transaksi_metode_bayar: uMetodeBayar,
            perputaran_uang_per_metode: uMetodeBayarRp,
            total_penarikan_rp: formatWeight(uTarikRupiah._sum.jumlah_tarik),
            saldo_aktif:
              formatWeight(uTabungOnly._sum.total_rp) -
              formatWeight(uTarikRupiah._sum.jumlah_tarik),
          };
        }),
      );

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
          transaksi_metode_bayar: Object.fromEntries(
            globalMetode.map((i) => [i.metode_bayar, i._count.id_setor]),
          ),
          perputaran_uang_per_metode: Object.fromEntries(
            globalMetodeRupiah.map((i) => [
              i.metode_bayar,
              formatWeight(i._sum.total_rp),
            ]),
          ),
          total_penarikan_rp: formatWeight(globalTarikRupiah._sum.jumlah_tarik), // TAMBAH INI
          saldo_aktif:
            formatWeight(globalTabungOnly._sum.total_rp) -
            formatWeight(globalTarikRupiah._sum.jumlah_tarik), // TAMBAH INI
        },
        per_unit: perUnitData,
      };
    } catch (error) {
      console.error("Critical Analytics Error:", error);
      throw error;
    }
  },
};
