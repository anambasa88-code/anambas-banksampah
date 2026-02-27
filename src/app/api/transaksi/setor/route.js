// src/app/api/transaksi/setor/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { transactionService } from "@/services/transactionService";

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu" },
        { status: 401 },
      );
    }

    if (currentUser.peran !== "PETUGAS") {
      return NextResponse.json(
        { error: "Hanya petugas yang dapat melakukan setoran" },
        { status: 403 },
      );
    }

    const body = await request.json();

    // petugas_id DIAMBIL DARI TOKEN, BUKAN dari body
    const transaksi = await transactionService.createSetoranBulk(
      {
        ...body,
        petugas_id: currentUser.id_user,
      },
      currentUser.peran,
      currentUser.id_user,
      currentUser.bank_sampah_id,
    );

    return NextResponse.json(
      {
        message: "Setoran berhasil dicatat",
        data: transaksi,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Gagal melakukan setoran" },
      { status: 400 },
    );
  }
}
