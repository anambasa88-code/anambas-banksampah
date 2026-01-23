"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Users,
  Package,
  TrendingUp,
  DollarSign,
  Wallet,
  UsersRound,
  Waves,
  Trash2,
  RefreshCw,
  Building2,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [expandedUnits, setExpandedUnits] = useState({});
  const [data, setData] = useState({
    global: {
      total_kg: 0,
      total_rp: 0,
      per_tipe: {},
      per_kategori: {},
      total_nasabah: 0,
      gender_breakdown: {},
      total_transaksi_setor: 0,
      total_transaksi_tarik: 0,
      transaksi_metode_bayar: {}
    },
    per_unit: []
  });

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bs_token");
      if (!token) {
        toast.error("Token tidak ditemukan, silakan login ulang");
        window.location.href = "/auth/login";
        return;
      }

      const res = await fetch("/api/users/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          toast.error("Sesi berakhir, silakan login ulang");
          localStorage.clear();
          window.location.href = "/auth/login";
          return;
        }
        throw new Error("Gagal mengambil dashboard");
      }

      const json = await res.json();
      setData(json || { global: {}, per_unit: [] });
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

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded-lg bg-gray-200 dark:bg-slate-800" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 rounded-2xl bg-gray-100 dark:bg-slate-800" />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { global, per_unit } = data;
  const topKategori = Object.entries(global.per_kategori || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              Dashboard Admin
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Statistik global seluruh unit
            </p>
          </div>
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>
        </div>

        {/* Global Stats - 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          
          <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Nasabah</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{global.total_nasabah}</p>
          </div>

          <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{global.total_transaksi_setor} transaksi</p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Setoran</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{global.total_kg.toFixed(2)} kg</p>
          </div>

          <div className="relative overflow-hidden p-6 rounded-2xl border border-green-200 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 opacity-70" />
              </div>
              <p className="text-sm opacity-90 mb-1">Total Nilai</p>
              <p className="text-2xl font-bold">{formatRupiah(global.total_rp)}</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Penarikan</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{global.total_transaksi_tarik}</p>
          </div>
        </div>

        {/* Tipe Setoran Global */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Setoran Global Berdasarkan Tipe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            
            <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700 transition-all">
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
                {(global.per_tipe?.COMMUNITY || 0).toFixed(2)} <span className="text-base md:text-lg text-gray-500">kg</span>
              </p>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {((global.per_tipe?.COMMUNITY || 0) / (global.total_kg || 1) * 100).toFixed(1)}% dari total
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
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
                {(global.per_tipe?.OCEAN_DEBRIS || 0).toFixed(2)} <span className="text-base md:text-lg text-gray-500">kg</span>
              </p>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {((global.per_tipe?.OCEAN_DEBRIS || 0) / (global.total_kg || 1) * 100).toFixed(1)}% dari total
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Kategori Global */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Top 3 Kategori Sampah Global
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
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/30' : 
                      index === 1 ? 'bg-gray-100 dark:bg-gray-800' : 
                      'bg-orange-50 dark:bg-orange-900/30'
                    }`}>
                      <Trash2 className={`w-5 h-5 ${
                        index === 0 ? 'text-yellow-600 dark:text-yellow-400' : 
                        index === 1 ? 'text-gray-600 dark:text-gray-400' : 
                        'text-orange-600 dark:text-orange-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">#{index + 1}</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">{kategori}</p>
                    </div>
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                    {berat.toFixed(2)} <span className="text-sm text-gray-500">kg</span>
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Kontribusi</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {((berat / global.total_kg) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Per Unit Breakdown */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            Breakdown Per Unit ({per_unit.length} Unit)
          </h2>
          <div className="space-y-4">
            {per_unit.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-slate-700 rounded-2xl">
                Belum ada unit terdaftar
              </div>
            ) : (
              per_unit.map((unit) => (
                <div key={unit.unit_id} className="border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
                  
                  {/* Unit Header - Collapsible */}
                  <button
                    onClick={() => toggleUnit(unit.unit_id)}
                    className="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800 dark:text-white">{unit.nama_unit}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {unit.total_nasabah} nasabah • {unit.total_kg.toFixed(2)} kg • {formatRupiah(unit.total_rp)}
                        </p>
                      </div>
                    </div>
                    {expandedUnits[unit.unit_id] ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>

                  {/* Unit Details - Expandable */}
                  {expandedUnits[unit.unit_id] && (
                    <div className="p-5 pt-0 border-t border-gray-100 dark:border-slate-800 space-y-4">
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nasabah</p>
                          <p className="text-xl font-bold text-gray-800 dark:text-white">{unit.total_nasabah}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Setoran</p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">{unit.total_kg.toFixed(2)} kg</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Transaksi</p>
                          <p className="text-xl font-bold text-gray-800 dark:text-white">{unit.total_transaksi_setor}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Penarikan</p>
                          <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{unit.total_transaksi_tarik}</p>
                        </div>
                      </div>

                      {/* Tipe & Kategori */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tipe Setoran</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Community</span>
                              <span className="font-semibold text-gray-800 dark:text-white">{(unit.per_tipe?.COMMUNITY || 0).toFixed(2)} kg</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Ocean Debris</span>
                              <span className="font-semibold text-gray-800 dark:text-white">{(unit.per_tipe?.OCEAN_DEBRIS || 0).toFixed(2)} kg</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Gender</p>
                          <div className="space-y-2">
                            {Object.entries(unit.gender_breakdown || {}).map(([gender, info]) => (
                              <div key={gender} className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                  {gender === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}
                                </span>
                                <span className="font-semibold text-gray-800 dark:text-white">
                                  {info.jumlah} ({info.persen}%)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}