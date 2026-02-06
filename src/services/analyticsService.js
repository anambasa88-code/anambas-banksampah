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

  async getPetugasUnitSummary(unitId, options = {}) {
    const { startDate, endDate } = options;

    // Menyiapkan filter tanggal jika ada input dari frontend
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.waktu = {};
      if (startDate) {
        dateFilter.waktu.gte = new Date(`${startDate}T00:00:00.000Z`);
      }
      if (endDate) {
        dateFilter.waktu.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

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
      sampahTerkumpul,
    ] = await Promise.all([
      // per tipe setoran (berat)
      prisma.transaksiSetor.groupBy({
        by: ["tipe_setoran"],
        where: {
          nasabah: { bank_sampah_id: unitId },
          ...dateFilter,
        },
        _sum: { berat: true },
      }),
      // total setor
      prisma.transaksiSetor.aggregate({
        where: {
          nasabah: { bank_sampah_id: unitId },
          ...dateFilter,
        },
        _sum: { berat: true, total_rp: true },
      }),
      // per barang untuk kategori
      prisma.transaksiSetor.groupBy({
        by: ["barang_id"],
        where: {
          nasabah: { bank_sampah_id: unitId },
          ...dateFilter,
        },
        _sum: { berat: true },
      }),
      // total nasabah unit (Total nasabah biasanya tidak difilter tanggal agar tahu akumulasi)
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
        where: {
          nasabah: { bank_sampah_id: unitId },
          ...dateFilter,
        },
      }),
      // jumlah transaksi tarik
      prisma.transaksiTarik.count({
        where: {
          nasabah: { bank_sampah_id: unitId },
          ...dateFilter,
        },
      }),
      // breakdown metode bayar setor (jumlah transaksi)
      prisma.transaksiSetor.groupBy({
        by: ["metode_bayar"],
        where: {
          nasabah: { bank_sampah_id: unitId },
          ...dateFilter,
        },
        _count: { id_setor: true },
      }),
      // breakdown metode bayar setor (rupiah)
      prisma.transaksiSetor.groupBy({
        by: ["metode_bayar"],
        where: {
          nasabah: { bank_sampah_id: unitId },
          ...dateFilter,
        },
        _sum: { total_rp: true },
      }),
      // Total penarikan rupiah
      prisma.transaksiTarik.aggregate({
        where: {
          nasabah: { bank_sampah_id: unitId },
          ...dateFilter,
        },
        _sum: { jumlah_tarik: true },
      }),
      // Total tabung only
      prisma.transaksiSetor.aggregate({
        where: {
          nasabah: { bank_sampah_id: unitId },
          metode_bayar: "TABUNG",
          ...dateFilter,
        },
        _sum: { total_rp: true },
      }),
      // Sampah terkumpul per jenis (Sudah mendukung filter tanggal di dalamnya)
      this.getSampahTerkumpulPerJenis(unitId, { startDate, endDate }),
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
      gender_breakdown: genderBreakdown,
      total_transaksi_setor: transaksiSetorCount || 0,
      total_transaksi_tarik: transaksiTarikCount || 0,
      transaksi_metode_bayar: metodeBayar,
      perputaran_uang_per_metode: metodeBayarRp,
      total_penarikan_rp: Number(totalTarikRupiah._sum.jumlah_tarik || 0),
      saldo_aktif:
        Number(totalTabungOnly._sum.total_rp || 0) -
        Number(totalTarikRupiah._sum.jumlah_tarik || 0),
      sampah_terkumpul: sampahTerkumpul,
    };
  },

  async getAdminGlobalSummary(filters = {}) {
    try {
      const { startDate, endDate } = filters;

      // 1. Setup Filter Tanggal Reusable
      const dateFilter = {};
      if (startDate) dateFilter.gte = new Date(`${startDate}T00:00:00.000Z`);
      if (endDate) dateFilter.lte = new Date(`${endDate}T23:59:59.999Z`);

      const hasDateFilter = startDate || endDate;
      const whereSetor = hasDateFilter ? { waktu: dateFilter } : {};
      const whereTarik = hasDateFilter ? { waktu: dateFilter } : {};

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
        globalSampahTerkumpul, // Data Baru
      ] = await Promise.all([
        prisma.transaksiSetor.groupBy({
          by: ["tipe_setoran"],
          where: whereSetor,
          _sum: { berat: true },
        }),
        prisma.transaksiSetor.aggregate({
          where: whereSetor,
          _sum: { berat: true, total_rp: true },
        }),
        prisma.transaksiSetor.groupBy({
          by: ["barang_id"],
          where: whereSetor,
          _sum: { berat: true },
        }),
        prisma.user.count({ where: { peran: "NASABAH" } }),
        prisma.user.groupBy({
          by: ["jenis_kelamin"],
          where: { peran: "NASABAH" },
          _count: { id_user: true },
        }),
        prisma.transaksiSetor.count({ where: whereSetor }),
        prisma.transaksiTarik.count({ where: whereTarik }),
        prisma.transaksiSetor.groupBy({
          by: ["metode_bayar"],
          where: whereSetor,
          _count: { id_setor: true },
        }),
        prisma.transaksiSetor.groupBy({
          by: ["metode_bayar"],
          where: whereSetor,
          _sum: { total_rp: true },
        }),
        prisma.transaksiTarik.aggregate({
          where: whereTarik,
          _sum: { jumlah_tarik: true },
        }),
        prisma.transaksiSetor.aggregate({
          where: { ...whereSetor, metode_bayar: "TABUNG" },
          _sum: { total_rp: true },
        }),
        prisma.unitBankSampah.findMany({
          select: { id_unit: true, nama_unit: true },
        }),
        this.getGlobalSampahTerkumpul(filters), // Panggil Helper Baru
      ]);

      // 2. Optimasi Master Sampah Mapping
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

      const formatWeight = (val) => Number(val || 0);

      // 3. Mapping Data Per Unit
      const perUnitData = await Promise.all(
        units.map(async (unit) => {
          const unitWhereSetor = {
            nasabah: { bank_sampah_id: unit.id_unit },
            ...whereSetor,
          };
          const unitWhereTarik = {
            nasabah: { bank_sampah_id: unit.id_unit },
            ...whereTarik,
          };

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
            prisma.transaksiSetor.groupBy({
              by: ["tipe_setoran"],
              where: unitWhereSetor,
              _sum: { berat: true },
            }),
            prisma.transaksiSetor.aggregate({
              where: unitWhereSetor,
              _sum: { berat: true, total_rp: true },
            }),
            prisma.transaksiSetor.groupBy({
              by: ["barang_id"],
              where: unitWhereSetor,
              _sum: { berat: true },
            }),
            prisma.user.count({
              where: { peran: "NASABAH", bank_sampah_id: unit.id_unit },
            }),
            prisma.user.groupBy({
              by: ["jenis_kelamin"],
              where: { peran: "NASABAH", bank_sampah_id: unit.id_unit },
              _count: { id_user: true },
            }),
            prisma.transaksiSetor.count({ where: unitWhereSetor }),
            prisma.transaksiTarik.count({ where: unitWhereTarik }),
            prisma.transaksiSetor.groupBy({
              by: ["metode_bayar"],
              where: unitWhereSetor,
              _count: { id_setor: true },
            }),
            prisma.transaksiSetor.groupBy({
              by: ["metode_bayar"],
              where: unitWhereSetor,
              _sum: { total_rp: true },
            }),
            prisma.transaksiTarik.aggregate({
              where: unitWhereTarik,
              _sum: { jumlah_tarik: true },
            }),
            prisma.transaksiSetor.aggregate({
              where: { ...unitWhereSetor, metode_bayar: "TABUNG" },
              _sum: { total_rp: true },
            }),
          ]);

          return {
            unit_id: unit.id_unit,
            nama_unit: unit.nama_unit,
            total_kg: formatWeight(uTotal._sum.berat),
            total_rp: formatWeight(uTotal._sum.total_rp),
            total_nasabah: uNasabahCount,
            total_transaksi_setor: uSetorCount,
            total_transaksi_tarik: uTarikCount,
            per_tipe: Object.fromEntries(
              uTipe.map((i) => [i.tipe_setoran, formatWeight(i._sum.berat)]),
            ),
            per_kategori: uKategori.reduce((acc, item) => {
              const kat = barangMap[item.barang_id];
              if (kat)
                acc[kat] = (acc[kat] || 0) + formatWeight(item._sum.berat);
              return acc;
            }, {}),
            gender_breakdown: Object.fromEntries(
              uGender.map((i) => [
                i.jenis_kelamin,
                {
                  jumlah: i._count.id_user,
                  persen:
                    uNasabahCount > 0
                      ? ((i._count.id_user / uNasabahCount) * 100).toFixed(2)
                      : "0.00",
                },
              ]),
            ),
            transaksi_metode_bayar: Object.fromEntries(
              uMetode.map((i) => [i.metode_bayar, i._count.id_setor]),
            ),
            perputaran_uang_per_metode: Object.fromEntries(
              uMetodeRupiah.map((i) => [
                i.metode_bayar,
                formatWeight(i._sum.total_rp),
              ]),
            ),
            total_penarikan_rp: formatWeight(uTarikRupiah._sum.jumlah_tarik),
            saldo_aktif:
              formatWeight(uTabungOnly._sum.total_rp) -
              formatWeight(uTarikRupiah._sum.jumlah_tarik),
          };
        }),
      );

      // 4. Final Result
      return {
        global: {
          total_kg: formatWeight(globalTotal._sum.berat),
          total_rp: formatWeight(globalTotal._sum.total_rp),
          per_tipe: Object.fromEntries(
            globalTipe.map((i) => [i.tipe_setoran, formatWeight(i._sum.berat)]),
          ),
          per_kategori: globalKategori.reduce((acc, item) => {
            const kat = barangMap[item.barang_id];
            if (kat) acc[kat] = (acc[kat] || 0) + formatWeight(item._sum.berat);
            return acc;
          }, {}),
          total_nasabah: globalNasabah,
          gender_breakdown: Object.fromEntries(
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
          ),
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
          total_penarikan_rp: formatWeight(globalTarikRupiah._sum.jumlah_tarik),
          saldo_aktif:
            formatWeight(globalTabungOnly._sum.total_rp) -
            formatWeight(globalTarikRupiah._sum.jumlah_tarik),

          // --- PENAMBAHAN DATA BARU DI SINI ---
          sampah_terkumpul: globalSampahTerkumpul,
        },
        per_unit: perUnitData,
      };
    } catch (error) {
      console.error("Critical Analytics Error:", error);
      throw error;
    }
  },

  async getSampahTerkumpulPerJenis(unitId, options = {}) {
    const { startDate, endDate } = options;

    // Samakan logic filter tanggal dengan fungsi utama agar akurat
    const where = {
      nasabah: { bank_sampah_id: unitId },
    };

    if (startDate || endDate) {
      where.waktu = {};
      if (startDate) where.waktu.gte = new Date(`${startDate}T00:00:00.000Z`);
      if (endDate) where.waktu.lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    const result = await prisma.transaksiSetor.groupBy({
      by: ["barang_id", "nama_barang_snapshot"],
      where,
      _sum: { berat: true },
      _count: { id_setor: true },
    });

    // Ambil kategori dari master sampah
    const barangIds = result.map((r) => r.barang_id);
    const masterSampah = await prisma.masterSampah.findMany({
      where: { id_barang: { in: barangIds } },
      select: { id_barang: true, kategori_utama: true },
    });

    const kategoriMap = masterSampah.reduce((acc, item) => {
      acc[item.id_barang] = item.kategori_utama;
      return acc;
    }, {}); // INI HARUS DI DALAM FUNGSI, SEBELUM return

    return result.map((r) => ({
      barang_id: r.barang_id,
      nama_sampah: r.nama_barang_snapshot,
      kategori_utama: kategoriMap[r.barang_id] || null,
      total_berat: Number(r._sum.berat || 0),
      total_transaksi: r._count.id_setor,
    }));
  },

  async getGlobalSampahTerkumpul(options = {}) {
    const { startDate, endDate } = options;

    const where = {};
    if (startDate || endDate) {
      where.waktu = {};
      if (startDate) where.waktu.gte = new Date(`${startDate}T00:00:00.000Z`);
      if (endDate) where.waktu.lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    // Agregasi global (semua unit)
    const result = await prisma.transaksiSetor.groupBy({
      by: ["barang_id", "nama_barang_snapshot"],
      where,
      _sum: { berat: true },
      _count: { id_setor: true },
    });

    // Ambil kategori dari master sampah untuk mapping
    const barangIds = result.map((r) => r.barang_id);
    const masterSampah = await prisma.masterSampah.findMany({
      where: { id_barang: { in: barangIds } },
      select: { id_barang: true, kategori_utama: true },
    });

    const kategoriMap = masterSampah.reduce((acc, item) => {
      acc[item.id_barang] = item.kategori_utama;
      return acc;
    }, {});

    return result.map((r) => ({
      barang_id: r.barang_id,
      nama_sampah: r.nama_barang_snapshot,
      kategori_utama: kategoriMap[r.barang_id] || "LAINNYA",
      total_berat: Number(r._sum.berat || 0),
      total_transaksi: r._count.id_setor,
    }));
  },
};
