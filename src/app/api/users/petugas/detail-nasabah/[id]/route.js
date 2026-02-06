// src/app/api/users/petugas/detail-nasabah/[id]/route.js
import { NextResponse } from 'next/server';
import { reportService } from '@/services/reportService';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.peran !== 'PETUGAS') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

  
    const { id } = await params;
    const nasabahId = parseInt(id);

    // Validasi nasabah ada & di unit yang sama
    const nasabah = await prisma.user.findUnique({
      where: { id_user: nasabahId },
      select: { 
        bank_sampah_id: true, 
        peran: true,
        nama_lengkap: true,
        nickname: true,
        total_saldo: true,
        nik: true,
        desa: true,
        alamat: true,
        jenis_kelamin: true
      }
    });

    if (!nasabah || nasabah.peran !== 'NASABAH') {
      return NextResponse.json({ message: 'Nasabah tidak ditemukan' }, { status: 404 });
    }

    if (nasabah.bank_sampah_id !== user.bank_sampah_id) {
      return NextResponse.json({ message: 'Nasabah bukan dari unit Anda' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'SEMUA';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    const result = await reportService.getNasabahHistory(
      nasabahId, 
      type,
      page,
      limit
    );

    // Hitung summary dari SEMUA transaksi (bukan cuma yang di-page)
    const allSetor = await prisma.transaksiSetor.findMany({
      where: { nasabah_id: nasabahId },
      select: { total_rp: true, metode_bayar: true }
    });

    const allTarik = await prisma.transaksiTarik.findMany({
      where: { nasabah_id: nasabahId },
      select: { jumlah_tarik: true }
    });

    const summary = {
      totalSetorCount: allSetor.length,
      totalTarikCount: allTarik.length,
      totalNilaiSetor: allSetor
        .filter(s => s.metode_bayar === 'TABUNG')
        .reduce((sum, s) => sum + Number(s.total_rp), 0),
      totalNilaiTarik: allTarik
        .reduce((sum, t) => sum + Number(t.jumlah_tarik), 0)
    };

    return NextResponse.json({
      message: 'Data berhasil diambil',
      nasabah: {
        id_user: nasabahId,
        nama_lengkap: nasabah.nama_lengkap,
        nickname: nasabah.nickname,
        total_saldo: nasabah.total_saldo,
        nik: nasabah.nik,
        desa: nasabah.desa,
        alamat: nasabah.alamat,
        jenis_kelamin: nasabah.jenis_kelamin
      },
      summary,
      ...result
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}