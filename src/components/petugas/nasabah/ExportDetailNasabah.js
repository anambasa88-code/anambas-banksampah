"use client";

import { forwardRef, useImperativeHandle } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const ExportDetailNasabah = forwardRef(({ nasabah, data, filter }, ref) => {
  const formatIDR = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  useImperativeHandle(ref, () => ({
    // === EXPORT EXCEL ===
    generateExcel() {
      const rows = [
        ["LAPORAN DETAIL NASABAH"],
        ["Nama Lengkap", nasabah.nama_lengkap],
        ["Nickname", nasabah.nickname],
        ["NIK", nasabah.nik || "-"],
        ["Alamat", nasabah.alamat || "-"],
        ["Saldo Saat Ini", formatIDR(nasabah.total_saldo)],
        [],
        ["RIWAYAT TRANSAKSI", `Filter: ${filter}`],
        ["No", "Tanggal", "Jenis", "Detail Barang/Tipe", "Berat (kg)", "Harga/kg", "Total/Jumlah", "Catatan"],
      ];

      data.forEach((item, idx) => {
        rows.push([
          idx + 1,
          formatDate(item.waktu),
          item.jenis,
          item.jenis === "SETOR" ? item.barang?.nama : "Penarikan Saldo",
          item.jenis === "SETOR" ? item.berat : "-",
          item.jenis === "SETOR" ? item.harga_per_kg : "-",
          item.jenis === "SETOR" ? item.total_rp : item.jumlah,
          item.jenis === "SETOR" ? item.catatan_petugas : item.catatan_tarik,
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Detail Nasabah");
      XLSX.writeFile(wb, `Detail_Nasabah_${nasabah.nickname}.xlsx`);
    },

    // === EXPORT PDF ===
    generatePDF() {
      const doc = new jsPDF();

      // Header Profil
      doc.setFontSize(18);
      doc.setTextColor(22, 163, 74);
      doc.text("LAPORAN TRANSAKSI NASABAH", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(`Nama: ${nasabah.nama_lengkap} (${nasabah.nickname})`, 14, 30);
      doc.text(`NIK: ${nasabah.nik || "-"}`, 14, 35);
      doc.text(`Alamat: ${nasabah.alamat || "-"}`, 14, 40);
      doc.text(`Saldo Saat Ini: ${formatIDR(nasabah.total_saldo)}`, 14, 45);

      autoTable(doc, {
        startY: 55,
        head: [["Tanggal", "Jenis", "Detail", "Berat", "Total", "Catatan"]],
        body: data.map((item) => [
          formatDate(item.waktu),
          item.jenis,
          item.jenis === "SETOR" ? `${item.barang?.nama}\n(${item.barang?.tipe})` : "Tarik Saldo",
          item.jenis === "SETOR" ? `${item.berat} kg` : "-",
          formatIDR(item.jenis === "SETOR" ? item.total_rp : item.jumlah),
          (item.jenis === "SETOR" ? item.catatan_petugas : item.catatan_tarik) || "-",
        ]),
        theme: "grid",
        headStyles: { fillColor: [22, 163, 74] },
        styles: { fontSize: 8 },
      });

      doc.save(`Transaksi_${nasabah.nickname}.pdf`);
    },
  }));

  return null;
});

ExportDetailNasabah.displayName = "ExportDetailNasabah";
export default ExportDetailNasabah;