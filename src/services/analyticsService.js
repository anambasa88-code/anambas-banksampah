// src/services/analyticsService.js
import prisma from "../lib/prisma";

// Helper to limit concurrent DB queries and prevent connection pool exhaustion
const MAX_CONCURRENT = 5;

async function runBatched(promises, batchSize = MAX_CONCURRENT) {
  const results = [];
  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
  }
  return results;
}

export const analyticsService = {
  // src/services/analyticsService.js - getNasabahSummary Fixed
  async getNasabahSummary(nasabahId, startDate = null, endDate = null) {
    const whereSetor = { nasabah_id: nasabahId };
    const whereTarik = { nasabah_id: nasabahId };
    const whereDetail = { transaksi: { nasabah_id: nasabahId } };

    if (startDate || endDate) {
      const waktuFilter = {};
      if (startDate) waktuFilter.gte = new Date(`${startDate}T00:00:00.000Z`);
      if (endDate) waktuFilter.lte = new Date(`${endDate}T23:59:59.999Z`);
      whereSetor.waktu = waktuFilter;
      whereTarik.waktu = waktuFilter;
      whereDetail.transaksi.waktu = waktuFilter;
    }

    const [
      tipeSummary,
      totalBerat,
      totalTabung,
      kategoriData,
      setorCount,
      tarikCount,
      metodeBayarData,
      metodeBayarRupiah,
      totalTarikRupiah,
    ] = await runBatched([
      // Per tipe → DetailSetor
      prisma.detailSetor.groupBy({
        by: ["tipe_setoran"],
        where: whereDetail,
        _sum: { berat: true },
      }),
      // Total berat → DetailSetor
      prisma.detailSetor.aggregate({
        where: whereDetail,
        _sum: { berat: true },
      }),
      // Total TABUNG (rupiah) → TransaksiSetor
      prisma.transaksiSetor.aggregate({
        where: { ...whereSetor, metode_bayar: "TABUNG" },
        _sum: { total_rp: true },
      }),
      // Per barang untuk kategori → DetailSetor
      prisma.detailSetor.groupBy({
        by: ["barang_id"],
        where: whereDetail,
        _sum: { berat: true },
      }),
      // Count transaksi setor
      prisma.transaksiSetor.count({ where: whereSetor }),
      // Count transaksi tarik
      prisma.transaksiTarik.count({ where: whereTarik }),
      // Metode bayar count → TransaksiSetor
      prisma.transaksiSetor.groupBy({
        by: ["metode_bayar"],
        where: whereSetor,
        _count: { id_setor: true },
      }),
      // Metode bayar rupiah → TransaksiSetor
      prisma.transaksiSetor.groupBy({
        by: ["metode_bayar"],
        where: whereSetor,
        _sum: { total_rp: true },
      }),
      // Total penarikan
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

    const tabungRp = Number(totalTabung._sum.total_rp || 0);
    const tarikRp = Number(totalTarikRupiah._sum.jumlah_tarik || 0);

    return {
      total_kg: Number(totalBerat._sum.berat || 0),
      total_rp: tabungRp,
      per_tipe: perTipe,
      per_kategori: perKategori,
      total_transaksi_setor: setorCount,
      total_transaksi_tarik: tarikCount,
      transaksi_metode_bayar: metodeBayar,
      perputaran_uang_per_metode: metodeBayarRp,
      total_penarikan_rp: tarikRp,
      saldo_aktif: tabungRp - tarikRp,
      periode: startDate || endDate ? { start: startDate, end: endDate } : null,
    };
  },

  async getPetugasUnitSummary(unitId, options = {}) {
    const { startDate, endDate } = options;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.waktu = {};
      if (startDate)
        dateFilter.waktu.gte = new Date(`${startDate}T00:00:00.000Z`);
      if (endDate) dateFilter.waktu.lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    const detailWhere = {
      transaksi: {
        nasabah: { bank_sampah_id: unitId },
        ...dateFilter,
      },
    };

    const setorWhere = {
      nasabah: { bank_sampah_id: unitId },
      ...dateFilter,
    };

    const tarikWhere = {
      nasabah: { bank_sampah_id: unitId },
      ...dateFilter,
    };

    const [
      tipeSummary,
      totalBerat,
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
    ] = await runBatched([
      // tipe_setoran → detailSetor
      prisma.detailSetor.groupBy({
        by: ["tipe_setoran"],
        where: detailWhere,
        _sum: { berat: true },
      }),
      // total berat → detailSetor
      prisma.detailSetor.aggregate({
        where: detailWhere,
        _sum: { berat: true },
      }),
      // total_rp → transaksiSetor (tetap di sini)
      prisma.transaksiSetor.aggregate({
        where: setorWhere,
        _sum: { total_rp: true },
      }),
      // kategori per barang → detailSetor
      prisma.detailSetor.groupBy({
        by: ["barang_id"],
        where: detailWhere,
        _sum: { berat: true },
      }),
      // nasabah count
      prisma.user.aggregate({
        where: { peran: "NASABAH", bank_sampah_id: unitId },
        _count: { id_user: true },
      }),
      // gender
      prisma.user.groupBy({
        by: ["jenis_kelamin"],
        where: { peran: "NASABAH", bank_sampah_id: unitId },
        _count: { id_user: true },
      }),
      // jumlah transaksi setor
      prisma.transaksiSetor.count({ where: setorWhere }),
      // jumlah transaksi tarik
      prisma.transaksiTarik.count({ where: tarikWhere }),
      // metode bayar count
      prisma.transaksiSetor.groupBy({
        by: ["metode_bayar"],
        where: setorWhere,
        _count: { id_setor: true },
      }),
      // metode bayar rupiah
      prisma.transaksiSetor.groupBy({
        by: ["metode_bayar"],
        where: setorWhere,
        _sum: { total_rp: true },
      }),
      // total penarikan
      prisma.transaksiTarik.aggregate({
        where: tarikWhere,
        _sum: { jumlah_tarik: true },
      }),
      // tabung only
      prisma.transaksiSetor.aggregate({
        where: { ...setorWhere, metode_bayar: "TABUNG" },
        _sum: { total_rp: true },
      }),
      // sampah terkumpul
      this.getSampahTerkumpulPerJenis(unitId, { startDate, endDate }),
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
      total_kg: Number(totalBerat._sum.berat || 0),
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

      const dateFilter = {};
      if (startDate) dateFilter.gte = new Date(`${startDate}T00:00:00.000Z`);
      if (endDate) dateFilter.lte = new Date(`${endDate}T23:59:59.999Z`);

      const hasDateFilter = startDate || endDate;
      const whereSetor = hasDateFilter ? { waktu: dateFilter } : {};
      const whereTarik = hasDateFilter ? { waktu: dateFilter } : {};
      const whereDetail = hasDateFilter
        ? { transaksi: { waktu: dateFilter } }
        : {};

      const formatWeight = (val) => Number(val || 0);

      const [
        globalTipe,
        globalBerat,
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
        globalSampahTerkumpul,
      ] = await runBatched([
        // tipe_setoran → DetailSetor
        prisma.detailSetor.groupBy({
          by: ["tipe_setoran"],
          where: whereDetail,
          _sum: { berat: true },
        }),
        // total berat → DetailSetor
        prisma.detailSetor.aggregate({
          where: whereDetail,
          _sum: { berat: true },
        }),
        // total_rp → TransaksiSetor
        prisma.transaksiSetor.aggregate({
          where: whereSetor,
          _sum: { total_rp: true },
        }),
        // kategori per barang → DetailSetor
        prisma.detailSetor.groupBy({
          by: ["barang_id"],
          where: whereDetail,
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
        this.getGlobalSampahTerkumpul(filters),
      ]);

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

      // Per unit - process sequentially to prevent connection pool exhaustion
      const perUnitData = [];
      for (const unit of units) {
          const unitWhereSetor = {
            nasabah: { bank_sampah_id: unit.id_unit },
            ...whereSetor,
          };
          const unitWhereTarik = {
            nasabah: { bank_sampah_id: unit.id_unit },
            ...whereTarik,
          };
          const unitWhereDetail = {
            transaksi: {
              nasabah: { bank_sampah_id: unit.id_unit },
              ...(hasDateFilter ? { waktu: dateFilter } : {}),
            },
          };

          const [
            uTipe,
            uBerat,
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
          ] = await runBatched([
            prisma.detailSetor.groupBy({
              by: ["tipe_setoran"],
              where: unitWhereDetail,
              _sum: { berat: true },
            }),
            prisma.detailSetor.aggregate({
              where: unitWhereDetail,
              _sum: { berat: true },
            }),
            prisma.transaksiSetor.aggregate({
              where: unitWhereSetor,
              _sum: { total_rp: true },
            }),
            prisma.detailSetor.groupBy({
              by: ["barang_id"],
              where: unitWhereDetail,
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

          perUnitData.push({
            unit_id: unit.id_unit,
            nama_unit: unit.nama_unit,
            total_kg: formatWeight(uBerat._sum.berat),
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
          });
      }

      return {
        global: {
          total_kg: formatWeight(globalBerat._sum.berat),
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

    const where = {
      transaksi: { nasabah: { bank_sampah_id: unitId } },
    };

    if (startDate || endDate) {
      where.transaksi.waktu = {};
      if (startDate)
        where.transaksi.waktu.gte = new Date(`${startDate}T00:00:00.000Z`);
      if (endDate)
        where.transaksi.waktu.lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    const result = await prisma.detailSetor.groupBy({
      by: ["barang_id", "nama_barang_snapshot"],
      where,
      _sum: { berat: true },
      _count: { id: true },
    });

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
      kategori_utama: kategoriMap[r.barang_id] || null,
      total_berat: Number(r._sum.berat || 0),
      total_transaksi: r._count.id,
    }));
  },

  async getGlobalSampahTerkumpul(options = {}) {
    const { startDate, endDate } = options;

    const where = {};
    if (startDate || endDate) {
      where.transaksi = { waktu: {} };
      if (startDate)
        where.transaksi.waktu.gte = new Date(`${startDate}T00:00:00.000Z`);
      if (endDate)
        where.transaksi.waktu.lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    const result = await prisma.detailSetor.groupBy({
      by: ["barang_id", "nama_barang_snapshot"],
      where,
      _sum: { berat: true },
      _count: { id: true },
    });

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
      total_transaksi: r._count.id,
    }));
  },
};
