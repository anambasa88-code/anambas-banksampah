"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import {
  History,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Package,
  DollarSign,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function RiwayatNasabah() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("SEMUA");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bs_token");
      if (!token) {
        toast.error("Token tidak ditemukan, silakan login ulang");
        window.location.href = "/login";
        return;
      }

      const res = await fetch(
        `/api/users/nasabah/riwayat?type=${filter}&page=${page}&limit=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Sesi berakhir, silakan login ulang");
          localStorage.clear();
          window.location.href = "/login";
          return;
        }
        throw new Error("Gagal mengambil riwayat");
      }

      const json = await res.json();
      setData(json.data || []);
      setPagination(json.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat riwayat transaksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // Reset page saat ganti filter
  }, [filter]);

  useEffect(() => {
    fetchRiwayat();
  }, [filter, page]);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const totalSetor = data.filter((d) => d.jenis === "SETOR").length;
  const totalTarik = data.filter((d) => d.jenis === "TARIK").length;
  const totalNilaiSetor = data
    .filter((d) => d.jenis === "SETOR")
    .reduce((sum, d) => sum + (Number(d.total_rp) || 0), 0);
  const totalNilaiTarik = data
    .filter((d) => d.jenis === "TARIK")
    .reduce((sum, d) => sum + (Number(d.jumlah) || 0), 0);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <History className="w-8 h-8 text-green-600 dark:text-green-400" />
            Riwayat Transaksi
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Semua transaksi setoran dan penarikan Anda
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Setor</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{totalSetor}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tarik</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{totalTarik}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nilai Setor</p>
            <p className="text-sm font-bold text-green-600 dark:text-green-400">
              {formatRupiah(totalNilaiSetor)}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nilai Tarik</p>
            <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
              {formatRupiah(totalNilaiTarik)}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            {["SEMUA", "SETOR", "TARIK"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    filter === type
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                  }
                `}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={fetchRiwayat}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-green-600 dark:text-green-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Memuat riwayat...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Belum ada transaksi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Jenis
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Detail
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Jumlah
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {data.map((item, index) => (
                    <tr key={`${item.jenis}-${item.id}-${index}`} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {formatDate(item.waktu)}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {item.jenis === "SETOR" ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 w-fit">
                            <ArrowUpRight className="w-4 h-4" />
                            <span className="text-sm font-semibold">SETOR</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 w-fit">
                            <ArrowDownRight className="w-4 h-4" />
                            <span className="text-sm font-semibold">TARIK</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {item.jenis === "SETOR" ? (
                          <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-white">
                              {item.barang?.nama || "-"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {item.berat || 0} kg × {formatRupiah(item.harga_per_kg || 0)}/kg
                              </span>
                              {item.barang?.tipe && (
                                <span className={`
                                  text-xs px-2 py-0.5 rounded
                                  ${item.barang.tipe === "COMMUNITY" 
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
                                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"}
                                `}>
                                  {item.barang.tipe}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Penarikan saldo
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <p className={`
                          text-base font-bold
                          ${item.jenis === "SETOR" 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-orange-600 dark:text-orange-400"}
                        `}>
                          {item.jenis === "SETOR" 
                            ? formatRupiah(item.total_rp || 0)
                            : formatRupiah(item.jumlah || 0)}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && data.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} transaksi)
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}