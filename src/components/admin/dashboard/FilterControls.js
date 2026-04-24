"use client";
import { Search } from "lucide-react";

export default function FilterControls({ 
  filters, 
  setFilters, 
  handleFilter 
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 mb-6 shadow-sm">
      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl w-fit mb-6">
        <button
          onClick={() => setFilters({ ...filters, mode: "DATE" })}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
            filters.mode === "DATE"
              ? "bg-white dark:bg-slate-700 shadow-sm text-emerald-600"
              : "text-gray-500"
          }`}
        >
          Rentang Tanggal
        </button>
        <button
          onClick={() => setFilters({ ...filters, mode: "MONTH" })}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
            filters.mode === "MONTH"
              ? "bg-white dark:bg-slate-700 shadow-sm text-emerald-600"
              : "text-gray-500"
          }`}
        >
          Pilih Bulan
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1 grid grid-cols-2 gap-4">
          {filters.mode === "DATE" ? (
            <>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm outline-none"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm outline-none"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">
                  Dari Bulan
                </label>
                <input
                  type="month"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm outline-none"
                  value={filters.startMonth}
                  onChange={(e) =>
                    setFilters({ ...filters, startMonth: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">
                  Sampai Bulan
                </label>
                <input
                  type="month"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm outline-none"
                  value={filters.endMonth}
                  onChange={(e) =>
                    setFilters({ ...filters, endMonth: e.target.value })
                  }
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleFilter}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
          >
            <Search className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>
    </div>
  );
}
