// src/app/api/users/admin/dashboard/route.js
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { analyticsService } from '@/services/analyticsService';

// Force dynamic rendering for Vercel deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  const currentUser = await getCurrentUser(request);

  if (!currentUser || currentUser.peran !== 'ADMIN') {
    return NextResponse.json({ error: 'Akses ditolak - hanya untuk admin' }, { status: 403 });
  }

  try {
    // Ambil query params dari URL
    const { searchParams } = new URL(request.url);
    const filters = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    };

    // Kirim filters ke service admin
    const data = await analyticsService.getAdminGlobalSummary(filters);

    return NextResponse.json(data);
  } catch (error) {
    console.error('--- ERROR DASHBOARD ADMIN ---');
    console.error('User:', currentUser?.nama);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('-----------------------------');
    return NextResponse.json({
      error: 'Gagal mengambil data dashboard admin',
      message: error.message
    }, { status: 500 });
  }
}