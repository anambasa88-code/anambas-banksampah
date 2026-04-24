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

export default function GlobalSampahTable({ 
  filteredGlobalSampah,
  activeTab,
  setActiveTab 
}) {
  const safeData = Array.isArray(filteredGlobalSampah) ? filteredGlobalSampah : [];

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
          <h2 className="text-[15px] font-semibold text-gray-800 dark:text-white">Sampah Terkumpul Per Jenis (Global)</h2>
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

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveTab(cat.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === cat.value
                ? `bg-${cat.color}-50 text-${cat.color}-700 ring-1 ring-${cat.color}-200`
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <cat.icon size={12} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                <th className="px-5 py-3 text-left">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">No</span>
                </th>
                <th className="px-5 py-3 text-left">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Nama Sampah</span>
                </th>
                <th className="px-5 py-3 text-center">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Kategori</span>
                </th>
                <th className="px-5 py-3 text-right">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Berat</span>
                </th>
                <th className="px-5 py-3 text-right">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Transaksi</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center">
                    <Inbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Data tidak ditemukan</p>
                    <p className="text-xs text-gray-400 mt-1">Coba ubah filter atau periode waktu</p>
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const style = CATEGORY_STYLE[item.kategori_utama] || CATEGORY_STYLE.LAINNYA;
                  const BadgeIcon = style.icon;
                  const percentage = (item.total_berat / maxBerat) * 100;

                  return (
                    <tr
                      key={item.barang_id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-[12px] font-medium text-gray-500">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="text-[13px] font-medium text-gray-800 dark:text-white">
                            {item.nama_sampah}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold ring-1 ${style.badge}`}>
                          <BadgeIcon size={9} />
                          {item.kategori_utama || "LAINNYA"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-12 bg-gray-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-[13px] font-bold text-slate-800 dark:text-white">
                            {(Number(item.total_berat) || 0).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1">kg</span>
                        </div>
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
          <div className="px-5 py-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Menampilkan {filtered.length} dari {safeData.length} jenis sampah
              </span>
              <div className="flex items-center gap-4">
                <span className="text-gray-500">
                  Total: <span className="font-semibold text-gray-700 dark:text-gray-300">{totalBerat.toFixed(2)} kg</span>
                </span>
                <span className="text-gray-500">
                  Transaksi: <span className="font-semibold text-gray-700 dark:text-gray-300">{totalTransaksi}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
