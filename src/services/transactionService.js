// src/services/transactionService.js
import prisma from "../lib/prisma";
import { logService } from "./logService";
import { validateHarga } from "./masterSampahService";

export const transactionService = {
 async createSetoranBulk(dataBulk, actorRole, actorId, actorBankSampahId) {
  const { nasabah_id, items, metode_bayar = "TABUNG", catatan_petugas = "" } = dataBulk;

  // 1. Validasi Dasar Nasabah
  const nasabah = await prisma.user.findUnique({
    where: { id_user: nasabah_id },
    select: { bank_sampah_id: true, peran: true, is_blocked: true },
  });

  if (!nasabah || nasabah.peran !== "NASABAH") throw new Error("Nasabah tidak valid");
  if (nasabah.is_blocked) throw new Error("Nasabah sedang diblokir");
  if (actorRole === "PETUGAS" && nasabah.bank_sampah_id !== actorBankSampahId) {
    throw new Error("Akses ditolak: Nasabah di luar unit kerja Anda");
  }
  if (!items || items.length === 0) throw new Error("Tidak ada item sampah untuk disetor");

  // 2. Generate Group ID Unik untuk Sesi Ini
  const groupId = `GRP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  return await prisma.$transaction(async (tx) => {
    let grandTotalRp = 0;
    const createdTransactions = [];

    for (const item of items) {
      // Ambil data master sampah
      const barang = await tx.masterSampah.findUnique({
        where: { id_barang: item.barang_id },
      });

      if (!barang) throw new Error(`Barang ID ${item.barang_id} tidak ditemukan`);

      // Kalkulasi Harga Final
      let hargaFinal = 0;
      if (item.tipe_harga === "SISTEM") {
        hargaFinal = Number(barang.harga_pusat);
      } else if (item.tipe_harga === "LOKAL") {
        hargaFinal = Number(item.harga_lokal || barang.harga_pusat);
      } else if (item.tipe_harga === "CUSTOM") {
        const customVal = Number(item.harga_manual);
        if (customVal < Number(barang.batas_bawah) || customVal > Number(barang.batas_atas)) {
          throw new Error(`Harga ${barang.nama_barang} (Rp${customVal}) melampaui batas resmi!`);
        }
        hargaFinal = customVal;
      }

      const total_item_rp = hargaFinal * Number(item.berat);
      grandTotalRp += total_item_rp;

      // ID Setor Per Item
      const id_setor = `STR-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

      const transaksi = await tx.transaksiSetor.create({
        data: {
          id_setor,
          group_id: groupId, // Link ke grup yang sama
          nasabah_id,
          petugas_id: actorId,
          barang_id: item.barang_id,
          nama_barang_snapshot: barang.nama_barang,
          berat: Number(item.berat),
          harga_deal: hargaFinal,
          total_rp: total_item_rp,
          tipe_setoran: item.tipe_setoran, // Sesuai pilihan: COMMUNITY / OCEAN_DEBRIS
          metode_bayar,
          catatan_petugas: catatan_petugas,
        },
      });
      createdTransactions.push(transaksi);
    }

    // 3. Update Saldo (Hanya jika TABUNG)
    if (metode_bayar === "TABUNG" && grandTotalRp > 0) {
      await tx.user.update({
        where: { id_user: nasabah_id },
        data: { total_saldo: { increment: grandTotalRp } },
      });
    }

    // Log Aktivitas
    await logService.record(actorId, "SETOR_SAMPAH_BULK", 
      `Setoran multi-item (Group: ${groupId}) nasabah ${nasabah_id}, Total: Rp${grandTotalRp}`, 
      { nasabah_id, group_id: groupId, items_count: items.length }
    );

    return { 
      group_id: groupId, 
      total_rp: grandTotalRp, 
      transactions: createdTransactions 
    };
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
      tipe = "ALL", // 'SETOR', 'TARIK', 'ALL'
      startDate,
      endDate,
      nasabahId,
    } = options;

    const skip = (page - 1) * limit;

    // Ambil semua nasabah di unit ini
    const nasabahIds = await prisma.user.findMany({
      where: { bank_sampah_id: unitId, peran: "NASABAH" },
      select: { id_user: true },
    });

    const validNasabahIds = nasabahIds.map((n) => n.id_user);

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

    let setor = [],
      tarik = [],
      totalSetor = 0,
      totalTarik = 0;

    if (tipe === "SETOR" || tipe === "ALL") {
      [setor, totalSetor] = await Promise.all([
        prisma.transaksiSetor.findMany({
          where: whereSetor,
          include: {
            nasabah: { select: { nama_lengkap: true, nickname: true } },
            petugas: { select: { nama_lengkap: true } },
          },
          orderBy: { waktu: "desc" },
          skip,
          take: limit,
        }),
        prisma.transaksiSetor.count({ where: whereSetor }),
      ]);
    }

    if (tipe === "TARIK" || tipe === "ALL") {
      [tarik, totalTarik] = await Promise.all([
        prisma.transaksiTarik.findMany({
          where: whereTarik,
          include: {
            nasabah: { select: { nama_lengkap: true, nickname: true } },
            petugas: { select: { nama_lengkap: true } },
          },
          orderBy: { waktu: "desc" },
          skip,
          take: limit,
        }),
        prisma.transaksiTarik.count({ where: whereTarik }),
      ]);
    }

    // Gabung dan sort
    const allTransaksi = [
      ...setor.map((s) => ({ ...s, jenis: "SETOR" })),
      ...tarik.map((t) => ({ ...t, jenis: "TARIK" })),
    ].sort((a, b) => new Date(b.waktu) - new Date(a.waktu));

    return {
      data: allTransaksi.slice(0, limit),
      total: totalSetor + totalTarik,
      page,
      limit,
    };
  },
};
