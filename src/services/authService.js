// src/services/authService.js
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

export const authService = {

async verifyLogin(nickname, inputPin) {
  const user = await prisma.user.findUnique({
    where: { nickname },
  });

  if (!user) throw new Error('User tidak ditemukan.');
  if (user.is_blocked) throw new Error('Akun Anda sedang diblokir. Silakan hubungi Petugas'); 

  const isPinMatch = await bcrypt.compare(inputPin, user.pin_hash); 

  if (isPinMatch) {
    await prisma.user.update({
      where: { id_user: user.id_user },
      data: { wrong_pin_count: 0, last_wrong_pin_time: null },
    });
    
    // Return SEMUA data yang dibutuhkan
    return {
      id_user: user.id_user,
      nickname: user.nickname,
      peran: user.peran,
      bank_sampah_id: user.bank_sampah_id,
      must_change_pin: user.must_change_pin  // ← TAMBAHKAN INI
    }; 
  } else {
    const newWrongCount = user.wrong_pin_count + 1;
    const shouldBlock = newWrongCount >= 5; 

    await prisma.user.update({
      where: { id_user: user.id_user },
      data: {
        wrong_pin_count: newWrongCount,
        last_wrong_pin_time: new Date(),
        is_blocked: shouldBlock,
      },
    });

    if (shouldBlock) throw new Error('Akun Anda otomatis diblokir karena salah PIN 5 kali.'); 
    throw new Error(`PIN Salah! Sisa percobaan: ${5 - newWrongCount}x lagi.`);
  }
},
  async changePin(userId, oldPin, newPin) {
    // 1. Cari user
    const user = await prisma.user.findUnique({
      where: { id_user: parseInt(userId) },
    });

    if (!user) throw new Error("User tidak ditemukan.");

    // 2. Verifikasi PIN lama
    const isPinMatch = await bcrypt.compare(oldPin, user.pin_hash);
    if (!isPinMatch) {
      throw new Error("PIN lama salah.");
    }

    // 3. Validasi: PIN baru tidak boleh sama dengan PIN lama
    const isSameAsOld = await bcrypt.compare(newPin, user.pin_hash);
    if (isSameAsOld) {
      throw new Error("PIN baru tidak boleh sama dengan PIN lama.");
    }

    // 4. Hash PIN baru & Update
    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(newPin, salt);

    return await prisma.user.update({
      where: { id_user: user.id_user },
      data: {
        pin_hash: hashedPin,
        must_change_pin: false, // User sudah memenuhi kewajiban ganti PIN
      },
    });
  },
};