"use client";

import { forwardRef, useImperativeHandle } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const ExportDashboardPetugas = forwardRef(({ data, startDate, endDate, category }, ref) => {

  const formatIDR = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(val || 0);
  };

  const LIST_KATEGORI = ["PLASTIK", "LOGAM", "KERTAS", "LAINNYA", "CAMPURAN"];

  useImperativeHandle(ref, () => ({
    // === MESIN EXCEL UPGRADE (ANTI BERANTAKAN) ===
    generateExcel() {
      // 1. Siapkan Data Row demi Row
      const rows = [
        ["LAPORAN OPERASIONAL BANK SAMPAH"],
        [`Periode: ${startDate || "Semua"} s/d ${endDate || "Sekarang"}`],
        [`Kategori Filter: ${category || "Semua"}`],
        [],
        ["RINGKASAN STATISTIK"],
        ["Total Nasabah", data.total_nasabah || 0, "Orang"],
        ["Laki-laki", data.gender_breakdown?.LAKI_LAKI?.jumlah || 0, `${data.gender_breakdown?.LAKI_LAKI?.persen || 0}%`],
        ["Perempuan", data.gender_breakdown?.PEREMPUAN?.jumlah || 0, `${data.gender_breakdown?.PEREMPUAN?.persen || 0}%`],
        ["Total Berat", (data.total_kg || 0).toFixed(2), "kg"],
        ["Total Perputaran", data.total_rp || 0, "IDR"],
        [],
        ["DISTRIBUSI PER KATEGORI"],
      ];

      // Tambahkan Kategori Utama
      LIST_KATEGORI.forEach(kat => {
        rows.push([kat, (data.per_kategori?.[kat] || 0).toFixed(2), "kg"]);
      });

      rows.push([], ["DETAIL DATA SAMPAH TERKUMPUL"]);
      rows.push(["No", "Nama Sampah", "Kategori", "Total Berat (kg)", "Total Transaksi"]);
      
      (data.sampah_terkumpul || []).forEach((item, idx) => {
        rows.push([
          idx + 1,
          item.nama_sampah,
          item.kategori_utama || "LAINNYA",
          Number(item.total_berat || 0),
          item.total_transaksi
        ]);
      });

      // 2. Buat Worksheet
      const ws = XLSX.utils.aoa_to_sheet(rows);

      // 3. ATUR LEBAR KOLOM (Auto Width)
      // Kita hitung karakter terpanjang di tiap kolom
      const colWidths = rows[rows.length - 1].map((_, colIndex) => {
        const maxLength = rows.reduce((max, row) => {
          const cellValue = row[colIndex] ? row[colIndex].toString() : "";
          return Math.max(max, cellValue.length);
        }, 10); // Minimal lebar 10
        return { wch: maxLength + 2 }; // Tambah padding 2 karakter
      });
      ws["!cols"] = colWidths;

      // 4. Buat Workbook dan Simpan
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan_Bank_Sampah");

      XLSX.writeFile(wb, `Laporan_Petugas_${new Date().getTime()}.xlsx`);
    },

    // === MESIN PDF TETAP (SUDAH BAGUS) ===
    generatePDF() {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(22, 163, 74);
      doc.text("LAPORAN OPERASIONAL BANK SAMPAH", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Periode: ${startDate || "Semua"} - ${endDate || "Sekarang"}`, 14, 28);
      doc.text(`Kategori Filter: ${category || "Semua"}`, 14, 34);

      autoTable(doc, {
        startY: 40,
        head: [["Statistik Utama", "Nilai", "Satuan"]],
        body: [
          ["Total Nasabah", data.total_nasabah || 0, "Orang"],
          ["Laki-laki", data.gender_breakdown?.LAKI_LAKI?.jumlah || 0, `${data.gender_breakdown?.LAKI_LAKI?.persen || 0}%`],
          ["Perempuan", data.gender_breakdown?.PEREMPUAN?.jumlah || 0, `${data.gender_breakdown?.PEREMPUAN?.persen || 0}%`],
          ["Total Berat Sampah", (data.total_kg || 0).toFixed(2), "Kg"],
          ["Total Perputaran Uang", formatIDR(data.total_rp), ""],
        ],
        theme: "striped",
        headStyles: { fillColor: [22, 163, 74] }
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Kategori Utama", "Berat", "Satuan"]],
        body: LIST_KATEGORI.map(kat => [
          kat, 
          (data.per_kategori?.[kat] || 0).toFixed(2),
          "kg"
        ]),
        theme: "grid",
        headStyles: { fillColor: [51, 65, 85] }
      });

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("Detail Sampah Terkumpul:", 14, doc.lastAutoTable.finalY + 12);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 18,
        head: [["No", "Nama Sampah", "Kategori", "Berat (kg)", "Transaksi"]],
        body: (data.sampah_terkumpul || []).map((item, idx) => [
          idx + 1,
          item.nama_sampah,
          item.kategori_utama || "LAINNYA",
          (Number(item.total_berat) || 0).toFixed(2),
          item.total_transaksi
        ]),
        theme: "grid",
        styles: { fontSize: 8 }
      });

      doc.save(`Laporan_Lengkap_Petugas.pdf`);
    }
  }));

  return null;
});

ExportDashboardPetugas.displayName = "ExportDashboardPetugas";
export default ExportDashboardPetugas;