// src/app/api/admin/unit-bank-sampah/[id]/route.js
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUnitById, updateUnit } from '@/services/unitBankSampahService';
import prisma from '@/lib/prisma';  // kalau perlu validasi tambahan

export async function GET(request, context) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.peran !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const params = await context.params;  // ← AWAIT params
    const unit = await getUnitById(params.id);
    return NextResponse.json({ success: true, data: unit });
  } catch (err) {
    const status = err.message.includes('tidak ditemukan') ? 404 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

export async function PATCH(request, context) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.peran !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const params = await context.params;  // ← AWAIT params
    const id = params.id;                 // ← aman sekarang

    const body = await request.json();

    // (Opsional) Blokir ubah nama_unit kalau ada di body
    if (body.nama_unit) {
      const existing = await prisma.unitBankSampah.findUnique({
        where: { id_unit: Number(id) },
        select: { nama_unit: true }
      });
      if (existing && body.nama_unit.trim() !== existing.nama_unit) {
        return NextResponse.json({ error: 'Nama unit tidak boleh diubah' }, { status: 400 });
      }
    }

    const updated = await updateUnit(user.id_user, id, body);

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("PATCH UNIT ERROR:", err);
    return NextResponse.json({ error: err.message || 'Gagal memperbarui unit' }, { status: 400 });
  }
}