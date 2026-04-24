// src/services/reportService.js
import prisma from "../lib/prisma";

export const reportService = {
  async getNasabahHistory(nasabahId, type = "SEMUA", page = 1, limit = 20) {
    const id = parseInt(nasabahId);
    const skip = (page - 1) * limit;
    let history = [];
    let totalSetor = 0;
    let totalTarik = 0;

    // 1. Ambil data Setoran jika type SEMUA atau SETOR
    if (type === "SEMUA" || type === "SETOR") {
      const setoran = await prisma.transaksiSetor.findMany({
        where: { nasabah_id: id },
        orderBy: { waktu: "desc" },
        include: {
          detail_items: {
            include: {
              barang: { select: { nama_barang: true } },
            },
          },
        },
        skip: type === "SETOR" ? skip : 0,
        take: type === "SETOR" ? limit : undefined,
      });

      totalSetor = await prisma.transaksiSetor.count({
        where: { nasabah_id: id },
      });

      history.push(
        ...setoran.map((item) => ({
          id_setor: item.id_setor,
          jenis: "SETOR",
          waktu: item.waktu,
          total_rp: Number(item.total_rp),
          catatan_petugas: item.catatan_petugas,
          metode_bayar: item.metode_bayar,
          tipe_setoran: item.tipe_setoran,
          detail_items: item.detail_items.map((d) => ({
            nama_barang_snapshot:
              d.nama_barang_snapshot || d.barang?.nama_barang,
            berat: Number(d.berat),
            harga_deal: Number(d.harga_deal),
            total_rp: Number(d.total_rp),
            tipe_setoran: d.tipe_setoran,
            kategori_utama: d.barang?.kategori_utama || 'LAINNYA',
          })),
        })),
      );
    }

    // 2. Ambil data Penarikan jika type SEMUA atau TARIK
    if (type === "SEMUA" || type === "TARIK") {
      const penarikan = await prisma.transaksiTarik.findMany({
        where: { nasabah_id: id },
        orderBy: { waktu: "desc" },
        skip: type === "TARIK" ? skip : 0,
        take: type === "TARIK" ? limit : undefined,
      });

      totalTarik = await prisma.transaksiTarik.count({
        where: { nasabah_id: id },
      });

      // Transform data tarik
      history.push(
        ...penarikan.map((item) => ({
          id: item.id_tarik,
          jenis: "TARIK",
          waktu: item.waktu,
          catatan_tarik: item.catatan_tarik,
          jumlah_tarik: Number(item.jumlah_tarik),
          status: item.status,
        })),
      );
    }

    // 3. Urutkan berdasarkan waktu terbaru
    history.sort((a, b) => new Date(b.waktu) - new Date(a.waktu));

    // 4. Hitung total untuk pagination
    let total = 0;
    if (type === "SEMUA") {
      total = totalSetor + totalTarik;
    } else if (type === "SETOR") {
      total = totalSetor;
    } else if (type === "TARIK") {
      total = totalTarik;
    }

    // 5. Pagination untuk SEMUA (slice setelah sort)
    if (type === "SEMUA") {
      history = history.slice(skip, skip + limit);
    }

    return {
      data: history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
