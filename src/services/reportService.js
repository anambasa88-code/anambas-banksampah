// src/services/reportService.js
import prisma from '../lib/prisma';

export const reportService = {
  async getNasabahHistory(nasabahId, type = 'SEMUA', page = 1, limit = 20) {
    const id = parseInt(nasabahId);
    const skip = (page - 1) * limit;
    let history = [];

    // 1. Ambil data Setoran jika type SEMUA atau SETOR
    if (type === 'SEMUA' || type === 'SETOR') {
      const setoran = await prisma.transaksiSetor.findMany({
        where: { nasabah_id: id },
        orderBy: { waktu: 'desc' },
        include: { barang: true },
        skip: type === 'SETOR' ? skip : 0,
        take: type === 'SETOR' ? limit : undefined,
      });
      history.push(...setoran.map(item => ({ ...item, jenis: 'SETOR' })));
    }

    // 2. Ambil data Penarikan jika type SEMUA atau TARIK
    if (type === 'SEMUA' || type === 'TARIK') {
      const penarikan = await prisma.transaksiTarik.findMany({
        where: { nasabah_id: id },
        orderBy: { waktu: 'desc' },
        skip: type === 'TARIK' ? skip : 0,
        take: type === 'TARIK' ? limit : undefined,
      });
      history.push(...penarikan.map(item => ({ ...item, jenis: 'TARIK' })));
    }

    // 3. Urutkan berdasarkan waktu terbaru
    history.sort((a, b) => new Date(b.waktu) - new Date(a.waktu));

    // 4. Pagination untuk SEMUA
    if (type === 'SEMUA') {
      const totalItems = history.length;
      history = history.slice(skip, skip + limit);
      
      return {
        data: history,
        pagination: {
          page,
          limit,
          total: totalItems,
          totalPages: Math.ceil(totalItems / limit)
        }
      };
    }

    // 5. Count total untuk SETOR/TARIK
    const totalCount = type === 'SETOR' 
      ? await prisma.transaksiSetor.count({ where: { nasabah_id: id } })
      : await prisma.transaksiTarik.count({ where: { nasabah_id: id } });

    return {
      data: history,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }
};