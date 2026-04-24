"use client";
import { CalendarRange, CalendarDays, RefreshCw, Search } from "lucide-react";

export default function FilterSection({
  filterMode, setFilterMode,
  startDate, setStartDate,
  endDate, setEndDate,
  startMonth, setStartMonth,
  endMonth, setEndMonth,
  isDateInvalid,
  loading,
  onSearch,
  onReset,
  onQuickFilter,
}) {
  return (
    <div className="space-y-4">

      {/* Mode Tab + Quick Shortcuts */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
          {["range", "month"].map((mode) => (
            <button key={mode} onClick={() => setFilterMode(mode)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filterMode === mode
                  ? "bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 hover:text-slate-700"
              }`}>
              {mode === "range" ? "Harian" : "Bulanan"}
            </button>
          ))}
        </div>

        {filterMode === "range" && (
          <div className="flex items-center gap-2">
            {["today", "week", "month"].map((type) => (
              <button key={type} onClick={() => onQuickFilter(type)}
                className="px-3 py-1.5 text-[10px] font-bold uppercase bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-emerald-500 transition-all text-slate-500 hover:text-emerald-600 shadow-sm">
                {type === "today" ? "Hari Ini" : type === "week" ? "1 Pekan" : "Bulan Ini"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-stretch md:items-center">

          {filterMode === "range" ? (
            <>
              <div className="flex-1 p-3 border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-800 group">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Mulai Dari</label>
                <div className="flex items-center gap-2">
                  <CalendarRange className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent w-full text-sm font-semibold outline-none text-slate-700 dark:text-slate-200 cursor-pointer" />
                </div>
              </div>
              <div className="flex-1 p-3 border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-800 group">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Sampai Dengan</label>
                <div className="flex items-center gap-2">
                  <CalendarRange className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                  <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent w-full text-sm font-semibold outline-none text-slate-700 dark:text-slate-200 cursor-pointer" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 p-3 border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-800 group">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Dari Bulan</label>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-500" />
                  <input type="month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)}
                    className="bg-transparent w-full text-sm font-bold outline-none text-slate-800 dark:text-white cursor-pointer" />
                </div>
              </div>
              <div className="flex-1 p-3 border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-800 group">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Sampai Bulan</label>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-500" />
                  <input type="month" value={endMonth} min={startMonth} onChange={(e) => setEndMonth(e.target.value)}
                    className="bg-transparent w-full text-sm font-bold outline-none text-slate-800 dark:text-white cursor-pointer" />
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="p-3 px-6 flex items-center justify-center gap-3 bg-slate-50/50 dark:bg-slate-800/20">
            {(startDate || endDate || startMonth || endMonth) && (
              <button onClick={onReset} title="Reset"
                className="p-2 text-slate-400 hover:text-red-500 transition-all">
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button onClick={onSearch} disabled={loading || isDateInvalid}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 shadow-sm border ${
                isDateInvalid
                  ? "bg-red-50 text-red-600 border-red-200 cursor-not-allowed"
                  : "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700"
              } disabled:opacity-50`}>
              {loading
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : <Search className="w-4 h-4" />}
              <span>{isDateInvalid ? "Range Error!" : "Cari Data"}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
