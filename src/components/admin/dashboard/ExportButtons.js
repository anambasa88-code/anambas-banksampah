"use client";
import { FileSpreadsheet, FileText } from "lucide-react";

export default function ExportButtons({ 
  data, 
  exportRef, 
  filters, 
  activeTab 
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => exportRef.current?.generateExcel()}
        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Export Excel
      </button>
      <button
        onClick={() => exportRef.current?.generatePDF()}
        className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]"
      >
        <FileText className="w-4 h-4" />
        Export PDF
      </button>
    </div>
  );
}
