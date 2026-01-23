// src/app/api/admin/unit-bank-sampah/route.js
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAllUnits, createUnit } from '@/services/unitBankSampahService';

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.peran !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('showAll') === 'true';

    const units = await getAllUnits(!showAll);

    return NextResponse.json({ success: true, data: units, total: units.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.peran !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const body = await request.json();
    const created = await createUnit(user.id_user, body);

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}