import { NextResponse } from 'next/server';
import { authService } from '@/services/authService';
import { verifikasiToken } from '@/lib/auth';

export async function PATCH(request) {
  try {
    // 1. Ambil & Verifikasi Token dari Header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    const payload = await verifikasiToken(token);

    if (!payload) {
      return NextResponse.json({ message: 'Sesi tidak valid atau telah berakhir.' }, { status: 401 });
    }

    const { oldPin, newPin } = await request.json();

    // 2. Validasi format PIN [cite: 17, 18]
    if (!oldPin || !newPin) {
      return NextResponse.json({ message: 'PIN lama dan baru wajib diisi.' }, { status: 400 });
    }
    if (newPin.length !== 6 || isNaN(newPin)) {
      return NextResponse.json({ message: 'PIN harus berupa 6 digit angka.' }, { status: 400 });
    }

    // 3. Gunakan ID dari payload token (Aman)
    await authService.changePin(payload.id_user, oldPin, newPin);

    return NextResponse.json({ message: 'PIN berhasil diperbarui.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}