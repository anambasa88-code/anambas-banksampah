-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- CreateEnum
CREATE TYPE "Peran" AS ENUM ('ADMIN', 'PETUGAS', 'NASABAH');

-- CreateEnum
CREATE TYPE "KategoriUtama" AS ENUM ('PLASTIK', 'LOGAM', 'KERTAS', 'LAINNYA', 'CAMPURAN');

-- CreateEnum
CREATE TYPE "KodeDaurUlang" AS ENUM ('ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN');

-- CreateEnum
CREATE TYPE "TipeSetoran" AS ENUM ('OCEAN_DEBRIS', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "StatusTarik" AS ENUM ('PENDING', 'SUKSES', 'DITOLAK');

-- CreateTable
CREATE TABLE "unit_bank_sampah" (
    "id_unit" SERIAL NOT NULL,
    "nama_unit" VARCHAR(50) NOT NULL,
    "alamat_unit" TEXT NOT NULL,

    CONSTRAINT "unit_bank_sampah_pkey" PRIMARY KEY ("id_unit")
);

-- CreateTable
CREATE TABLE "users" (
    "id_user" SERIAL NOT NULL,
    "nickname" VARCHAR(20) NOT NULL,
    "nama_lengkap" VARCHAR(100) NOT NULL,
    "nik" VARCHAR(16) NOT NULL,
    "jenis_kelamin" "JenisKelamin" NOT NULL,
    "peran" "Peran" NOT NULL,
    "bank_sampah_id" INTEGER,
    "total_saldo" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "pin_hash" VARCHAR(255) NOT NULL,
    "wrong_pin_count" INTEGER NOT NULL DEFAULT 0,
    "last_wrong_pin_time" TIMESTAMP(3),
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "must_change_pin" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "master_sampah" (
    "id_barang" SERIAL NOT NULL,
    "kategori_utama" "KategoriUtama" NOT NULL,
    "nama_barang" VARCHAR(100) NOT NULL,
    "keterangan_pusat" TEXT NOT NULL,
    "harga_pusat" DECIMAL(15,2) NOT NULL,
    "batas_atas" DECIMAL(15,2) NOT NULL,
    "batas_bawah" DECIMAL(15,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "master_sampah_pkey" PRIMARY KEY ("id_barang")
);

-- CreateTable
CREATE TABLE "harga_lokal_unit" (
    "id_harga_lokal" SERIAL NOT NULL,
    "barang_id" INTEGER NOT NULL,
    "bank_sampah_id" INTEGER NOT NULL,
    "harga_lokal" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "harga_lokal_unit_pkey" PRIMARY KEY ("id_harga_lokal")
);

-- CreateTable
CREATE TABLE "history_harga" (
    "id_history" SERIAL NOT NULL,
    "barang_id" INTEGER NOT NULL,
    "bank_sampah_id" INTEGER,
    "harga_lama" DECIMAL(15,2) NOT NULL,
    "harga_baru" DECIMAL(15,2) NOT NULL,
    "diubah_oleh" INTEGER NOT NULL,
    "waktu_perubahan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "history_harga_pkey" PRIMARY KEY ("id_history")
);

-- CreateTable
CREATE TABLE "detail_plastik" (
    "barang_id" INTEGER NOT NULL,
    "kode_daur_ulang" "KodeDaurUlang" NOT NULL,
    "nama_kimia" VARCHAR(100) NOT NULL,
    "klasifikasi" VARCHAR(50) NOT NULL,

    CONSTRAINT "detail_plastik_pkey" PRIMARY KEY ("barang_id")
);

-- CreateTable
CREATE TABLE "transaksi_setor" (
    "id_setor" VARCHAR(20) NOT NULL,
    "nasabah_id" INTEGER NOT NULL,
    "petugas_id" INTEGER NOT NULL,
    "tipe_setoran" "TipeSetoran" NOT NULL,
    "barang_id" INTEGER NOT NULL,
    "nama_barang_snapshot" VARCHAR(100) NOT NULL,
    "berat" DECIMAL(10,2) NOT NULL,
    "harga_deal" DECIMAL(15,2) NOT NULL,
    "total_rp" DECIMAL(15,2) NOT NULL,
    "catatan_petugas" TEXT NOT NULL,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaksi_setor_pkey" PRIMARY KEY ("id_setor")
);

-- CreateTable
CREATE TABLE "transaksi_tarik" (
    "id_tarik" VARCHAR(20) NOT NULL,
    "nasabah_id" INTEGER NOT NULL,
    "petugas_id" INTEGER NOT NULL,
    "jumlah_tarik" DECIMAL(15,2) NOT NULL,
    "status" "StatusTarik" NOT NULL,
    "catatan_tarik" TEXT,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaksi_tarik_pkey" PRIMARY KEY ("id_tarik")
);

-- CreateTable
CREATE TABLE "log_aktivitas" (
    "id_log" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "aksi" VARCHAR(255) NOT NULL,
    "detail" TEXT NOT NULL,
    "payload_json" JSONB,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_aktivitas_pkey" PRIMARY KEY ("id_log")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nickname_key" ON "users"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "users_nik_key" ON "users"("nik");

-- CreateIndex
CREATE INDEX "users_nickname_idx" ON "users"("nickname");

-- CreateIndex
CREATE INDEX "users_nik_idx" ON "users"("nik");

-- CreateIndex
CREATE INDEX "users_peran_idx" ON "users"("peran");

-- CreateIndex
CREATE INDEX "users_bank_sampah_id_idx" ON "users"("bank_sampah_id");

-- CreateIndex
CREATE INDEX "users_is_blocked_idx" ON "users"("is_blocked");

-- CreateIndex
CREATE INDEX "master_sampah_kategori_utama_idx" ON "master_sampah"("kategori_utama");

-- CreateIndex
CREATE INDEX "master_sampah_is_active_idx" ON "master_sampah"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "harga_lokal_unit_barang_id_bank_sampah_id_key" ON "harga_lokal_unit"("barang_id", "bank_sampah_id");

-- CreateIndex
CREATE INDEX "transaksi_setor_nasabah_id_idx" ON "transaksi_setor"("nasabah_id");

-- CreateIndex
CREATE INDEX "transaksi_setor_petugas_id_idx" ON "transaksi_setor"("petugas_id");

-- CreateIndex
CREATE INDEX "transaksi_setor_waktu_idx" ON "transaksi_setor"("waktu");

-- CreateIndex
CREATE INDEX "transaksi_tarik_nasabah_id_idx" ON "transaksi_tarik"("nasabah_id");

-- CreateIndex
CREATE INDEX "transaksi_tarik_status_idx" ON "transaksi_tarik"("status");

-- CreateIndex
CREATE INDEX "transaksi_tarik_waktu_idx" ON "transaksi_tarik"("waktu");

-- CreateIndex
CREATE INDEX "log_aktivitas_user_id_idx" ON "log_aktivitas"("user_id");

-- CreateIndex
CREATE INDEX "log_aktivitas_waktu_idx" ON "log_aktivitas"("waktu");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_bank_sampah_id_fkey" FOREIGN KEY ("bank_sampah_id") REFERENCES "unit_bank_sampah"("id_unit") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "harga_lokal_unit" ADD CONSTRAINT "harga_lokal_unit_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "master_sampah"("id_barang") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "harga_lokal_unit" ADD CONSTRAINT "harga_lokal_unit_bank_sampah_id_fkey" FOREIGN KEY ("bank_sampah_id") REFERENCES "unit_bank_sampah"("id_unit") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_harga" ADD CONSTRAINT "history_harga_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "master_sampah"("id_barang") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_harga" ADD CONSTRAINT "history_harga_bank_sampah_id_fkey" FOREIGN KEY ("bank_sampah_id") REFERENCES "unit_bank_sampah"("id_unit") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_harga" ADD CONSTRAINT "history_harga_diubah_oleh_fkey" FOREIGN KEY ("diubah_oleh") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_plastik" ADD CONSTRAINT "detail_plastik_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "master_sampah"("id_barang") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_setor" ADD CONSTRAINT "transaksi_setor_nasabah_id_fkey" FOREIGN KEY ("nasabah_id") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_setor" ADD CONSTRAINT "transaksi_setor_petugas_id_fkey" FOREIGN KEY ("petugas_id") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_setor" ADD CONSTRAINT "transaksi_setor_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "master_sampah"("id_barang") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_tarik" ADD CONSTRAINT "transaksi_tarik_nasabah_id_fkey" FOREIGN KEY ("nasabah_id") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_tarik" ADD CONSTRAINT "transaksi_tarik_petugas_id_fkey" FOREIGN KEY ("petugas_id") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_aktivitas" ADD CONSTRAINT "log_aktivitas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
