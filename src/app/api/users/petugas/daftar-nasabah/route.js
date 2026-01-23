import { NextResponse } from 'next/server';
import { userService } from '@/services/userService';
import { getCurrentUser } from '@/lib/auth';

// Fungsi untuk List Nasabah (Sudah ada di kode kamu)
export async function GET(request) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser || currentUser.peran !== 'PETUGAS') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await userService.listNasabah({
      unitId: currentUser.bank_sampah_id,
      actorRole: currentUser.peran,
      actorBankSampahId: currentUser.bank_sampah_id,
      search,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// INI YANG KURANG: Fungsi untuk Tambah Nasabah (POST)
export async function POST(request) {
  try {
    const currentUser = await getCurrentUser(request);

    // Keamanan: Hanya Petugas yang bisa daftar nasabah di sini
    if (!currentUser || currentUser.peran !== 'PETUGAS') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const body = await request.json();

    // Panggil userService.createUser
    // Kita paksa unit_id dan peran agar aman (tidak bisa ditembak dari postman jadi admin)
    const newUser = await userService.createUser(
      { 
        ...body, 
        peran: 'NASABAH', 
        unit_id: currentUser.bank_sampah_id 
      },
      currentUser.peran,
      currentUser.id_user,
      currentUser.bank_sampah_id
    );

    return NextResponse.json({
      success: true,
      message: "Nasabah berhasil didaftarkan",
      data: newUser
    }, { status: 201 });

  } catch (error) {
    console.error("ERROR POST NASABAH:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menambah nasabah" },
      { status: 500 }
    );
  }
}