// src/app/api/admin/dashboard/route.js
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { analyticsService } from '@/services/analyticsService';

export async function GET(request) {
  const currentUser = await getCurrentUser(request);

  if (!currentUser || currentUser.peran !== 'ADMIN') {
    return NextResponse.json({ error: 'Akses ditolak - hanya untuk admin' }, { status: 403 });
  }

  try {
    const data = await analyticsService.getAdminGlobalSummary();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data dashboard admin' }, { status: 500 });
  }
}