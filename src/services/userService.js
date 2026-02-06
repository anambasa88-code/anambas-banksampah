import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { logService } from "./logService";

const UNIT_PREFIXES = {
  1: "MTK",
  2: "MBS",
  3: "JMJ",
  4: "KMS",
  5: "LDK",
  6: "KBU",
  7: "TBS",
  8: "TKC",
  9: "PSN",
};

const ROLE_CODES = {
  PETUGAS: "P",
  NASABAH: "N",
};

export const userService = {
  async unblockUser(targetUserId, actorRole, actorId, actorBankSampahId) {
    const targetUser = await prisma.user.findUnique({
      where: { id_user: parseInt(targetUserId) },
    });

    if (!targetUser) throw new Error("User tidak ditemukan.");

    // VALIDASI UNIT: Petugas hanya boleh mengelola user di unit yang sama
    if (
      actorRole === "PETUGAS" &&
      targetUser.bank_sampah_id !== actorBankSampahId
    ) {
      throw new Error(
        "Anda tidak dapat mengelola user dari unit bank sampah lain.",
      );
    }

    // ATURAN HIERARKI: Petugas HANYA boleh unblock Nasabah
    if (actorRole === "PETUGAS" && targetUser.peran !== "NASABAH") {
      throw new Error(
        "Petugas hanya memiliki akses untuk membuka blokir Nasabah.",
      );
    }

    if (actorRole !== "ADMIN" && actorRole !== "PETUGAS") {
      throw new Error("Anda tidak memiliki otoritas untuk melakukan aksi ini.");
    }

    const result = await prisma.user.update({
      where: { id_user: targetUser.id_user },
      data: {
        is_blocked: false,
        wrong_pin_count: 0,
        last_wrong_pin_time: null,
      },
    });

    await logService.record(
      actorId,
      "UNBLOCK_USER",
      `Membuka blokir user: ${targetUser.nickname}`,
    );
    return result;
  },

  async resetPinHierarki(targetUserId, actorRole, actorId, actorBankSampahId) {
    const targetUser = await prisma.user.findUnique({
      where: { id_user: parseInt(targetUserId) },
    });

    if (!targetUser) throw new Error("User tidak ditemukan.");

    // VALIDASI UNIT: Petugas hanya boleh mengelola user di unit yang sama
    if (
      actorRole === "PETUGAS" &&
      targetUser.bank_sampah_id !== actorBankSampahId
    ) {
      throw new Error(
        "Anda tidak dapat mengelola user dari unit bank sampah lain.",
      );
    }

    if (actorRole === "PETUGAS" && targetUser.peran !== "NASABAH") {
      throw new Error("Petugas hanya boleh mereset PIN Nasabah.");
    }

    if (actorRole !== "ADMIN" && actorRole !== "PETUGAS") {
      throw new Error("Anda tidak memiliki otoritas untuk melakukan aksi ini.");
    }

    const defaultPin = targetUser.peran === "NASABAH" ? "123456" : "654321";
    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(defaultPin, salt);

    const result = await prisma.user.update({
      where: { id_user: targetUser.id_user },
      data: {
        pin_hash: hashedPin,
        must_change_pin: true,
        is_blocked: false,
        wrong_pin_count: 0,
        last_wrong_pin_time: null,
      },
    });

    await logService.record(
      actorId,
      "RESET_PIN",
      `Reset PIN ke default untuk user: ${targetUser.nickname}`,
    );
    return result;
  },

  async createUser(data, actorRole, actorId, actorBankSampahId) {
    try {
      const { nama_lengkap, peran, unit_id, nik, jenis_kelamin, alamat, desa } =
        data;

      if (!unit_id) throw new Error("Unit ID harus dipilih.");
      const bankSampahIdInt = parseInt(unit_id);

      // 1. VALIDASI NIK (Human Readable Error)
      if (nik && nik.trim() !== "") {
        const cleanedNik = nik.trim();

        // Cek panjang NIK tepat 16 digit
        if (cleanedNik.length !== 16) {
          throw new Error("NIK harus berjumlah tepat 16 digit.");
        }

        // Cek apakah NIK sudah dipakai di database
        const existingNik = await prisma.user.findFirst({
          where: { nik: cleanedNik },
        });

        if (existingNik) {
          throw new Error(
            "NIK sudah terdaftar pada petugas atau nasabah lain.",
          );
        }
      }

      // SECURITY: Petugas hanya boleh buat Nasabah untuk unitnya sendiri
      if (actorRole === "PETUGAS") {
        if (peran !== "NASABAH")
          throw new Error("Petugas hanya boleh mendaftarkan Nasabah baru.");
        if (bankSampahIdInt !== actorBankSampahId)
          throw new Error(
            "Petugas hanya boleh mendaftarkan nasabah di unitnya sendiri.",
          );
      }

      if (peran === "ADMIN")
        throw new Error("Role ADMIN tidak dapat dibuat melalui API.");
      if (actorRole !== "ADMIN" && actorRole !== "PETUGAS")
        throw new Error("Otoritas tidak sah.");

      // Logika generate nickname
      const unitPrefix = UNIT_PREFIXES[bankSampahIdInt] || "USR";
      const roleCode = ROLE_CODES[peran] || "X";

      const userCount = await prisma.user.count({
        where: { bank_sampah_id: bankSampahIdInt, peran: peran },
      });

      const nextNumber = (userCount + 1).toString().padStart(4, "0");
      const autoNickname = `${unitPrefix}-${roleCode}-${nextNumber}`;

      // Default PIN (Nasabah: 123456, Petugas: 654321)
      const defaultPin = peran === "NASABAH" ? "123456" : "654321";
      const salt = await bcrypt.genSalt(10);
      const hashedPin = await bcrypt.hash(defaultPin, salt);

      const newUser = await prisma.user.create({
        data: {
          nickname: autoNickname,
          nama_lengkap: nama_lengkap?.trim(),
          peran,
          jenis_kelamin,
          bank_sampah_id: bankSampahIdInt,
          pin_hash: hashedPin,
          nik: nik?.trim() || null,
          total_saldo: 0,
          must_change_pin: true,
          is_blocked: false,
          alamat: alamat || null,
          desa: desa || null,
        },
      });

      await logService.record(
        actorId,
        "CREATE_USER",
        `Mendaftarkan user baru: ${autoNickname} (${nama_lengkap})`,
      );

      return newUser;
    } catch (error) {
      console.error("ERROR DI USER_SERVICE (createUser):", error.message);
      throw error;
    }
  },
  async createPetugas(data, actorId, actorRole = "ADMIN") {
    try {
      const { nama_lengkap, jenis_kelamin, unit_id, nik } = data;

      if (!nama_lengkap?.trim()) {
        throw new Error("Nama lengkap wajib diisi");
      }
      if (!unit_id) {
        throw new Error("Unit Bank Sampah wajib dipilih");
      }

      const bankSampahIdInt = parseInt(unit_id, 10);
      if (isNaN(bankSampahIdInt) || bankSampahIdInt <= 0) {
        throw new Error("Unit Bank Sampah tidak valid");
      }

      // 1. Validasi Duplikasi NIK (Jika diisi)
      if (nik && nik.trim() !== "") {
        const existingNik = await prisma.user.findFirst({
          where: { nik: nik.trim() },
        });

        if (existingNik) {
          throw new Error(
            "NIK sudah terdaftar pada petugas atau nasabah lain.",
          );
        }
      }

      // Mapping "L" → "LAKI_LAKI", "P" → "PEREMPUAN"
      let finalJenisKelamin;
      if (jenis_kelamin === "L" || jenis_kelamin === "LAKI_LAKI") {
        finalJenisKelamin = "LAKI_LAKI";
      } else if (jenis_kelamin === "P" || jenis_kelamin === "PEREMPUAN") {
        finalJenisKelamin = "PEREMPUAN";
      } else {
        finalJenisKelamin = "LAKI_LAKI";
      }

      const peran = "PETUGAS";
      const unitPrefix = UNIT_PREFIXES[bankSampahIdInt] || "USR";
      const roleCode = ROLE_CODES[peran] || "P";

      const userCount = await prisma.user.count({
        where: { bank_sampah_id: bankSampahIdInt, peran: peran },
      });

      const nextNumber = (userCount + 1).toString().padStart(4, "0");
      const autoNickname = `${unitPrefix}-${roleCode}-${nextNumber}`;

      // Default PIN Petugas: 654321
      const defaultPin = "654321";
      const salt = await bcrypt.genSalt(10);
      const hashedPin = await bcrypt.hash(defaultPin, salt);

      const newPetugas = await prisma.user.create({
        data: {
          nickname: autoNickname,
          nama_lengkap: nama_lengkap.trim(),
          peran,
          jenis_kelamin: finalJenisKelamin,
          bank_sampah_id: bankSampahIdInt,
          pin_hash: hashedPin,
          nik: nik ? nik.trim() : null,
          total_saldo: 0,
          must_change_pin: true,
          is_blocked: false,
          is_active: true,
        },
      });

      await logService.record(
        actorId,
        "CREATE_PETUGAS",
        `Mendaftarkan petugas baru: ${autoNickname} (${nama_lengkap})`,
      );

      return newPetugas;
    } catch (error) {
      console.error("ERROR createPetugas:", error);
      throw error;
    }
  },

  async getDaftarPetugas({
    actorRole,
    search = "",
    page = 1,
    limit = 10,
    unitId = null,
  }) {
    if (actorRole !== "ADMIN") {
      throw new Error("Hanya Admin yang dapat melihat daftar petugas.");
    }

    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      peran: "PETUGAS",
      is_active: true,
    };

    if (unitId) {
      where.bank_sampah_id = Number(unitId);
    }

    if (search.trim()) {
      where.OR = [
        { nama_lengkap: { contains: search.trim(), mode: "insensitive" } },
        { nickname: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id_user: true,
          nickname: true,
          nama_lengkap: true,
          nik: true, // <--- TAMBAHKAN BARIS INI
          jenis_kelamin: true, // <--- TAMBAHKAN INI JUGA agar kolom Jenis Kelamin terisi
          unit: { select: { nama_unit: true } },
          created_at: true,
          is_blocked: true,
          wrong_pin_count: true,
        },
        orderBy: { created_at: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async listNasabah({
    unitId,
    actorRole,
    actorBankSampahId,
    search = "",
    page = 1,
    limit = 20,
  }) {
    const targetUnitId = Number(unitId);

    // Security: Petugas hanya unit sendiri, Admin boleh semua unit
    if (actorRole === "PETUGAS" && targetUnitId !== actorBankSampahId) {
      throw new Error("Petugas hanya boleh melihat nasabah di unit sendiri.");
    }
    if (!["ADMIN", "PETUGAS"].includes(actorRole)) {
      throw new Error("Akses ditolak.");
    }

    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      bank_sampah_id: targetUnitId,
      peran: "NASABAH",
      is_active: true,
    };

    if (search.trim()) {
      where.OR = [
        { nama_lengkap: { contains: search.trim(), mode: "insensitive" } },
        { nickname: { contains: search.trim(), mode: "insensitive" } },
        { nik: { contains: search.trim() } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id_user: true,
          nickname: true,
          nama_lengkap: true,
          nik: true,
          jenis_kelamin: true,
          desa: true, // <--- TAMBAHKAN INI
          alamat: true,
          total_saldo: true,
          is_blocked: true,
          created_at: true,
        },
        orderBy: { nama_lengkap: "asc" },
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },
  async getProfile(userId) {
    return await prisma.user.findUnique({
      where: { id_user: parseInt(userId) },
      select: {
        nickname: true,
        nama_lengkap: true,
        peran: true,
        total_saldo: true,
        unit: { select: { nama_unit: true } },
      },
    });
  },

  async updatePetugas(id_user, data, actorRole) {
    if (actorRole !== "ADMIN") {
      throw new Error("Hanya Admin yang dapat mengubah data petugas.");
    }

    const { nama_lengkap, jenis_kelamin, nik } = data;

    // 1. Cek duplikasi NIK (jika NIK diisi)
    if (nik && nik.trim() !== "") {
      const existingUser = await prisma.user.findFirst({
        where: {
          nik: nik.trim(),
          NOT: { id_user: parseInt(id_user) }, // Kecuali petugas yang sedang diedit
        },
      });

      if (existingUser) {
        throw new Error("NIK sudah terdaftar pada petugas atau nasabah lain.");
      }
    }

    // 2. Mapping Enum Jenis Kelamin
    let finalJenisKelamin = jenis_kelamin;
    if (jenis_kelamin === "L") finalJenisKelamin = "LAKI_LAKI";
    if (jenis_kelamin === "P") finalJenisKelamin = "PEREMPUAN";

    // 3. Eksekusi Update
    const updated = await prisma.user.update({
      where: { id_user: parseInt(id_user) },
      data: {
        nama_lengkap: nama_lengkap?.trim(),
        jenis_kelamin: finalJenisKelamin,
        nik: nik?.trim() || null,
      },
    });

    return updated;
  },
};
