// src/services/hargaLokalService.js
import prisma from '../lib/prisma';
import { logService } from './logService';

export const hargaLokalService = {
  // 1. Ambil daftar harga lokal untuk unit tertentu
  async getHargaLokalByUnit(unitId) {
    return await prisma.hargaLokalUnit.findMany({
      where: { bank_sampah_id: unitId },
      include: {
        barang: {
          select: {
            nama_barang: true,
            kategori_utama: true,
            harga_pusat: true,
            batas_atas: true,
            batas_bawah: true
          }
        }
      }
    });
  },
    async setHargaLokal(unitId, barangId, hargaInput, actorRole, actorId, actorBankSampahId) {
    // Security: Hanya PETUGAS unit terkait atau ADMIN yang boleh ubah
    if (actorRole === 'PETUGAS' && actorBankSampahId !== unitId) {
      throw new Error("Petugas hanya boleh mengubah harga lokal di unitnya sendiri.");
    }
    if (!['ADMIN', 'PETUGAS'].includes(actorRole)) {
      throw new Error("Akses ditolak.");
    }

    const master = await prisma.masterSampah.findUnique({
      where: { id_barang: barangId }
    });

    if (!master) throw new Error("Barang tidak terdaftar di database pusat.");

    if (hargaInput < master.batas_bawah || hargaInput > master.batas_atas) {
      throw new Error(
        `Harga Rp${hargaInput} ditolak! Minimal: Rp${master.batas_bawah}, Maksimal: Rp${master.batas_atas}`
      );
    }

    const existing = await prisma.hargaLokalUnit.findUnique({
      where: {
        barang_id_bank_sampah_id: {
          barang_id: barangId,
          bank_sampah_id: unitId
        }
      }
    });

    const result = await prisma.hargaLokalUnit.upsert({
      where: {
        barang_id_bank_sampah_id: {
          barang_id: barangId,
          bank_sampah_id: unitId
        }
      },
      update: { harga_lokal: hargaInput },
      create: {
        barang_id: barangId,
        bank_sampah_id: unitId,
        harga_lokal: hargaInput
      }
    });

    // Log perubahan harga
    const aksi = existing ? 'UPDATE_HARGA_LOKAL' : 'CREATE_HARGA_LOKAL';
    const detail = existing
      ? `Mengubah harga ${master.nama_barang} dari ${existing.harga_lokal} → ${hargaInput}`
      : `Membuat harga lokal ${master.nama_barang} = ${hargaInput}`;

    await logService.record(actorId, aksi, detail, {
      unitId,
      barangId,
      hargaBaru: hargaInput,
      hargaLama: existing?.harga_lokal
    });

    return result;
  }
};