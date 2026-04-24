"use client";
import {
  TrendingUp, TrendingDown, Wallet, ChevronLeft,
  ChevronRight, Inbox, Loader2, Receipt,
} from "lucide-react";

const JenisBadge = ({ jenis }) =>
  jenis === "SETOR" ? (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400">
      <TrendingUp className="w-3 h-3" /> Setor
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-orange-50 text-orange-500 ring-1 ring-orange-100 dark:bg-orange-900/20 dark:text-orange-400">
      <TrendingDown className="w-3 h-3" /> Tarik
    </span>
  );

const MetodeBadge = ({ metode }) => {
  if (!metode) return <span className="text-[10px] text-slate-300">—</span>;
  return metode === "TABUNG" ? (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-900/20 dark:text-blue-400">
      <Wallet className="w-3 h-3" /> Tabung
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-amber-50 text-amber-600 ring-1 ring-amber-100 dark:bg-amber-900/20 dark:text-amber-400">
      <TrendingDown className="w-3 h-3" /> Jual Langsung
    </span>
  );
};

export default function TransaksiTable({
  data, loading, page, pagination, onPageChange, onOpenModal, formatRupiah, formatDate,
}) {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-[12px]">Memuat transaksi...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Inbox className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-[12px] font-medium">Tidak ada transaksi ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
              {["No", "ID", "Jenis", "Metode", "Nasabah", "Detail", "Catatan", "Nominal", "Waktu", "Petugas"].map((h, i) => (
                <th key={h} className={`px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap ${i >= 6 ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {data.map((t, idx) => (
              <tr key={t.group_id || t.id_setor || t.id_tarik}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">

                {/* No */}
                <td className="px-4 py-3.5 text-[11px] text-slate-400">
                  {(page - 1) * pagination.limit + idx + 1}
                </td>

                {/* ID */}
                <td className="px-4 py-3.5">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                    #{t.group_id || t.id_setor || t.id_tarik}
                  </span>
                </td>

                {/* Jenis */}
                <td className="px-4 py-3.5"><JenisBadge jenis={t.jenis} /></td>

                {/* Metode */}
                <td className="px-4 py-3.5">
                  <MetodeBadge metode={t.jenis === "SETOR" ? t.metode_bayar : null} />
                </td>

                
                <td className="px-4 py-3.5">
                  <p className="text-[12px] font-semibold text-slate-700 dark:text-white">{t.nasabah?.nama_lengkap}</p>
                  <p className="text-[10px] text-slate-400">{t.nasabah?.nickname}</p>
                </td>

                {/* Detail */}
                <td className="px-4 py-3.5">
                  {t.jenis === "SETOR" ? (
                    <div>
                      <p className="text-[12px] font-medium text-slate-700 dark:text-slate-200 truncate max-w-[160px]">
                        {t.subItems[0]?.nama_barang_snapshot}
                        {t.subItems.length > 1 && (
                          <span className="text-slate-400 ml-1">+{t.subItems.length - 1}</span>
                        )}
                      </p>
                      <button onClick={() => onOpenModal(t)}
                        className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 mt-0.5 transition-colors">
                        <Receipt className="w-3 h-3" />
                        {t.subItems.length} item rincian
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Wallet className="w-3 h-3" />
                      <span className="text-[11px]">Penarikan Tunai</span>
                    </div>
                  )}
                </td>
                {/* Catatan */}
                <td className="px-4 py-3.5">
                  {(() => {
                    const catatan = t.jenis === "TARIK" ? t.catatan_tarik : t.catatan_petugas;
                    return catatan ? (
                      <span className="inline-flex items-center gap-1.5 max-w-[140px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate" title={catatan}>
                          {catatan}
                        </span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-300 dark:text-slate-600">—</span>
                    );
                  })()}
                </td>

                {/* Nominal */}
                <td className="px-4 py-3.5 text-right">
                  <p className={`text-[13px] font-bold ${
                    t.jenis === "TARIK" ? "text-red-500" :
                    t.metode_bayar === "TABUNG" ? "text-emerald-600" : "text-slate-600"
                  }`}>
                    {t.jenis === "SETOR" ? "+" : "−"}{formatRupiah(t.totalGroupRp)}
                  </p>
                  {t.subItems.length > 1 && (
                    <p className="text-[9px] text-slate-400 mt-0.5">{t.subItems.length} jenis sampah</p>
                  )}
                </td>

                {/* Waktu */}
                <td className="px-4 py-3.5 text-right">
                  <p className="text-[11px] text-slate-500 whitespace-nowrap">{formatDate(t.waktu)}</p>
                </td>

                {/* Petugas */}
                <td className="px-4 py-3.5 text-right">
                  <p className="text-[11px] font-medium text-slate-500">{t.petugas?.nama_lengkap}</p>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
        <p className="text-[11px] text-slate-400">
          Halaman <span className="font-semibold text-slate-600 dark:text-slate-300">{page}</span> dari{" "}
          <span className="font-semibold text-slate-600 dark:text-slate-300">{totalPages}</span>
          <span className="ml-1.5 text-slate-300">·</span>
          <span className="ml-1.5">{pagination.total} total</span>
        </p>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onPageChange((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all">
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
          <button onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all">
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  );
}