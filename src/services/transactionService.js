// src/services/transactionService.js
import prisma from "../lib/prisma";
import { logService } from "./logService";
import { validateHarga } from "./masterSampahService";

export const transactionService = {
  async createSetoran(data, actorRole, actorId, actorBankSampahId) {
    const {
      nasabah_id,
      petugas_id,
      barang_id,
      berat,
      harga_deal,
      catatan_petugas = "",
      tipe_setoran = "COMMUNITY",
      metode_bayar = "TABUNG",
    } = data;

    // Security: Petugas hanya boleh setor untuk nasabah di unitnya sendiri
    const nasabah = await prisma.user.findUnique({
      where: { id_user: nasabah_id },
      select: { bank_sampah_id: true, peran: true, is_blocked: true },
    });

    if (!nasabah || nasabah.peran !== "NASABAH")
      throw new Error("Nasabah tidak valid");
    if (nasabah.is_blocked) throw new Error("Nasabah sedang diblokir");
    if (
      actorRole === "PETUGAS" &&
      nasabah.bank_sampah_id !== actorBankSampahId
    ) {
      throw new Error(
        "Petugas hanya boleh setor untuk nasabah di unit sendiri",
      );
    }

    await validateHarga(barang_id, harga_deal);

    const barang = await prisma.masterSampah.findUnique({
      where: { id_barang: barang_id },
      select: { nama_barang: true, batas_bawah: true, batas_atas: true },
    });

    const total_rp = parseFloat(berat) * parseFloat(harga_deal);

    const prefix = metode_bayar === "JUAL_LANGSUNG" ? "JLS" : "TBG";
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const id_setor = `${prefix}-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;

    return await prisma.$transaction(async (tx) => {
      const transaksi = await tx.transaksiSetor.create({
        data: {
          id_setor,
          nasabah_id,
          petugas_id,
          tipe_setoran,
          metode_bayar,
          barang_id,
          nama_barang_snapshot: barang.nama_barang,
          berat,
          harga_deal,
          total_rp,
          catatan_petugas,
        },
      });

      if (metode_bayar === "TABUNG") {
        await tx.user.update({
          where: { id_user: nasabah_id },
          data: { total_saldo: { increment: total_rp } },
        });
      }

      // Log aktivitas
      await logService.record(
        actorId,
        "SETOR_SAMPAH",
        `Setor ${berat}kg ${barang.nama_barang} oleh nasabah ${nasabah_id}, total Rp${total_rp}`,
        { id_setor, metode: metode_bayar },
      );

      return transaksi;
    });
  },

  async createPenarikan(data, actorRole, actorId, actorBankSampahId) {
    const { nasabah_id, petugas_id, jumlah_tarik, catatan_tarik = "" } = data;

    // Ambil data nasabah untuk validasi unit & status
    const nasabah = await prisma.user.findUnique({
      where: { id_user: nasabah_id },
      select: {
        total_saldo: true,
        is_blocked: true,
        peran: true,
        bank_sampah_id: true,
      },
    });

    if (!nasabah || nasabah.peran !== "NASABAH")
      throw new Error("Nasabah tidak valid.");
    if (nasabah.is_blocked) throw new Error("Nasabah sedang diblokir.");

    // Security: Petugas hanya boleh tarik untuk nasabah di unitnya sendiri
    if (
      actorRole === "PETUGAS" &&
      nasabah.bank_sampah_id !== actorBankSampahId
    ) {
      throw new Error(
        "Petugas hanya boleh tarik saldo nasabah di unit sendiri.",
      );
    }

    const jumlah = parseFloat(jumlah_tarik);
    if (parseFloat(nasabah.total_saldo) < jumlah) {
      throw new Error(
        `Saldo tidak mencukupi! Saat ini: Rp${nasabah.total_saldo}`,
      );
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const id_tarik = `TRK-${dateStr}-${randomId}`;

    return await prisma.$transaction(async (tx) => {
      const transaksi = await tx.transaksiTarik.create({
        data: {
          id_tarik,
          nasabah_id,
          petugas_id,
          jumlah_tarik: jumlah,
          status: "SUKSES",
          catatan_tarik,
        },
      });

      await tx.user.update({
        where: { id_user: nasabah_id },
        data: { total_saldo: { decrement: jumlah } },
      });

      // Log aktivitas
      await logService.record(
        actorId,
        "TARIK_SALDO",
        `Tarik Rp${jumlah} oleh nasabah ${nasabah_id}, catatan: ${catatan_tarik || "tidak ada"}`,
        { id_tarik },
      );

      return transaksi;
    });
  },

  async getTransaksiByUnit(unitId, options = {}) {
  const {
    page = 1,
    limit = 20,
    tipe = 'ALL', // 'SETOR', 'TARIK', 'ALL'
    startDate,
    endDate,
    nasabahId
  } = options;

  const skip = (page - 1) * limit;

  // Ambil semua nasabah di unit ini
  const nasabahIds = await prisma.user.findMany({
    where: { bank_sampah_id: unitId, peran: 'NASABAH' },
    select: { id_user: true }
  });
  
  const validNasabahIds = nasabahIds.map(n => n.id_user);

  // Build where conditions
  const whereSetor = { nasabah_id: { in: validNasabahIds } };
  const whereTarik = { nasabah_id: { in: validNasabahIds } };

  if (nasabahId) {
    whereSetor.nasabah_id = parseInt(nasabahId);
    whereTarik.nasabah_id = parseInt(nasabahId);
  }

  if (startDate || endDate) {
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);
    whereSetor.waktu = dateFilter;
    whereTarik.waktu = dateFilter;
  }

  let setor = [], tarik = [], totalSetor = 0, totalTarik = 0;

  if (tipe === 'SETOR' || tipe === 'ALL') {
    [setor, totalSetor] = await Promise.all([
      prisma.transaksiSetor.findMany({
        where: whereSetor,
        include: {
          nasabah: { select: { nama_lengkap: true, nickname: true } },
          petugas: { select: { nama_lengkap: true } }
        },
        orderBy: { waktu: 'desc' },
        skip,
        take: limit
      }),
      prisma.transaksiSetor.count({ where: whereSetor })
    ]);
  }

  if (tipe === 'TARIK' || tipe === 'ALL') {
    [tarik, totalTarik] = await Promise.all([
      prisma.transaksiTarik.findMany({
        where: whereTarik,
        include: {
          nasabah: { select: { nama_lengkap: true, nickname: true } },
          petugas: { select: { nama_lengkap: true } }
        },
        orderBy: { waktu: 'desc' },
        skip,
        take: limit
      }),
      prisma.transaksiTarik.count({ where: whereTarik })
    ]);
  }

  // Gabung dan sort
  const allTransaksi = [
    ...setor.map(s => ({ ...s, jenis: 'SETOR' })),
    ...tarik.map(t => ({ ...t, jenis: 'TARIK' }))
  ].sort((a, b) => new Date(b.waktu) - new Date(a.waktu));

  return {
    data: allTransaksi.slice(0, limit),
    total: totalSetor + totalTarik,
    page,
    limit
  };
}
};

