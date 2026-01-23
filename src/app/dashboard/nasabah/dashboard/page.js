"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Wallet, 
  Package, 
  TrendingUp, 
  History,
  Waves,
  Users as UsersRound,
  Trash2,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function NasabahDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    total_kg: 0,
    total_rp: 0,
    per_tipe: {},
    per_kategori: {},
    total_transaksi_setor: 0,
    total_transaksi_tarik: 0,
  });

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("bs_token");
      if (!token) {
        toast.error("Token tidak ditemukan, silakan login ulang");
        window.location.href = "/login";
        return;
      }

      const res = await fetch("/api/users/nasabah/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Sesi berakhir, silakan login ulang");
          localStorage.clear();
          window.location.href = "/login";
          return;
        }
        throw new Error("Gagal mengambil dashboard");
      }

      const json = await res.json();
      setData(json || {});
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Format currency
  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Skeleton loading
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded-lg bg-gray-200 dark:bg-slate-800" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-40 rounded-2xl bg-gray-100 dark:bg-slate-800" />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { total_kg, total_rp, per_tipe, per_kategori, total_transaksi_setor, total_transaksi_tarik } = data;

  // Get top 3 categories
  const topKategori = Object.entries(per_kategori || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            Dashboard Nasabah
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Pantau saldo, setoran sampah, dan riwayat transaksi Anda
          </p>
        </div>

        {/* Main Stats - 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          
          {/* Saldo Total */}
          <div className="relative overflow-hidden p-6 rounded-2xl border border-green-200 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 opacity-70" />
              </div>
              <p className="text-sm opacity-90 mb-1">Saldo Saat Ini</p>
              <p className="text-2xl md:text-3xl font-bold">{formatRupiah(total_rp)}</p>
            </div>
          </div>

          {/* Total Setoran */}
          <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Transaksi</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white">{total_transaksi_setor}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Setoran</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {total_kg.toFixed(2)} kg
            </p>
          </div>

          {/* Total Penarikan */}
          <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
                <History className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <ArrowDownRight className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Penarikan</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{total_transaksi_tarik}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Transaksi Tarik Dana</p>
          </div>
        </div>

        {/* Tipe Setoran - 2 Cards */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Setoran Berdasarkan Tipe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            
            {/* Community */}
            <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                      <UsersRound className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Community</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Sampah dari komunitas</p>
                    </div>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                    {(per_tipe?.COMMUNITY || 0).toFixed(2)} <span className="text-base md:text-lg text-gray-500">kg</span>
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {((per_tipe?.COMMUNITY || 0) / (total_kg || 1) * 100).toFixed(1)}% dari total
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ocean Debris */}
            <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                      <Waves className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Ocean Debris</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Sampah dari laut</p>
                    </div>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                    {(per_tipe?.OCEAN_DEBRIS || 0).toFixed(2)} <span className="text-base md:text-lg text-gray-500">kg</span>
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {((per_tipe?.OCEAN_DEBRIS || 0) / (total_kg || 1) * 100).toFixed(1)}% dari total
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Kategori Sampah */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Top 3 Kategori Sampah Terbanyak
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {topKategori.length === 0 ? (
              <div className="col-span-3 p-8 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-slate-700 rounded-2xl">
                Belum ada data kategori sampah
              </div>
            ) : (
              topKategori.map(([kategori, berat], index) => (
                <div
                  key={kategori}
                  className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/30' : ''}
                        ${index === 1 ? 'bg-gray-100 dark:bg-gray-800' : ''}
                        ${index === 2 ? 'bg-orange-50 dark:bg-orange-900/30' : ''}
                      `}>
                        <Trash2 className={`
                          w-5 h-5
                          ${index === 0 ? 'text-yellow-600 dark:text-yellow-400' : ''}
                          ${index === 1 ? 'text-gray-600 dark:text-gray-400' : ''}
                          ${index === 2 ? 'text-orange-600 dark:text-orange-400' : ''}
                        `} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">#{index + 1}</p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{kategori}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                    {berat.toFixed(2)} <span className="text-sm text-gray-500">kg</span>
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Kontribusi</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {((berat / total_kg) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-gradient-to-r from-green-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 dark:border-slate-700">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                Lihat Riwayat Lengkap
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Cek semua transaksi setoran dan penarikan Anda
              </p>
            </div>
            <a
              href="/dashboard/nasabah/riwayat"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
            >
              <History className="w-5 h-5" />
              Riwayat
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}