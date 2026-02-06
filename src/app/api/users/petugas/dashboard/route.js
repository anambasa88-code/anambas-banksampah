// src/app/api/users/petugas/dashboard/route.js
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { analyticsService } from '@/services/analyticsService';

// Force dynamic rendering for Vercel deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  // 1. Cek Keamanan (Hanya Petugas)
  const currentUser = await getCurrentUser(request);

  if (!currentUser || currentUser.peran !== 'PETUGAS') {
    return NextResponse.json({ error: 'Akses ditolak - hanya untuk petugas' }, { status: 403 });
  }

  try {
    // 2. Tangkap query params untuk filter tanggal
    const { searchParams } = new URL(request.url);
    const filters = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    };

    // 3. Eksekusi Analytics Service dengan Filter (PETUGAS UNIT)
    const data = await analyticsService.getPetugasUnitSummary(currentUser.unit_id, filters);
    
    // 4. Return Data Success
    return NextResponse.json(data);
  } catch (error) {
    // DEBUG LOG: Sangat penting agar error asli kelihatan di Server Logs
    console.error('--- ERROR DASHBOARD PETUGAS ---');
    console.error('User:', currentUser?.nama);
    console.error('Unit ID:', currentUser?.unit_id);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('-----------------------------');

    return NextResponse.json({ 
      error: 'Gagal mengambil data dashboard petugas',
      message: error.message 
    }, { status: 500 });
  }
}