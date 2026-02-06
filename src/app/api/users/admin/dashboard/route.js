// src/app/api/admin/dashboard/route.js (atau route petugas kamu)
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { analyticsService } from '@/services/analyticsService';

export async function GET(request) {
  const currentUser = await getCurrentUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
  }

  try {
    // --- PERBAIKAN DI SINI ---
    // Ambil query params dari URL
    const { searchParams } = new URL(request.url);
    const filters = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    };

    // Kirim filters ke service
    // Jika ini dashboard admin:
    const data = await analyticsService.getAdminGlobalSummary(filters);
    


    return NextResponse.json(data);
  } catch (error) {
    console.error('--- DEBUG DASHBOARD ERROR ---');
    console.error('Message:', error.message);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}