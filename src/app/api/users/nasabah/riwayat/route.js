// src/app/api/users/nasabah/riwayat/route.js
import { NextResponse } from 'next/server';
import { reportService } from '@/services/reportService';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
  try {
    // Get user dari token
    const user = await getCurrentUser(request);
    if (!user || user.peran !== 'NASABAH') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'SEMUA';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    const result = await reportService.getNasabahHistory(
      user.id_user, 
      type,
      page,
      limit
    );

    return NextResponse.json({
      message: `Riwayat ${type} berhasil diambil`,
      ...result
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}