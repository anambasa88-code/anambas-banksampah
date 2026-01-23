// src/services/masterSampahService.js
import prisma from '../lib/prisma';
import { logService } from './logService';

// ────────────────────────────────────────────────
// Get all master sampah (untuk dropdown di form setor)
// ────────────────────────────────────────────────
export async function getAllMasterSampah(options = {}) {
  const {
    activeOnly = true,
    unitId = null,
    page = 1,
    limit = 20,  // default 20 per page
    search = '',
    category = ''
  } = options;

  const skip = (page - 1) * limit;

  const where = {};

  if (activeOnly) {
    where.is_active = true;
  }

  if (category) {
    where.kategori_utama = category;
  }

  if (search) {
    where.OR = [
      { nama_barang: { contains: search, mode: 'insensitive' } },
      { keterangan_pusat: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [items, total] = await Promise.all([
    prisma.masterSampah.findMany({
      where,
      select: {
        id_barang: true,
        kategori_utama: true,
        nama_barang: true,
        keterangan_pusat: true,
        harga_pusat: true,
        batas_atas: true,
        batas_bawah: true,
        is_active: true,
        harga_lokal_unit: unitId
          ? {
              where: { bank_sampah_id: unitId },
              select: { harga_lokal: true }
            }
          : false
      },
      orderBy: [
        { kategori_utama: 'asc' },
        { nama_barang: 'asc' }
      ],
      skip,
      take: limit
    }),
    prisma.masterSampah.count({ where })
  ]);

  // Transform data: prioritaskan harga_lokal kalau ada
  const transformedItems = items.map(item => {
    const hargaLokal = item.harga_lokal_unit?.[0]?.harga_lokal;
    return {
      id_barang: item.id_barang,
      kategori_utama: item.kategori_utama,
      nama_barang: item.nama_barang,
      keterangan_pusat: item.keterangan_pusat,
      harga_aktif: hargaLokal ? parseFloat(hargaLokal) : parseFloat(item.harga_pusat),
      harga_pusat: parseFloat(item.harga_pusat),
      harga_lokal: hargaLokal ? parseFloat(hargaLokal) : null,
      batas_atas: parseFloat(item.batas_atas),
      batas_bawah: parseFloat(item.batas_bawah),
      is_active: item.is_active
    };
  });

  return {
    data: transformedItems,
    total,
    page,
    limit
  };
}

// ────────────────────────────────────────────────
// Get master sampah by ID
// ────────────────────────────────────────────────
export async function getMasterSampahById(barangId, unitId = null) {
  const barang = await prisma.masterSampah.findUnique({
    where: { id_barang: parseInt(barangId) },
    include: {
      harga_lokal_unit: unitId
        ? {
            where: { bank_sampah_id: unitId }
          }
        : false
    }
  });

  if (!barang) throw new Error('Barang tidak ditemukan');

  const hargaLokal = barang.harga_lokal_unit?.[0]?.harga_lokal;

  return {
    id_barang: barang.id_barang,
    kategori_utama: barang.kategori_utama,
    nama_barang: barang.nama_barang,
    keterangan_pusat: barang.keterangan_pusat,
    harga_aktif: hargaLokal ? parseFloat(hargaLokal) : parseFloat(barang.harga_pusat),
    harga_pusat: parseFloat(barang.harga_pusat),
    harga_lokal: hargaLokal ? parseFloat(hargaLokal) : null,
    batas_atas: parseFloat(barang.batas_atas),
    batas_bawah: parseFloat(barang.batas_bawah),
    is_active: barang.is_active
  };
}

// ────────────────────────────────────────────────
// Validasi harga deal (dipanggil saat create setoran)
// ────────────────────────────────────────────────
export async function validateHarga(barangId, hargaDeal) {
  const barang = await prisma.masterSampah.findUnique({
    where: { id_barang: parseInt(barangId) },
    select: { batas_atas: true, batas_bawah: true, nama_barang: true }
  });

  if (!barang) throw new Error('Barang tidak ditemukan');

  const harga = parseFloat(hargaDeal);
  const bawah = parseFloat(barang.batas_bawah);
  const atas = parseFloat(barang.batas_atas);

  if (harga < bawah || harga > atas) {
    throw new Error(
      `Harga ${barang.nama_barang} harus antara Rp${bawah.toLocaleString('id-ID')} - Rp${atas.toLocaleString('id-ID')}`
    );
  }

  return true;
}

// ────────────────────────────────────────────────
// Create master sampah baru (ADMIN only)
// ────────────────────────────────────────────────
export async function createMasterSampah(data, adminId) {
  const { nama_barang, kategori_utama, keterangan_pusat, harga_pusat, batas_atas, batas_bawah } = data;

  if (!nama_barang?.trim()) throw new Error('Nama barang wajib diisi');
  if (!kategori_utama) throw new Error('Kategori utama wajib diisi');
  if (!harga_pusat || harga_pusat <= 0) throw new Error('Harga pusat harus lebih dari 0');
  if (!batas_bawah || !batas_atas) throw new Error('Batas harga wajib diisi');
  if (parseFloat(batas_bawah) > parseFloat(batas_atas)) {
    throw new Error('Batas bawah tidak boleh lebih besar dari batas atas');
  }

  return prisma.$transaction(async (tx) => {
    const created = await tx.masterSampah.create({
      data: {
        nama_barang: nama_barang.trim(),
        kategori_utama,
        keterangan_pusat: keterangan_pusat?.trim() || '',
        harga_pusat: parseFloat(harga_pusat),
        batas_atas: parseFloat(batas_atas),
        batas_bawah: parseFloat(batas_bawah),
        is_active: true
      }
    });

    await logService.record(
      adminId,
      'CREATE_MASTER_SAMPAH',
      `Menambah master sampah "${nama_barang}" (ID: ${created.id_barang})`,
      created
    );

    return created;
  });
}

// ────────────────────────────────────────────────
// Update master sampah (ADMIN only)
// ────────────────────────────────────────────────
export async function updateMasterSampah(barangId, data, adminId) {
  const id = parseInt(barangId);
  if (isNaN(id)) throw new Error('ID barang tidak valid');

  const barangLama = await prisma.masterSampah.findUnique({
    where: { id_barang: id }
  });

  if (!barangLama) throw new Error('Barang tidak ditemukan');

  if (data.batas_bawah && data.batas_atas) {
    if (parseFloat(data.batas_bawah) > parseFloat(data.batas_atas)) {
      throw new Error('Batas bawah tidak boleh lebih besar dari batas atas');
    }
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.masterSampah.update({
      where: { id_barang: id },
      data: {
        nama_barang: data.nama_barang?.trim() || undefined,
        kategori_utama: data.kategori_utama || undefined,
        keterangan_pusat: data.keterangan_pusat?.trim() || undefined,
        harga_pusat: data.harga_pusat ? parseFloat(data.harga_pusat) : undefined,
        batas_atas: data.batas_atas ? parseFloat(data.batas_atas) : undefined,
        batas_bawah: data.batas_bawah ? parseFloat(data.batas_bawah) : undefined,
        is_active: data.is_active !== undefined ? data.is_active : undefined
      }
    });

    // Log perubahan harga jika ada
    if (data.harga_pusat && parseFloat(data.harga_pusat) !== parseFloat(barangLama.harga_pusat)) {
      await tx.historyHarga.create({
        data: {
          barang_id: id,
          bank_sampah_id: null, // null = harga pusat
          harga_lama: barangLama.harga_pusat,
          harga_baru: parseFloat(data.harga_pusat),
          diubah_oleh: adminId
        }
      });
    }

    await logService.record(
      adminId,
      'UPDATE_MASTER_SAMPAH',
      `Mengubah master sampah "${barangLama.nama_barang}" (ID: ${id})`,
      { before: barangLama, after: updated }
    );

    return updated;
  });
}

// ────────────────────────────────────────────────
// Toggle active status (soft delete)
// ────────────────────────────────────────────────
export async function toggleActiveMasterSampah(barangId, adminId) {
  const id = parseInt(barangId);
  const barang = await prisma.masterSampah.findUnique({
    where: { id_barang: id }
  });

  if (!barang) throw new Error('Barang tidak ditemukan');

  const updated = await prisma.masterSampah.update({
    where: { id_barang: id },
    data: { is_active: !barang.is_active }
  });

  await logService.record(
    adminId,
    'TOGGLE_MASTER_SAMPAH',
    `${updated.is_active ? 'Mengaktifkan' : 'Menonaktifkan'} "${barang.nama_barang}"`,
    { id_barang: id, status: updated.is_active }
  );

  return updated;
}