/*
  Warnings:

  - A unique constraint covering the columns `[nama_unit]` on the table `unit_bank_sampah` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "unit_bank_sampah_nama_unit_key" ON "unit_bank_sampah"("nama_unit");
