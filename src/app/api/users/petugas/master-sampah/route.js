// src/app/api/users/petugas/master-sampah/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllMasterSampah } from "@/services/masterSampahService";

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);

    if (!user || user.peran !== "PETUGAS") {
      return NextResponse.json(
        { error: "Akses hanya untuk petugas" },
        { status: 403 },
      );
    }

    const result = await getAllMasterSampah({
      activeOnly: true,
      unitId: user.bank_sampah_id,
      limit: 500,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (err) {
    console.error("GET /api/users/petugas/master-sampah", err);
    return NextResponse.json(
      { error: "Gagal mengambil data master sampah", message: err.message },
      { status: 500 },
    );
  }
}
