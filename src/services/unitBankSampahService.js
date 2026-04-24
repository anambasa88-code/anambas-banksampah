// src/services/unitBankSampahService.js
import prisma from '../lib/prisma';
import { logService } from './logService';

// READ
export async function getAllUnits() {
  return prisma.unitBankSampah.findMany({
    orderBy: { nama_unit: 'asc' },
    select: {
      id_unit: true,
      nama_unit: true,
      alamat_unit: true,
    },
  });
}

export async function getUnitById(id_unit) {
  const id = Number(id_unit);
  if (isNaN(id) || id < 1) throw new Error('ID unit tidak valid');

  const unit = await prisma.unitBankSampah.findUnique({
    where: { id_unit: id },
    select: {
      id_unit: true,
      nama_unit: true,
      alamat_unit: true,
    },
  });

  if (!unit) throw new Error('Unit tidak ditemukan');
  return unit;
}

export async function updateUnit(adminId, id_unit, data) {
  const id = Number(id_unit);
  if (isNaN(id) || id < 1) throw new Error('ID tidak valid');

  const unitLama = await prisma.unitBankSampah.findUnique({
    where: { id_unit: id },
    select: { nama_unit: true, alamat_unit: true },
  });

  if (!unitLama) throw new Error('Unit tidak ditemukan');

  return prisma.$transaction(async (tx) => {
    const updated = await tx.unitBankSampah.update({
      where: { id_unit: id },
      data: {
        nama_unit: data.nama_unit ? data.nama_unit.trim() : undefined,
        alamat_unit: data.alamat_unit ? data.alamat_unit.trim() : undefined,
      },
    });

    await logService.record(
      adminId,
      'UPDATE_UNIT_BANK_SAMPAH',
      `Mengubah unit "${unitLama.nama_unit}" → "${updated.nama_unit || unitLama.nama_unit}" (ID: ${id})`,
      { before: unitLama, after: updated }
    );

    return updated;
  });
}