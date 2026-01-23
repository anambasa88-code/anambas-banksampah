// src/app/api/users/profile/route.js
import { userService } from "@/services/userService";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Ambil string JSON dari header yang diatur middleware
    const userHeader = request.headers.get('user-data');
    if (!userHeader) throw new Error("Sesi tidak valid");

    const { id_user } = JSON.parse(userHeader);
    const profile = await userService.getProfile(id_user);

    if (!profile) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}