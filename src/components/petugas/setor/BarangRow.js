"use client";
import { ChevronRight, Check } from "lucide-react";

const CATEGORY_COLORS = {
  PLASTIK:  { dot: "bg-blue-500",    text: "text-blue-500"    },
  KERTAS:   { dot: "bg-amber-500",   text: "text-amber-500"   },
  LOGAM:    { dot: "bg-slate-500",   text: "text-slate-500"   },
  CAMPURAN: { dot: "bg-purple-500",  text: "text-purple-500"  },
};

const formatRp = (num) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);

export default function BarangRow({ barang, isSelected, onClick }) {
  const color = CATEGORY_COLORS[barang.kategori_utama] || {
    dot: "bg-slate-400",
    text: "text-slate-400",
  };

  return (
    <div
      onClick={() => onClick(barang)}
      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all duration-150 border-l-2 ${
        isSelected
          ? "bg-emerald-50 border-l-emerald-500"
          : "border-l-transparent hover:bg-slate-50 hover:border-l-slate-200"
      }`}
    >
      {/* Category dot */}
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${color.dot}`} />

      {/* Nama + Kategori */}
      <div className="flex-1 min-w-0">
        <p className={`text-[12px] font-semibold truncate ${isSelected ? "text-emerald-700" : "text-slate-800"}`}>
          {barang.nama_barang}
        </p>
        <span className={`text-[10px] font-medium tracking-wide ${color.text}`}>
          {barang.kategori_utama}
        </span>
      </div>

      {/* Harga */}
      <div className="text-right flex-shrink-0 space-y-0.5">
        <p className="text-[12px] font-semibold text-emerald-600">
          {formatRp(barang.harga_aktif)}
        </p>
        {barang.harga_lokal && (
          <p className="text-[10px] font-medium text-blue-500">
            Lokal: {formatRp(barang.harga_lokal)}
          </p>
        )}
      </div>

      {/* Icon kanan */}
      <div className="flex-shrink-0 ml-1">
        {isSelected ? (
          <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check size={9} className="text-white" strokeWidth={2.5} />
          </div>
        ) : (
          <ChevronRight size={13} className="text-slate-300" />
        )}
      </div>
    </div>
  );
}
