"use client";

import { forwardRef, useImperativeHandle } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const ExportRiwayatTransaksi = forwardRef(({ data, filters }, ref) => {

  const formatIDR = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(val || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  useImperativeHandle(ref, () => ({
    // EXPORT EXCEL
    generateExcel() {
      const headerInfo = [
        ["LAPORAN RIWAYAT TRANSAKSI BANK SAMPAH"],
        [`Periode: ${filters.startDate || "-"} s/d ${filters.endDate || "-"}`],
        [`Tipe: ${filters.tipe === "ALL" ? "Semua" : filters.tipe}`],
        [],
        ["No", "ID Transaksi", "Tipe", "Nasabah", "Barang/Detail", "Berat (kg)", "Harga Satuan", "Total Nominal", "Waktu", "Petugas"]
      ];

      const rows = data.map((t, idx) => [
        idx + 1,
        t.id_setor || t.id_tarik,
        t.jenis,
        t.nasabah.nama_lengkap,
        t.jenis === "SETOR" ? t.nama_barang_snapshot : "Penarikan Saldo",
        t.jenis === "SETOR" ? Number(t.berat).toFixed(2) : "-",
        t.jenis === "SETOR" ? t.harga_deal : "-",
        t.jenis === "SETOR" ? t.total_rp : t.jumlah_tarik,
        formatDate(t.waktu),
        t.petugas.nama_lengkap
      ]);

      const ws = XLSX.utils.aoa_to_sheet([...headerInfo, ...rows]);
      
      // Auto width
      const max_width = rows.reduce((w, r) => Math.max(w, r[3].length), 15);
      ws['!cols'] = [{ wch: 5 }, { wch: 15 }, { wch: 10 }, { wch: max_width }, { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Riwayat Transaksi");
      XLSX.writeFile(wb, `Riwayat_Transaksi_${new Date().getTime()}.xlsx`);
    },

    // EXPORT PDF
    generatePDF() {
      const doc = new jsPDF("l", "mm", "a4"); // Landscape biar muat banyak kolom
      
      doc.setFontSize(16);
      doc.text("RIWAYAT TRANSAKSI BANK SAMPAH", 14, 15);
      
      doc.setFontSize(10);
      doc.text(`Filter Periode: ${filters.startDate || "Semua"} s/d ${filters.endDate || "Semua"}`, 14, 22);
      doc.text(`Tipe: ${filters.tipe}`, 14, 27);

      autoTable(doc, {
        startY: 32,
        head: [["No", "ID", "Tipe", "Nasabah", "Detail", "Berat", "Total", "Waktu"]],
        body: data.map((t, idx) => [
          idx + 1,
          t.id_setor || t.id_tarik,
          t.jenis,
          t.nasabah.nama_lengkap,
          t.jenis === "SETOR" ? t.nama_barang_snapshot : "Penarikan Saldo",
          t.jenis === "SETOR" ? `${parseFloat(t.berat).toFixed(2)} kg` : "-",
          formatIDR(t.jenis === "SETOR" ? t.total_rp : t.jumlah_tarik),
          formatDate(t.waktu)
        ]),
        theme: "grid",
        headStyles: { fillColor: [22, 163, 74] },
        styles: { fontSize: 8 }
      });

      doc.save(`Riwayat_Transaksi.pdf`);
    }
  }));

  return null;
});

ExportRiwayatTransaksi.displayName = "ExportRiwayatTransaksi";
export default ExportRiwayatTransaksi;