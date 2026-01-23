-- CreateEnum
CREATE TYPE "MetodeBayar" AS ENUM ('TABUNG', 'JUAL_LANGSUNG');

-- AlterTable
ALTER TABLE "transaksi_setor" ADD COLUMN     "metode_bayar" "MetodeBayar" NOT NULL DEFAULT 'TABUNG';
