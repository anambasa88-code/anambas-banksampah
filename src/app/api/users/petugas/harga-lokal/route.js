// src/app/api/users/petugas/harga-lokal/route.js
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { hargaLokalService } from '@/services/hargaLokalService';

export async function GET(request) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser || currentUser.peran !== 'PETUGAS') {
      return NextResponse.json({ error: 'Akses hanya untuk Petugas' }, { status: 403 });
    }

    if (!currentUser.bank_sampah_id) {
      return NextResponse.json({ error: 'Unit tidak ditemukan' }, { status: 400 });
    }

    const hargaLokal = await hargaLokalService.getHargaLokalByUnit(currentUser.bank_sampah_id);

    return NextResponse.json({
      data: hargaLokal,
      unitId: currentUser.bank_sampah_id,
    });
  } catch (error) {
    console.error('GET harga lokal error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data harga lokal' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser || currentUser.peran !== 'PETUGAS') {
      return NextResponse.json({ error: 'Akses hanya untuk Petugas' }, { status: 403 });
    }

    if (!currentUser.bank_sampah_id) {
      return NextResponse.json({ error: 'Unit tidak ditemukan' }, { status: 400 });
    }

    const body = await request.json();
    const { barangId, hargaLokal } = body;

    if (!barangId || typeof hargaLokal !== 'number') {
      return NextResponse.json({ error: 'barangId dan hargaLokal (number) wajib diisi' }, { status: 400 });
    }

    const updated = await hargaLokalService.setHargaLokal(
      currentUser.bank_sampah_id,
      barangId,
      hargaLokal,
      currentUser.peran,
      currentUser.id_user,
      currentUser.bank_sampah_id
    );

    return NextResponse.json({
      message: 'Harga lokal berhasil diset/update',
      data: updated
    }, { status: 200 });

  } catch (error) {
    console.error('PATCH harga lokal error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengatur harga lokal' },
      { status: 400 }
    );
  }
}