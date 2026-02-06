"use client";

import { forwardRef, useImperativeHandle } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const ExportDashboardAdmin = forwardRef(({ data, startDate, endDate, category }, ref) => {

  const formatIDR = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(val || 0);
  };

  const LIST_KATEGORI = ["PLASTIK", "LOGAM", "KERTAS", "LAINNYA", "CAMPURAN"];
  
  // Ambil data global agar kode di bawah lebih pendek
  const gData = data?.global || {};

  useImperativeHandle(ref, () => ({
    generateExcel() {
      const rows = [
        ["LAPORAN ANALITIK GLOBAL BANK SAMPAH (ADMIN)"],
        [`Periode: ${startDate || "Semua"} s/d ${endDate || "Sekarang"}`],
        [`Kategori Filter: ${category || "Semua"}`],
        [],
        ["RINGKASAN STATISTIK GLOBAL"],
        ["Total Nasabah", gData.total_nasabah || 0, "Orang"],
        ["Laki-laki", gData.gender_breakdown?.LAKI_LAKI?.jumlah || 0, `${gData.gender_breakdown?.LAKI_LAKI?.persen || 0}%`],
        ["Perempuan", gData.gender_breakdown?.PEREMPUAN?.jumlah || 0, `${gData.gender_breakdown?.PEREMPUAN?.persen || 0}%`],
        ["Total Berat Global", (gData.total_kg || 0).toFixed(2), "kg"],
        ["Total Perputaran Uang", gData.total_rp || 0, "IDR"],
        ["Saldo Aktif Nasabah", gData.saldo_aktif || 0, "IDR"],
        [],
        ["DISTRIBUSI PER KATEGORI (SELURUH UNIT)"],
      ];

      LIST_KATEGORI.forEach(kat => {
        rows.push([kat, (gData.per_kategori?.[kat] || 0).toFixed(2), "kg"]);
      });

      rows.push([], ["DETAIL SAMPAH TERKUMPUL (GLOBAL)"]);
      rows.push(["No", "Nama Sampah", "Kategori", "Total Berat (kg)", "Total Transaksi"]);
      
      (gData.sampah_terkumpul || []).forEach((item, idx) => {
        rows.push([
          idx + 1,
          item.nama_sampah,
          item.kategori_utama || "LAINNYA",
          Number(item.total_berat || 0),
          item.total_transaksi
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);
      const colWidths = rows[rows.length - 1].map((_, colIndex) => {
        const maxLength = rows.reduce((max, row) => {
          const cellValue = row[colIndex] ? row[colIndex].toString() : "";
          return Math.max(max, cellValue.length);
        }, 10);
        return { wch: maxLength + 2 };
      });
      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan_Global_Admin");
      XLSX.writeFile(wb, `Laporan_Global_Admin_${new Date().getTime()}.xlsx`);
    },

    generatePDF() {
      const doc = new jsPDF();
      // Warna Biru Admin (37, 99, 235)
      const primaryColor = [37, 99, 235];

      doc.setFontSize(18);
      doc.setTextColor(37, 99, 235);
      doc.text("LAPORAN GLOBAL BANK SAMPAH", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Periode: ${startDate || "Semua"} - ${endDate || "Sekarang"}`, 14, 28);
      doc.text(`Kategori Filter: ${category || "Semua"}`, 14, 34);

      autoTable(doc, {
        startY: 40,
        head: [["Statistik Utama Global", "Nilai", "Satuan"]],
        body: [
          ["Total Nasabah", gData.total_nasabah || 0, "Orang"],
          ["Laki-laki", gData.gender_breakdown?.LAKI_LAKI?.jumlah || 0, `${gData.gender_breakdown?.LAKI_LAKI?.persen || 0}%`],
          ["Perempuan", gData.gender_breakdown?.PEREMPUAN?.jumlah || 0, `${gData.gender_breakdown?.PEREMPUAN?.persen || 0}%`],
          ["Total Berat Sampah", (gData.total_kg || 0).toFixed(2), "Kg"],
          ["Total Perputaran Uang", formatIDR(gData.total_rp), ""],
          ["Total Saldo Aktif", formatIDR(gData.saldo_aktif), ""],
        ],
        theme: "striped",
        headStyles: { fillColor: primaryColor }
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["Kategori Utama", "Berat Global", "Satuan"]],
        body: LIST_KATEGORI.map(kat => [
          kat, 
          (gData.per_kategori?.[kat] || 0).toFixed(2),
          "kg"
        ]),
        theme: "grid",
        headStyles: { fillColor: [51, 65, 85] }
      });

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("Detail Sampah Terkumpul (Seluruh Unit):", 14, doc.lastAutoTable.finalY + 12);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 18,
        head: [["No", "Nama Sampah", "Kategori", "Berat (kg)", "Transaksi"]],
        body: (gData.sampah_terkumpul || []).map((item, idx) => [
          idx + 1,
          item.nama_sampah,
          item.kategori_utama || "LAINNYA",
          (Number(item.total_berat) || 0).toFixed(2),
          item.total_transaksi
        ]),
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: primaryColor }
      });

      doc.save(`Laporan_Global_Admin.pdf`);
    }
  }));

  return null;
});

ExportDashboardAdmin.displayName = "ExportDashboardAdmin";
export default ExportDashboardAdmin;