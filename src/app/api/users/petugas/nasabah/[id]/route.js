import { NextResponse } from 'next/server';
import { userService } from '@/services/userService';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser || (currentUser.peran !== 'PETUGAS' && currentUser.peran !== 'ADMIN')) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validasi input
    const { nama_lengkap, alamat, desa, nik, jenis_kelamin } = body;
    
    if (!nama_lengkap || nama_lengkap.trim() === '') {
      return NextResponse.json({ error: 'Nama lengkap wajib diisi' }, { status: 400 });
    }

    // Update nasabah
    const updatedNasabah = await userService.updateNasabah(
      id,
      {
        nama_lengkap: nama_lengkap.trim(),
        alamat: alamat?.trim() || null,
        desa: desa?.trim() || null,
        nik: nik?.trim() || null,
        jenis_kelamin: jenis_kelamin || null,
      },
      currentUser.peran,
      currentUser.bank_sampah_id
    );

    return NextResponse.json({
      success: true,
      message: "Data nasabah berhasil diperbarui",
      data: updatedNasabah
    });

  } catch (error) {
    console.error("ERROR UPDATE NASABAH:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui data nasabah" },
      { status: error.message.includes('tidak dapat') || error.message.includes('Akses ditolak') ? 403 : 500 }
    );
  }
}
