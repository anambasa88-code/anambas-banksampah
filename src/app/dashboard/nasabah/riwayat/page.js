"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { History, ArrowUpRight, ArrowDownRight, Calendar, Package, DollarSign, RefreshCw, ChevronLeft, ChevronRight, Wallet, Banknote } from "lucide-react";

export default function RiwayatNasabah() {
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState([]);
  const [filter, setFilter] = useState("SEMUA");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [summary, setSummary] = useState({
    totalSetor: 0,
    totalTarik: 0,
    saldoAktif: 0,
    totalBeratSampah: 0,
    beratPerKategori: {},
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

      // Fetch riwayat dan summary dashboard secara paralel
      const [riwayatRes, dashboardRes] = await Promise.all([
        fetch(`/api/users/nasabah/riwayat?type=SEMUA&page=1&limit=1000`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/users/nasabah/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!riwayatRes.ok || !dashboardRes.ok) {
        if (riwayatRes.status === 401 || dashboardRes.status === 401) {
          toast.error("Sesi berakhir, silakan login ulang");
          localStorage.clear();
          window.location.href = "/login";
          return;
        }
        throw new Error("Gagal mengambil data");
      }

      const riwayatJson = await riwayatRes.json();
      const dashboardJson = await dashboardRes.json();
      
      setAllData(riwayatJson.data || []);

      // Pakai summary dari dashboard agar konsisten
      setSummary({
        totalSetor: dashboardJson.total_transaksi_setor || 0,
        totalTarik: dashboardJson.total_transaksi_tarik || 0,
        saldoAktif: dashboardJson.saldo_aktif || 0,
        totalBeratSampah: dashboardJson.total_kg || 0,
        beratPerKategori: dashboardJson.per_kategori || {},
      });
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat riwayat transaksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter]);

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

  // Filter data untuk tabel
  const filteredData = allData.filter((d) => {
    if (filter === "SEMUA") return true;
    return d.jenis === filter;
  });

  // Pagination untuk tabel
  const paginatedData = filteredData.slice((page - 1) * 20, page * 20);
  const totalPages = Math.ceil(filteredData.length / 20);
  const total = filteredData.length;

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

        {/* Stats Grid - tidak berubah saat filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
          {/* Total Setor dengan rincian kategori */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Setor</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">{summary.totalSetor}x transaksi</p>
            <div className="space-y-1 text-[11px]">
              {(() => {
                const kategoriList = ['PLASTIK', 'LOGAM', 'KERTAS', 'LAINNYA', 'CAMPURAN'];
                const kategoriLabels = {
                  PLASTIK: 'Plastik',
                  LOGAM: 'Logam',
                  KERTAS: 'Kertas',
                  LAINNYA: 'Lainnya',
                  CAMPURAN: 'Campuran',
                };
                return kategoriList.map(kat => {
                  const berat = summary.beratPerKategori?.[kat] || 0;
                  return (
                    <div key={kat} className="flex justify-between items-center">
                      <span className="text-slate-500">{kategoriLabels[kat]}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {Number(berat).toLocaleString('id-ID')} kg
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
          {/* Total Tarik */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Tarik</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{summary.totalTarik}x transaksi</p>
          </div>
          {/* Saldo */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800">
            <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Saldo Saat Ini</p>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{formatRupiah(summary.saldoAktif)}</p>
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
                  ${filter === type
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
          ) : filteredData.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Belum ada transaksi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Jenis</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Detail</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {paginatedData.map((item, index) => (
                    <tr
                      key={`${item.jenis}-${item.id_setor || item.id}-${index}`}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800/50"
                    >
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

                      {/* FIX: Detail sekarang loop detail_items untuk SETOR */}
                      <td className="px-4 py-4">
                        {item.jenis === "SETOR" ? (
                          <div className="space-y-2">
                            {item.detail_items?.length > 0 ? (
                              item.detail_items.map((d, i) => (
                                <div key={i}>
                                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                    {d.nama_barang_snapshot || "-"}
                                  </p>
                                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {d.berat} kg × {formatRupiah(d.harga_deal)}/kg
                                    </span>
                                    {d.tipe_setoran && (
                                      <span className={`text-xs px-2 py-0.5 rounded
                                        ${d.tipe_setoran === "COMMUNITY"
                                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"}`}>
                                        {d.tipe_setoran}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500">-</p>
                            )}
                            {/* Metode bayar di bawah list item */}
                            {item.metode_bayar && (
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium
                                ${item.metode_bayar === "TABUNG"
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                  : "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"}`}>
                                {item.metode_bayar === "TABUNG" ? (
                                  <><Wallet className="w-3 h-3" />TABUNG</>
                                ) : (
                                  <><Banknote className="w-3 h-3" />JUAL LANGSUNG</>
                                )}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Penarikan saldo</p>
                            {item.catatan_tarik && (
                              <p className="text-xs text-gray-400 mt-0.5">{item.catatan_tarik}</p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* FIX: jumlah_tarik bukan jumlah */}
                      <td className="px-4 py-4 text-right">
                        <p className={`text-base font-bold
                          ${item.jenis === "SETOR"
                            ? "text-green-600 dark:text-green-400"
                            : "text-orange-600 dark:text-orange-400"}`}>
                          {item.jenis === "SETOR"
                            ? formatRupiah(item.total_rp || 0)
                            : formatRupiah(item.jumlah_tarik || 0)}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && filteredData.length > 0 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Halaman {page} dari {totalPages} ({total} transaksi)
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
                disabled={page >= totalPages}
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