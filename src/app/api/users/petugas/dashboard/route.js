// src/app/api/users/petugas/dashboard/route.js
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { analyticsService } from '@/services/analyticsService';

export async function GET(request) {
  const currentUser = await getCurrentUser(request);

  if (!currentUser || currentUser.peran !== 'PETUGAS') {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  try {
    // Ambil unit dari user (asumsi bank_sampah_id ada di user)
    if (!currentUser.bank_sampah_id) {
      return NextResponse.json({ error: 'Petugas tidak terkait unit' }, { status: 400 });
    }

    const summary = await analyticsService.getPetugasUnitSummary(currentUser.bank_sampah_id);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Dashboard petugas error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data dashboard unit' }, { status: 500 });
  }
}