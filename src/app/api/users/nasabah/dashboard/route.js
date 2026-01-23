// src/app/api/users/nasabah/dashboard/route.js
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { analyticsService } from '@/services/analyticsService';

export async function GET(request) {
  const currentUser = await getCurrentUser(request);

  if (!currentUser || currentUser.peran !== 'NASABAH') {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  try {
    const summary = await analyticsService.getNasabahSummary(currentUser.id_user);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Dashboard nasabah error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data dashboard' }, { status: 500 });
  }
}