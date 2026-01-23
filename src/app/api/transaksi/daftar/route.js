import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { transactionService } from '@/services/transactionService';

export async function GET(request) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser || currentUser.peran !== 'PETUGAS') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    if (!currentUser.bank_sampah_id) {
      return NextResponse.json({ error: 'Unit tidak ditemukan' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const options = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      tipe: searchParams.get('tipe') || 'ALL',
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      nasabahId: searchParams.get('nasabahId')
    };

    const result = await transactionService.getTransaksiByUnit(
      currentUser.bank_sampah_id,
      options
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Gagal mengambil data transaksi' },
      { status: 500 }
    );
  }
}