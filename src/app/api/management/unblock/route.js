// src/app/api/management/unblock/route.js
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

    await userService.unblockUser(
      targetUserId,
      currentUser.peran,
      currentUser.id_user,
      currentUser.bank_sampah_id
    );

    return NextResponse.json({ 
      message: `User ID ${targetUserId} berhasil dibuka blokirnya.` 
    }, { status: 200 });

  } catch (error) {
    console.error('Unblock error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal membuka blokir' },
      { status: error.message.includes('otoritas') || error.message.includes('tidak dapat') ? 403 : 500 }
    );
  }
}