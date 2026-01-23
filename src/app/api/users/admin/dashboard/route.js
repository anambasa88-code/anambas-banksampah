// src/app/api/admin/dashboard/route.js
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { analyticsService } from '@/services/analyticsService';

export async function GET(request) {
  // 1. Cek User
  const currentUser = await getCurrentUser(request);

  if (!currentUser || currentUser.peran !== 'ADMIN') {
    return NextResponse.json({ error: 'Akses ditolak - hanya untuk admin' }, { status: 403 });
  }

  try {
    // 2. Eksekusi Analytics Service
    const data = await analyticsService.getAdminGlobalSummary();
    
    // 3. Return Data Success
    return NextResponse.json(data);
  } catch (error) {
    // DEBUG LOG: Sangat penting agar error asli kelihatan di Vercel Logs
    console.error('--- DEBUG DASHBOARD ERROR ---');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('-----------------------------');

    return NextResponse.json({ 
      error: 'Gagal mengambil data dashboard admin',
      message: error.message // Opsional: tampilkan message agar di frontend gampang debugnya
    }, { status: 500 });
  }
}