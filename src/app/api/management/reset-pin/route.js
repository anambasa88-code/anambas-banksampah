// src/app/api/management/reset-pin/route.js
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { userService } from '@/services/userService';

export async function PATCH(request) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId wajib diisi' }, { status: 400 });
    }

    // Panggil service dengan data aktor dari token (bukan body)
    await userService.resetPinHierarki(
      targetUserId,
      currentUser.peran,
      currentUser.id_user,
      currentUser.bank_sampah_id
    );

    return NextResponse.json({
      message: `PIN user ID ${targetUserId} berhasil di-reset ke default.`
    }, { status: 200 });

  } catch (error) {
    console.error('Reset PIN error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal reset PIN' },
      { status: error.message.includes('otoritas') ? 403 : 500 }
    );
  }
}