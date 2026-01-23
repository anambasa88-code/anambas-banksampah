// src/app/api/transaksi/tarik/route.js
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { transactionService } from '@/services/transactionService';

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Silakan login terlebih dahulu' }, { status: 401 });
    }

    if (currentUser.peran !== 'PETUGAS') {
      return NextResponse.json({ error: 'Hanya petugas yang dapat melakukan penarikan' }, { status: 403 });
    }

    const body = await request.json();

    const transaksi = await transactionService.createPenarikan(
      {
        ...body,
        petugas_id: currentUser.id_user  // ambil dari token, bukan body
      },
      currentUser.peran,
      currentUser.id_user,
      currentUser.bank_sampah_id
    );

    return NextResponse.json({
      message: 'Penarikan berhasil',
      data: transaksi
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || 'Gagal melakukan penarikan' },
      { status: 400 }
    );
  }
}