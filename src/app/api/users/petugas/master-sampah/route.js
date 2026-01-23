// src/app/api/users/petugas/master-sampah/route.js
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAllMasterSampah } from '@/services/masterSampahService';

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);

    if (!user || user.peran !== 'PETUGAS') {
      return NextResponse.json({ error: 'Akses hanya untuk petugas' }, { status: 403 });
    }

    // Pass unitId dari token untuk ambil harga lokal unit
    const items = await getAllMasterSampah(true, user.bank_sampah_id);

    return NextResponse.json({
      success: true,
      data: items,
      total: items.length,
    });
  } catch (err) {
    console.error('GET /api/users/petugas/master-sampah', err);
    return NextResponse.json(
      { error: 'Gagal mengambil data master sampah', message: err.message },
      { status: 500 }
    );
  }
}