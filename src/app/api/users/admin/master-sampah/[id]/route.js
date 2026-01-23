// src/app/api/users/admin/master-sampah/[id]/route.js
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { logService } from '@/services/logService';
import { getMasterSampahById, updateMasterSampah } from '@/services/masterSampahService';

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.peran !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const barang = await getMasterSampahById(params.id);
    return NextResponse.json({ success: true, data: barang });
  } catch (err) {
    const status = err.message.includes('tidak ditemukan') ? 404 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function PATCH(request, context) {  // ← ubah { params } jadi context
  try {
    const user = await getCurrentUser(request);
    if (!user || user.peran !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const params = await context.params;  // ← AWAIT params di sini
    const id = parseInt(params.id);       // ← akses params.id setelah await

    const body = await request.json();

    // Validasi kategori_utama (sekarang aman)
    if (body.kategori_utama) {
      const existing = await prisma.masterSampah.findUnique({
        where: { id_barang: id }  // pakai id dari params
      });
      if (existing && body.kategori_utama !== existing.kategori_utama) {
        return NextResponse.json({ error: 'Kategori utama tidak boleh diubah' }, { status: 400 });
      }
    }

    // Validasi harga (tetap)
    if (body.harga_pusat) {
      const harga = parseFloat(body.harga_pusat);
      if (isNaN(harga) || harga <= 0) {
        return NextResponse.json({ error: 'Harga pusat tidak valid (harus angka positif)' }, { status: 400 });
      }
    }
    if (body.batas_bawah) {
      const bawah = parseFloat(body.batas_bawah);
      if (isNaN(bawah) || bawah <= 0) {
        return NextResponse.json({ error: 'Batas bawah tidak valid (harus angka positif)' }, { status: 400 });
      }
    }
    if (body.batas_atas) {
      const atas = parseFloat(body.batas_atas);
      if (isNaN(atas) || atas <= 0) {
        return NextResponse.json({ error: 'Batas atas tidak valid (harus angka positif)' }, { status: 400 });
      }
    }

    const updated = await updateMasterSampah(params.id, body, user.id_user);  // ← params.id aman setelah await

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PATCH ERROR:", err);
    return NextResponse.json({ error: err.message || 'Gagal memperbarui' }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.peran !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const id = Number(params.id);
    if (isNaN(id) || id < 1) throw new Error('ID tidak valid');

    await prisma.$transaction(async (tx) => {
      await tx.masterSampah.update({
        where: { id_barang: id },
        data: { is_active: false },
      });

      await logService.record(
        user.id_user,
        'SOFT_DELETE_MASTER_SAMPAH',
        `Menonaktifkan master sampah ID: ${id}`,
        { id_barang: id }
      );
    });

    return NextResponse.json({ success: true, message: 'Barang dinonaktifkan' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}