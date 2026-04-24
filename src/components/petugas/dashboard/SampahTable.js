"use client";
import { LayoutGrid, Recycle, FileText, Wrench, Package, Layers, Weight, ArrowUpDown, Inbox } from "lucide-react";

const CATEGORIES = [
  { value: "SEMUA",    label: "Semua",    icon: LayoutGrid, color: "emerald" },
  { value: "PLASTIK",  label: "Plastik",  icon: Recycle,    color: "blue"    },
  { value: "LOGAM",    label: "Logam",    icon: Wrench,     color: "slate"   },
  { value: "KERTAS",   label: "Kertas",   icon: FileText,   color: "amber"   },
  { value: "LAINNYA",  label: "Lainnya",  icon: Layers,     color: "orange"  },
  { value: "CAMPURAN", label: "Campuran", icon: Package,    color: "purple"  },
];

const CATEGORY_STYLE = {
  PLASTIK:  { badge: "bg-blue-50 text-blue-600 ring-blue-100",   icon: Recycle  },
  LOGAM:    { badge: "bg-slate-100 text-slate-600 ring-slate-200", icon: Wrench  },
  KERTAS:   { badge: "bg-amber-50 text-amber-600 ring-amber-100", icon: FileText },
  LAINNYA:  { badge: "bg-orange-50 text-orange-500 ring-orange-100", icon: Layers },
  CAMPURAN: { badge: "bg-purple-50 text-purple-600 ring-purple-100", icon: Package },
};

export default function SampahTable({ data, activeTab, setActiveTab }) {
  const safeData = Array.isArray(data) ? data : [];

  const filtered = safeData
    .filter((item) => activeTab === "SEMUA" || (item.kategori_utama || "LAINNYA") === activeTab)
    .sort((a, b) => b.total_berat - a.total_berat);

  const totalBerat     = filtered.reduce((sum, i) => sum + Number(i.total_berat || 0), 0);
  const totalTransaksi = filtered.reduce((sum, i) => sum + Number(i.total_transaksi || 0), 0);
  const maxBerat       = filtered[0]?.total_berat || 1;

  return (
    <div className="space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-gray-800 dark:text-white">Sampah Terkumpul Per Jenis</h2>
          <p className="text-[11px] text-gray-500 mt-0.5">{safeData.length} jenis sampah tercatat</p>
        </div>
        {filtered.length > 0 && (
          <div className="flex items-center gap-3 text-right">
            <div>
              <p className="text-[10px] text-gray-400">Total Berat</p>
              <p className="text-[13px] font-bold text-emerald-600">{totalBerat.toFixed(2)} kg</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400">Total Transaksi</p>
              <p className="text-[13px] font-bold text-slate-700">{totalTransaksi}</p>
            </div>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        {CATEGORIES.map(({ value, label, icon: Icon }) => {
          const isActive = activeTab === value;
          const count    = value === "SEMUA"
            ? safeData.length
            : safeData.filter((i) => (i.kategori_utama || "LAINNYA") === value).length;
          return (
            <button key={value} onClick={() => setActiveTab(value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 font-semibold shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}>
              <Icon size={11} />
              {label}
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                <th className="px-5 py-3 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-10">No</th>
                <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1"><ArrowUpDown size={10} /> Nama Sampah</span>
                </th>
                <th className="px-5 py-3 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Kategori</th>
                <th className="px-5 py-3 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center justify-end gap-1"><Weight size={10} /> Berat (kg)</span>
                </th>
                <th className="px-5 py-3 text-right text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <Inbox className="w-5 h-5 text-slate-300" />
                      </div>
                      <p className="text-[12px] text-slate-400">Tidak ada data untuk kategori ini</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const style   = CATEGORY_STYLE[item.kategori_utama] || CATEGORY_STYLE["LAINNYA"];
                  const BadgeIcon = style.icon;
                  const persen  = ((Number(item.total_berat) / totalBerat) * 100).toFixed(1);
                  const barWidth = ((Number(item.total_berat) / maxBerat) * 100).toFixed(1);
                  return (
                    <tr key={item.barang_id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-5 py-3.5 text-center text-[11px] text-slate-400">{idx + 1}</td>
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] font-semibold text-slate-800 dark:text-white">{item.nama_sampah}</p>
                        {/* Progress bar */}
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-slate-400">{persen}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold ring-1 ${style.badge}`}>
                          <BadgeIcon size={9} />
                          {item.kategori_utama || "LAINNYA"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-[13px] font-bold text-slate-800 dark:text-white">
                          {(Number(item.total_berat) || 0).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">kg</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-[12px] font-medium text-slate-500">{item.total_transaksi}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
            <p className="text-[10px] text-slate-400">{filtered.length} jenis ditampilkan</p>
            <p className="text-[10px] text-slate-400">Diurutkan berdasarkan berat terbanyak</p>
          </div>
        )}
      </div>
    </div>
  );
}
