"use client";
import { X, Receipt, ArrowUpRight, Waves } from "lucide-react";

export default function DetailTransaksiModal({ isOpen, onClose, transaction, formatRupiah }) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
              <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-800 dark:text-white">Rincian Setoran</p>
              <p className="text-[10px] text-slate-400">{transaction.subItems.length} jenis sampah</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Items */}
        <div className="p-4 space-y-2 max-h-[55vh] overflow-y-auto">
          {transaction.subItems.map((item, idx) => (
            <div key={idx}
              className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  item.tipe_setoran === "COMMUNITY"
                    ? "bg-emerald-100 dark:bg-emerald-900/40"
                    : "bg-blue-100 dark:bg-blue-900/40"
                }`}>
                  {item.tipe_setoran === "COMMUNITY"
                    ? <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                    : <Waves className="w-4 h-4 text-blue-500" />}
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-slate-800 dark:text-white">
                    {item.nama_barang_snapshot || "Sampah"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {Number(item.berat).toLocaleString("id-ID")} kg × {formatRupiah(item.harga_deal)}
                  </p>
                </div>
              </div>
              <span className={`text-[9px] px-2 py-1 rounded-lg font-semibold ring-1 ${
                item.tipe_setoran === "COMMUNITY"
                  ? "bg-emerald-50 ring-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:ring-emerald-800 dark:text-emerald-400"
                  : "bg-blue-50 ring-blue-100 text-blue-600 dark:bg-blue-900/20 dark:ring-blue-800 dark:text-blue-400"
              }`}>
                {item.tipe_setoran === "COMMUNITY" ? "Community" : "Ocean"}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 bg-emerald-600 dark:bg-emerald-700">
          <div>
            <p className="text-[10px] text-emerald-200 font-medium">Total Setoran</p>
            <p className="text-xl font-bold text-white">{formatRupiah(transaction.totalGroupRp)}</p>
          </div>
          <button onClick={onClose}
            className="px-5 py-2.5 bg-white text-emerald-600 rounded-xl text-[12px] font-semibold hover:bg-emerald-50 transition-all active:scale-95 shadow-sm">
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
