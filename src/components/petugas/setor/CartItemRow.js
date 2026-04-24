"use client";
import { Trash2 } from "lucide-react";

const formatRp = (num) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);

export default function CartItemRow({ item, onRemove }) {
  const isCommunity = item.tipe_setoran === "COMMUNITY";

  return (
    <div className="flex items-center gap-3 py-2.5">
      {/* Dot indikator tipe setoran */}
      <div
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          isCommunity ? "bg-emerald-500" : "bg-blue-500"
        }`}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-slate-800 truncate">
          {item.nama_barang}
        </p>
        <p className="text-[10px] font-medium text-slate-500 mt-0.5">
          {item.berat} kg &times; {formatRp(item.harga_deal)}
          <span
            className={`ml-1.5 ${
              isCommunity ? "text-emerald-500" : "text-blue-500"
            }`}
          >
            · {isCommunity ? "Community" : "Ocean"}
          </span>
        </p>
      </div>

      {/* Harga + Hapus */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <p className="text-[12px] font-semibold text-emerald-600">
          {formatRp(item.total_rp)}
        </p>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-50 active:bg-red-100 transition-all"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}
