"use client";
import { X, CalendarRange, SlidersHorizontal } from "lucide-react";

const TIPE_OPTIONS = [
  { value: "ALL",   label: "Semua Tipe"  },
  { value: "SETOR", label: "Setoran"     },
  { value: "TARIK", label: "Penarikan"   },
];

export default function TransaksiFilterPanel({ filters, onFilterChange, onReset, onClose }) {
  const isActive = filters.tipe !== "ALL" || filters.startDate || filters.endDate;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">

      {/* Panel Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">Filter Transaksi</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
          <X className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Tipe */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Tipe Transaksi
            </label>
            <div className="flex gap-1.5">
              {TIPE_OPTIONS.map(({ value, label }) => (
                <button key={value} onClick={() => onFilterChange("tipe", value)}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-medium transition-all ${
                    filters.tipe === value
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tanggal Mulai */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Tanggal Mulai
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
              <CalendarRange className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <input type="date" value={filters.startDate}
                onChange={(e) => onFilterChange("startDate", e.target.value)}
                className="bg-transparent w-full text-[12px] font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer" />
            </div>
          </div>

          {/* Tanggal Akhir */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Tanggal Akhir
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
              <CalendarRange className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <input type="date" value={filters.endDate} min={filters.startDate}
                onChange={(e) => onFilterChange("endDate", e.target.value)}
                className="bg-transparent w-full text-[12px] font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer" />
            </div>
          </div>

        </div>

        {isActive && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
            <button onClick={onReset}
              className="px-4 py-2 text-[11px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
