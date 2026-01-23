import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { userService } from '@/services/userService';

export async function GET(request) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser || currentUser.peran !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Admin.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const unitId = searchParams.get('unitId') ? parseInt(searchParams.get('unitId')) : null;

    const result = await userService.getDaftarPetugas({
      actorRole: currentUser.peran,
      search,
      page,
      limit,
      unitId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/users/admin/daftar-petugas error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser || currentUser.peran !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Admin.' }, { status: 403 });
    }

    const body = await request.json();

    // Pakai method createPetugas yang baru kamu tambah di userService
    const newPetugas = await userService.createPetugas(
      body,
      currentUser.id_user
    );

    return NextResponse.json({
      success: true,
      message: 'Petugas berhasil ditambahkan',
      data: newPetugas
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/users/admin/daftar-petugas error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menambahkan petugas' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser || currentUser.peran !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Admin.' }, { status: 403 });
    }

    const body = await request.json();
    const { id_user } = body;  // Harus dikirim dari frontend di body

    if (!id_user) {
      return NextResponse.json({ error: 'ID petugas wajib dikirim' }, { status: 400 });
    }

    // Pakai method updatePetugas (tambahkan ini juga di userService kalau belum)
    const updated = await userService.updatePetugas(
      id_user,
      body,
      currentUser.peran
    );

    return NextResponse.json({
      success: true,
      message: 'Petugas berhasil diupdate',
      data: updated
    });
  } catch (error) {
    console.error('PUT /api/users/admin/daftar-petugas error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengupdate petugas' },
      { status: 500 }
    );
  }
}