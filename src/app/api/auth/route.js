import { NextResponse } from 'next/server';
import { authService } from '@/services/authService';
import { buatToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { nickname, pin } = await request.json();

    if (!nickname || !pin) {
      return NextResponse.json({ message: 'Nickname dan PIN wajib diisi.' }, { status: 400 });
    }

    // 1. Verifikasi login
    const user = await authService.verifyLogin(nickname, pin);

    // 2. Buat Token JWT
    const token = await buatToken({
      id_user: user.id_user,
      peran: user.peran,
      bank_sampah_id: user.bank_sampah_id
    });

    // 3. Kirim Token ke Frontend
    return NextResponse.json({
      message: 'Login Berhasil!',
      token,
      user: {
        nickname: user.nickname,
        peran: user.peran,
        must_change_pin: user.must_change_pin  // ← TAMBAHKAN INI
      }
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 401 });
  }
}