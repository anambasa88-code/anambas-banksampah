// src/services/logService.js
import prisma from '../lib/prisma';

export const logService = {

  async record(userId, aksi, detail, payload = null) {
    return await prisma.logAktivitas.create({
      data: {
        user_id: userId,
        aksi: aksi, 
        detail: detail,
        payload_json: payload, 
      },
    });
  },
};