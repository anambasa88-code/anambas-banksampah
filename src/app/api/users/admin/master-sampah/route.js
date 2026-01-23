// src/app/api/users/admin/master-sampah/route.js
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getAllMasterSampah,
  createMasterSampah,
} from "@/services/masterSampahService";

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.peran !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("showAll") === "true";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20; // default 20 per page
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    // Panggil service dengan semua param
    const result = await getAllMasterSampah({
      activeOnly: !showAll,
      unitId: null, // kalau nanti perlu per unit, tambah logic user.bank_sampah_id
      page,
      limit,
      search,
      category,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Gagal mengambil data" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.peran !== "ADMIN") {
      return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
    }

    const body = await request.json();
    const created = await createMasterSampah(body, user.id_user);

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
