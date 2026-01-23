"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  Package,
} from "lucide-react";

export default function TransaksiPage() {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
  });

  // Filter states
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
    setFilters({
      tipe: "ALL",
      startDate: "",
      endDate: "",
      nasabahId: "",
    });
    setPage(1);
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
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

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
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
            {/* Tombol Filter */}
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

            {/* Tombol Refresh */}
            <button
              onClick={fetchTransaksi}
              disabled={loading}
              className="p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 disabled:opacity-50 transition-colors border border-green-200 dark:border-green-800"
              title="Refresh Data"
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
              {/* Tipe Transaksi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipe Transaksi
                </label>
                <select
                  value={filters.tipe}
                  onChange={(e) => handleFilterChange("tipe", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                >
                  <option value="ALL">Semua</option>
                  <option value="SETOR">Setoran</option>
                  <option value="TARIK">Penarikan</option>
                </select>
              </div>

              {/* Tanggal Mulai */}
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Tanggal Akhir */}
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>

              {/* Reset Button */}
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-slate-700">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Memuat data...
            </div>
          ) : transaksi.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Tidak ada transaksi
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        ID Transaksi
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        Tipe
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        Nasabah
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        Detail
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        Nominal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        Waktu
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        Petugas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {transaksi.map((t, idx) => (
                      <tr
                        key={t.id_setor || t.id_tarik}
                        className="hover:bg-gray-50 dark:hover:bg-slate-800"
                      >
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {(page - 1) * pagination.limit + idx + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-700 dark:text-gray-300">
                          {t.id_setor || t.id_tarik}
                        </td>
                        <td className="px-4 py-3">
                          {t.jenis === "SETOR" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <TrendingUp className="w-3 h-3" />
                              Setor
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                              <TrendingDown className="w-3 h-3" />
                              Tarik
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          <div>
                            <p className="font-medium">
                              {t.nasabah.nama_lengkap}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              @{t.nasabah.nickname}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {t.jenis === "SETOR" ? (
                            <div>
                              <p>{t.nama_barang_snapshot}</p>
                              <p className="text-xs">
                                {parseFloat(t.berat).toFixed(2)} kg × {formatRupiah(t.harga_deal)}
                              </p>
                              <p className="text-xs">
                                {t.metode_bayar === "TABUNG" ? (
                                  <span className="text-green-600 dark:text-green-400">
                                    Tabung
                                  </span>
                                ) : (
                                  <span className="text-orange-600 dark:text-orange-400">
                                    Jual Langsung
                                  </span>
                                )}
                              </p>
                            </div>
                          ) : (
                            <p>Penarikan Saldo</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          {t.jenis === "SETOR" ? (
                            <span className="text-green-600 dark:text-green-400">
                              +{formatRupiah(t.total_rp)}
                            </span>
                          ) : (
                            <span className="text-orange-600 dark:text-orange-400">
                              -{formatRupiah(t.jumlah_tarik)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(t.waktu)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {t.petugas.nama_lengkap}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Menampilkan {(page - 1) * pagination.limit + 1} -{" "}
                  {Math.min(page * pagination.limit, pagination.total)} dari{" "}
                  {pagination.total} data
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Halaman {page} dari {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}