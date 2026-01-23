const { PrismaClient } = require("../src/generated/prisma");
const bcrypt = require("bcryptjs"); // Untuk hashing PIN sesuai spek pin_hash
const prisma = new PrismaClient();

async function main() {
  // --- 1. SEED UNIT (Sudah ada di langkah sebelumnya) ---
  // ... kode units ...

  // --- 2. AMBIL DATA UNIT ---
  // Kita butuh ID Unit untuk menghubungkan Petugas dan Nasabah
  const allUnits = await prisma.unitBankSampah.findMany();
  if (allUnits.length === 0) {
    throw new Error("Gagal mengambil data Unit. Pastikan Unit sudah di-seed!");
  }

  console.log("Seeding Users (Admin, Petugas, Nasabah)...");

  // --- 3. LOGIKA HASH PIN ---
  const salt = await bcrypt.genSalt(10);
  const hashNasabah = await bcrypt.hash("123456", salt); // PIN Default Nasabah 
  const hashStaff = await bcrypt.hash("654321", salt);   // PIN Default Staff/Admin 

  const users = [
    // ADMIN (Tidak harus terikat unit) 
    {
      nickname: "superadmin",
      nama_lengkap: "Administrator Pusat",
      nik: "0000000000000000",
      jenis_kelamin: "LAKI_LAKI",
      peran: "ADMIN",
      pin_hash: hashStaff,
      bank_sampah_id: null,
    },
    // PETUGAS (Terikat ke Unit 1)
    {
      nickname: "petugas_matak",
      nama_lengkap: "Budi Petugas",
      nik: "1234567890123456",
      jenis_kelamin: "LAKI_LAKI",
      peran: "PETUGAS",
      pin_hash: hashStaff,
      bank_sampah_id: allUnits[0].id_unit,
    },
    // NASABAH (Terikat ke Unit 1)
    {
      nickname: "nasabah_ani",
      nama_lengkap: "Ani Nasabah",
      nik: "3210987654321098",
      jenis_kelamin: "PEREMPUAN",
      peran: "NASABAH",
      pin_hash: hashNasabah,
      bank_sampah_id: allUnits[0].id_unit,
      total_saldo: 50000.00, // Contoh saldo awal 
    }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { nickname: user.nickname }, // Unique berdasarkan nickname 
      update: {},
      create: user,
    });
  }

  console.log("User dummy berhasil disuntikkan!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });