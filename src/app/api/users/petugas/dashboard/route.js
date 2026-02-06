// src/app/api/admin/dashboard/route.js
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { analyticsService } from '@/services/analyticsService';

export async function GET(request) {
  // 1. Cek Keamanan (Hanya Admin)
  const currentUser = await getCurrentUser(request);

  if (!currentUser || currentUser.peran !== 'ADMIN') {
    return NextResponse.json({ error: 'Akses ditolak - hanya untuk admin' }, { status: 403 });
  }

  try {
    // 2. Tangkap query params untuk filter tanggal
    const { searchParams } = new URL(request.url);
    const filters = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    };

    // 3. Eksekusi Analytics Service dengan Filter
    // Sekarang data yang dikembalikan sudah terfilter sesuai tanggal yang dipilih Admin
    const data = await analyticsService.getAdminGlobalSummary(filters);
    
    // 4. Return Data Success
    return NextResponse.json(data);
  } catch (error) {
    // DEBUG LOG: Sangat penting agar error asli kelihatan di Server Logs
    console.error('--- ERROR DASHBOARD ADMIN ---');
    console.error('Message:', error.message);
    console.error('-----------------------------');

    return NextResponse.json({ 
      error: 'Gagal mengambil data dashboard admin',
      message: error.message 
    }, { status: 500 });
  }
}