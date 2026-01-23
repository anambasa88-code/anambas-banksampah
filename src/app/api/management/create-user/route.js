// src/app/api/management/create-user/route.js
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { userService } from '@/services/userService';

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser || currentUser.peran !== 'ADMIN') {
      return NextResponse.json({ error: 'Hanya Admin yang boleh membuat user baru.' }, { status: 403 });
    }

    const body = await request.json();

    // Body harus punya peran yang diizinkan
    if (!['PETUGAS', 'NASABAH'].includes(body.peran)) {
      return NextResponse.json({ error: 'Role hanya boleh PETUGAS atau NASABAH.' }, { status: 400 });
    }

    const newUser = await userService.createUser(
      body,
      currentUser.peran,
      currentUser.id_user,
      currentUser.bank_sampah_id  // null untuk admin
    );

    return NextResponse.json({
      message: `User ${newUser.peran} berhasil didaftarkan.`,
      data: {
        id: newUser.id_user,
        nickname: newUser.nickname,
        nama_lengkap: newUser.nama_lengkap,
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal membuat user' },
      { status: 500 }
    );
  }
}