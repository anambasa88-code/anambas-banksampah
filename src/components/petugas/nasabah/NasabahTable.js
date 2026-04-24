"use client";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Eye,
  RefreshCw,
  LockOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Inbox,
  ShieldAlert,
  Edit,
} from "lucide-react";

const formatRp = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n || 0);

// ── Action Button di kolom Transaksi ─────────────────────────────────────
function TransaksiButton({ onClick, icon: Icon, label, color }) {
  const styles = {
    green:
      "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 hover:bg-amber-100 ring-amber-100",
    blue: "bg-blue-50 text-blue-700 hover:bg-blue-100 ring-blue-100",
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold ring-1 transition-all active:scale-95 ${styles[color]}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

// ── Gender Badge ──────────────────────────────────────────────────────────
function GenderBadge({ value }) {
  const isLaki = value === "LAKI_LAKI";
  return (
    <span
      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${
        isLaki ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600"
      }`}
    >
      {isLaki ? "Laki-laki" : "Perempuan"}
    </span>
  );
}

export default function NasabahTable({
  data,
  loading,
  page,
  pagination,
  actionLoading,
  onPageChange,
  onSetor,
  onTarik,
  onDetail,
  onEdit,
  onResetPin,
  onUnblock,
}) {
  const totalPages = pagination.totalPages || 1;

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-[12px]">Memuat data nasabah...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="py-20 flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
            <Inbox className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-[12px] font-medium text-slate-400">
            Tidak ada data nasabah
          </p>
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
              {[
                "No",
                "Nasabah",
                "NIK",
                "Gender",
                "Desa",
                "Alamat",
                "Saldo",
                "Transaksi",
                "Aksi",
              ].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${
                    i === 6 ? "text-right" : i >= 7 ? "text-center" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {data.map((n, idx) => (
              <tr
                key={n.id_user}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
              >
                {/* No */}
                <td className="px-4 py-3.5 text-[11px] text-slate-400 w-10">
                  {(page - 1) * pagination.limit + idx + 1}
                </td>

                {/* Nasabah */}
                <td className="px-4 py-3.5">
                  <p className="text-[13px] font-semibold text-slate-800 dark:text-white">
                    {n.nama_lengkap}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {n.nickname}
                  </p>
                  {n.is_blocked && (
                    <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-red-50 text-red-600 rounded-md text-[9px] font-bold">
                      <ShieldAlert className="w-2.5 h-2.5" /> Diblokir
                    </span>
                  )}
                </td>

                {/* NIK */}
                <td className="px-4 py-3.5">
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                    {n.nik || "—"}
                  </span>
                </td>

                {/* Gender */}
                <td className="px-4 py-3.5">
                  <GenderBadge value={n.jenis_kelamin} />
                </td>

                {/* Desa */}
                <td className="px-4 py-3.5 text-[12px] text-slate-600 dark:text-slate-300">
                  {n.desa || "—"}
                </td>

                {/* Alamat */}
                <td className="px-4 py-3.5">
                  <div className="max-w-[200px]">
                    <p className="text-[12px] text-slate-600 dark:text-slate-300 truncate" title={n.alamat || "Tidak ada alamat"}>
                      {n.alamat || "—"}
                    </p>
                  </div>
                </td>

                {/* Saldo */}
                <td className="px-4 py-3.5 text-right">
                  <span className="text-[13px] font-bold text-emerald-600">
                    {formatRp(n.total_saldo)}
                  </span>
                </td>

                {/* ✅ Transaksi — jelas ada label */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <TransaksiButton
                      onClick={() => onSetor(n.id_user)}
                      icon={ArrowDownCircle}
                      label="Setor"
                      color="green"
                    />
                    <TransaksiButton
                      onClick={() => onTarik(n.id_user)}
                      icon={ArrowUpCircle}
                      label="Tarik"
                      color="amber"
                    />
                    <TransaksiButton
                      onClick={() => onDetail(n.id_user)}
                      icon={Eye}
                      label="Detail"
                      color="blue"
                    />
                  </div>
                </td>

                {/* Aksi */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onEdit(n)}
                      title="Edit Data"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 ring-1 ring-blue-100 transition-all"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => onResetPin(n.id_user, n.nama_lengkap)}
                      disabled={actionLoading === n.id_user}
                      title="Reset PIN"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 ring-1 ring-slate-200 transition-all disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${actionLoading === n.id_user ? "animate-spin" : ""}`}
                      />
                      PIN
                    </button>
                    {n.is_blocked && (
                      <button
                        onClick={() => onUnblock(n.id_user, n.nama_lengkap)}
                        disabled={actionLoading === n.id_user}
                        title="Buka Blokir"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-green-50 text-green-700 hover:bg-green-100 ring-1 ring-green-100 transition-all disabled:opacity-50"
                      >
                        <LockOpen className="w-3.5 h-3.5" />
                        Buka
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
        <p className="text-[11px] text-slate-500">
          {(page - 1) * pagination.limit + 1}–
          {Math.min(page * pagination.limit, pagination.total)} dari{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {pagination.total}
          </span>{" "}
          nasabah
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 px-2">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all"
          >
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
