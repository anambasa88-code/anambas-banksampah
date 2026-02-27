"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  TrendingUp,
  TrendingDown,
  Package,
  FileSpreadsheet,
  FileText,
  X,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from "lucide-react";
import ExportRiwayatTransaksi from "@/components/ExportRiwayatTransaksi";

// --- KOMPONEN MODAL DETAIL TRANSAKSI ---
const DetailTransaksiModal = ({
  isOpen,
  onClose,
  transaction,
  formatRupiah,
}) => {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop dengan blur */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Container Modal */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <Receipt className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tighter">
              Rincian Item Setoran
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content Modal (List Item) */}
        <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
          {transaction.subItems.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {item.tipe_setoran === "COMMUNITY" ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                    {item.nama_barang_snapshot || "Sampah"}
                  </p>
                  <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase">
                    {Number(item.berat).toLocaleString("id-ID")} kg ×{" "}
                    {formatRupiah(item.harga_deal)}
                  </p>
                </div>
              </div>

              {/* Badge Tipe Setoran */}
              <span
                className={`text-[9px] px-2.5 py-1 rounded-lg font-black border uppercase tracking-wider ${
                  item.tipe_setoran === "COMMUNITY"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                    : "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
                }`}
              >
                {item.tipe_setoran === "COMMUNITY" ? "COMMUNITY" : "OCEAN"}
              </span>
            </div>
          ))}
        </div>

        {/* Footer Modal (Total & Tutup) */}
        <div className="p-6 bg-emerald-600 dark:bg-emerald-700 text-white flex justify-between items-center shadow-inner">
          <div>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest text-emerald-100">
              Total Setoran Ini
            </p>
            <p className="text-2xl font-black italic tracking-tight">
              {formatRupiah(transaction.totalGroupRp)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-white text-emerald-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-emerald-50 transition-all active:scale-95"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN UTAMA HALAMAN ---
export default function TransaksiPage() {
  const [transaksi, setTransaksi] = useState([]);
  const exportRef = useRef();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, limit: 20 });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    tipe: "ALL",
    startDate: "",
    endDate: "",
    nasabahId: "",
  });
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetchTransaksi();
  }, [page, filters]);

  const fetchTransaksi = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bs_token");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        tipe: filters.tipe,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.nasabahId && { nasabahId: filters.nasabahId }),
      });

      const res = await fetch(`/api/transaksi/daftar?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal memuat data");
      const data = await res.json();
      setTransaksi(data.data || []);
      setPagination({ total: data.total || 0, limit: data.limit || 20 });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ tipe: "ALL", startDate: "", endDate: "", nasabahId: "" });
    setPage(1);
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  // LOGIKA GROUPING TRANSAKSI
  const groupedTransactions = transaksi.reduce((acc, item) => {
    const key =
      item.group_id || (item.jenis === "SETOR" ? item.id_setor : item.id_tarik);
    if (!acc[key]) {
      acc[key] = { ...item, subItems: [], totalGroupRp: 0 };
    }
    acc[key].subItems.push(item);
    acc[key].totalGroupRp += Number(item.total_rp || item.jumlah_tarik || 0);
    return acc;
  }, {});

  const finalDisplayData = Object.values(groupedTransactions);

  return (
    <DashboardLayout>
      <ExportRiwayatTransaksi
        ref={exportRef}
        data={transaksi}
        filters={filters}
      />

      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
              <Package className="w-8 h-8 text-green-600 dark:text-green-400" />
              Riwayat Transaksi
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Semua transaksi di unit Anda
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                showFilter
                  ? "bg-green-600 text-white"
                  : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filter</span>
            </button>
            <button
              onClick={() => exportRef.current.generateExcel()}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg text-sm font-bold hover:bg-emerald-200 transition-all border border-emerald-200 dark:border-emerald-800"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden md:inline">Excel</span>
            </button>
            <button
              onClick={() => fetchTransaksi()}
              disabled={loading}
              className="p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 disabled:opacity-50 transition-colors border border-green-200 dark:border-green-800"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilter && (
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-slate-700 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipe Transaksi
                </label>
                <select
                  value={filters.tipe}
                  onChange={(e) => handleFilterChange("tipe", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <option value="ALL">Semua</option>
                  <option value="SETOR">Setoran</option>
                  <option value="TARIK">Penarikan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-slate-700">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Memuat data transaksi...
            </div>
          ) : finalDisplayData.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Tidak ada riwayat transaksi.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-tighter">
                        No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-tighter">
                        ID Group/Setor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-tighter">
                        Tipe
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-tighter">
                        Nasabah
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-tighter">
                        Detail Item
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-tighter">
                        Nominal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-tighter">
                        Waktu
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-tighter">
                        Petugas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700 font-medium">
                    {finalDisplayData.map((t, idx) => (
                      <tr
                        key={t.group_id || t.id_setor || t.id_tarik}
                        className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {(page - 1) * pagination.limit + idx + 1}
                        </td>
                        <td className="px-4 py-4 text-xs font-mono text-slate-500">
                          {t.group_id || t.id_setor || t.id_tarik}
                        </td>
                        <td className="px-4 py-4">
                          {t.jenis === "SETOR" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                              <TrendingUp className="w-3 h-3" /> SETOR
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-orange-50 text-orange-600 border border-orange-100">
                              <TrendingDown className="w-3 h-3" /> TARIK
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-slate-700 dark:text-white">
                            {t.nasabah.nama_lengkap}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-tight">
                            {t.nasabah.nickname}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          {t.jenis === "SETOR" ? (
                            <div className="flex flex-col items-start gap-1">
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px] uppercase">
                                {t.subItems[0].nama_barang_snapshot}{" "}
                                {t.subItems.length > 1 &&
                                  `+${t.subItems.length - 1} item`}
                              </p>
                              <button
                                onClick={() => {
                                  setSelectedGroup(t);
                                  setIsModalOpen(true);
                                }}
                                className="text-[10px] font-black text-emerald-600 underline uppercase tracking-tighter hover:text-emerald-700"
                              >
                                Lihat {t.subItems.length} Rincian Item
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Wallet className="w-3 h-3" />
                              <span className="text-xs uppercase font-bold tracking-tighter">
                                Penarikan Tunai
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <p
                            className={`text-base font-black italic ${t.jenis === "SETOR" ? "text-emerald-600" : "text-orange-600"}`}
                          >
                            {t.jenis === "SETOR" ? "+" : "-"}
                            {formatRupiah(t.totalGroupRp)}
                          </p>
                          {t.subItems.length > 1 && (
                            <p className="text-[9px] text-slate-400 font-bold uppercase">
                              {t.subItems.length} JENIS SAMPAH
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-500 leading-tight">
                          {formatDate(t.waktu)}
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-500 font-bold uppercase">
                          {t.petugas.nama_lengkap}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Section */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Page {page} of {totalPages} ({pagination.total} Data)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-gray-100 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-gray-100 disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Detail */}
      <DetailTransaksiModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedGroup}
        formatRupiah={formatRupiah}
      />
    </DashboardLayout>
  );
}
