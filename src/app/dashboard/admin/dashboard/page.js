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
  ChevronUp,
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
      transaksi_metode_bayar: {},
      perputaran_uang_per_metode: {},
      total_penarikan_rp: 0,
      saldo_aktif: 0,
    },
    per_unit: [],
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
    setExpandedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
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
                <div
                  key={i}
                  className="h-32 rounded-2xl bg-gray-100 dark:bg-slate-800"
                />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* NASABAH CARDS */}
          <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Nasabah
            </p>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">
              {global.total_nasabah}
            </p>

            {/* Gender Breakdown */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <UsersRound className="w-4 h-4" />
                  Laki-laki
                </span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {global.gender_breakdown?.LAKI_LAKI?.jumlah || 0}{" "}
                  <span className="text-xs text-gray-500">
                    ({global.gender_breakdown?.LAKI_LAKI?.persen || "0.00"}%)
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <UsersRound className="w-4 h-4" />
                  Perempuan
                </span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {global.gender_breakdown?.PEREMPUAN?.jumlah || 0}{" "}
                  <span className="text-xs text-gray-500">
                    ({global.gender_breakdown?.PEREMPUAN?.persen || "0.00"}%)
                  </span>
                </span>
              </div>
            </div>
          </div>
          {/* SETORAN CARDS */}
          <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Setoran
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {global.total_kg.toFixed(2)} kg
            </p>

            {/* Kategori Breakdown */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-2">
              {[
                { name: "PLASTIK", icon: Package },
                { name: "LOGAM", icon: Waves },
                { name: "KERTAS", icon: Trash2 },
                { name: "LAINNYA", icon: DollarSign },
                { name: "CAMPURAN", icon: RefreshCw },
              ].map(({ name, icon: Icon }) => {
                const berat = global.per_kategori?.[name] || 0;
                return (
                  <div
                    key={name}
                    className="flex justify-between items-center text-xs"
                  >
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Icon className="w-3 h-3" />
                      {name.charAt(0) + name.slice(1).toLowerCase()}
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {berat.toFixed(1)} kg
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Transaksi
            </p>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">
              {global.total_transaksi_setor + global.total_transaksi_tarik}
            </p>

            {/* Breakdown Transaksi */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
              {/* Setoran */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                    <Package className="w-3 h-3" />
                    Setoran
                  </span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {global.total_transaksi_setor}
                  </span>
                </div>
                <div className="pl-4 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Wallet className="w-3 h-3" />
                      Tabung
                    </span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {global.transaksi_metode_bayar?.TABUNG || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <DollarSign className="w-3 h-3" />
                      Jual Langsung
                    </span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {global.transaksi_metode_bayar?.JUAL_LANGSUNG || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Penarikan */}
              <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                    <TrendingUp className="w-3 h-3 rotate-180" />
                    Penarikan
                  </span>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    {global.total_transaksi_tarik}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD PERPUTARAN UANG */}
          <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Perputaran Uang
            </p>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
              {formatRupiah(global.total_rp)}
            </p>

            {/* Breakdown Metode */}
            <div className="space-y-3 mb-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Breakdown Metode Bayar
              </p>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Wallet className="w-4 h-4" />
                  Tabung
                </span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {formatRupiah(global.perputaran_uang_per_metode?.TABUNG || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <DollarSign className="w-4 h-4" />
                  Jual Langsung
                </span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {formatRupiah(
                    global.perputaran_uang_per_metode?.JUAL_LANGSUNG || 0,
                  )}
                </span>
              </div>
            </div>

            {/* Saldo Tabungan */}
            <div className="pt-4 border-t border-gray-200 dark:border-slate-700 space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Saldo Tabungan Nasabah
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Uang Masuk (Tabung)
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {formatRupiah(
                      global.perputaran_uang_per_metode?.TABUNG || 0,
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Uang Keluar (Tarik)
                  </span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {formatRupiah(global.total_penarikan_rp || 0)}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-300 dark:border-slate-600 flex justify-between">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Saldo Aktif Tersisa
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(global.saldo_aktif || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Setoran Global Berdasarkan Tipe */}
        <div className="md:col-span-4 p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
              <Waves className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Setoran Global Berdasarkan Tipe
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Breakdown tipe setoran
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Community */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <UsersRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Community
                </p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-blue-900 dark:text-blue-100">
                {(global.per_tipe?.COMMUNITY || 0).toFixed(2)}{" "}
                <span className="text-base md:text-lg text-blue-600 dark:text-blue-400">
                  kg
                </span>
              </p>
              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  {(
                    ((global.per_tipe?.COMMUNITY || 0) /
                      (global.total_kg || 1)) *
                    100
                  ).toFixed(1)}
                  % dari total
                </p>
              </div>
            </div>

            {/* Ocean Debris */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border border-cyan-200 dark:border-cyan-800">
              <div className="flex items-center gap-2 mb-3">
                <Waves className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <p className="text-sm font-medium text-cyan-800 dark:text-cyan-300">
                  Ocean Debris
                </p>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-cyan-900 dark:text-cyan-100">
                {(global.per_tipe?.OCEAN_DEBRIS || 0).toFixed(2)}{" "}
                <span className="text-base md:text-lg text-cyan-600 dark:text-cyan-400">
                  kg
                </span>
              </p>
              <div className="mt-3 pt-3 border-t border-cyan-200 dark:border-cyan-700">
                <p className="text-xs text-cyan-700 dark:text-cyan-400">
                  {(
                    ((global.per_tipe?.OCEAN_DEBRIS || 0) /
                      (global.total_kg || 1)) *
                    100
                  ).toFixed(1)}
                  % dari total
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Per Unit Breakdown */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
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
                <div
                  key={unit.unit_id}
                  className="border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden"
                >
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
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {unit.nama_unit}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {unit.total_nasabah} nasabah •{" "}
                          {unit.total_kg.toFixed(2)} kg •{" "}
                          {formatRupiah(unit.total_rp)}
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
                      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Nasabah
                          </p>
                          <p className="text-xl font-bold text-gray-800 dark:text-white">
                            {unit.total_nasabah}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Setoran
                          </p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            {unit.total_kg.toFixed(2)} kg
                          </p>
                        </div>
                      </div>

                      {/* Detail Breakdown - 3 Kolom */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Kategori Sampah */}
                        <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" />
                            Kategori Sampah
                          </p>
                          <div className="space-y-2">
                            {[
                              { name: "PLASTIK", icon: Package },
                              { name: "LOGAM", icon: Waves },
                              { name: "KERTAS", icon: Trash2 },
                              { name: "LAINNYA", icon: DollarSign },
                              { name: "CAMPURAN", icon: RefreshCw },
                            ].map(({ name, icon: Icon }) => {
                              const berat = unit.per_kategori?.[name] || 0;
                              return (
                                <div
                                  key={name}
                                  className="flex justify-between text-xs"
                                >
                                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                    <Icon className="w-3 h-3" />
                                    {name.charAt(0) +
                                      name.slice(1).toLowerCase()}
                                  </span>
                                  <span className="font-semibold text-gray-800 dark:text-white">
                                    {berat.toFixed(1)} kg
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Tipe Setoran + Gender */}
                        <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Tipe Setoran
                          </p>
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-xs">
                              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <UsersRound className="w-3 h-3" />
                                Community
                              </span>
                              <span className="font-semibold text-gray-800 dark:text-white">
                                {(unit.per_tipe?.COMMUNITY || 0).toFixed(2)} kg
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <Waves className="w-3 h-3" />
                                Ocean Debris
                              </span>
                              <span className="font-semibold text-gray-800 dark:text-white">
                                {(unit.per_tipe?.OCEAN_DEBRIS || 0).toFixed(2)}{" "}
                                kg
                              </span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Gender
                            </p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Laki-laki
                                </span>
                                <span className="font-semibold text-gray-800 dark:text-white">
                                  {unit.gender_breakdown?.LAKI_LAKI?.jumlah ||
                                    0}{" "}
                                  (
                                  {unit.gender_breakdown?.LAKI_LAKI?.persen ||
                                    "0.00"}
                                  %)
                                </span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Perempuan
                                </span>
                                <span className="font-semibold text-gray-800 dark:text-white">
                                  {unit.gender_breakdown?.PEREMPUAN?.jumlah ||
                                    0}{" "}
                                  (
                                  {unit.gender_breakdown?.PEREMPUAN?.persen ||
                                    "0.00"}
                                  %)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Transaksi */}
                        <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Transaksi
                          </p>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  Setoran
                                </span>
                                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                  {unit.total_transaksi_setor || 0}
                                </span>
                              </div>
                              <div className="pl-3 space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                    <Wallet className="w-3 h-3" />
                                    Tabung
                                  </span>
                                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                                    {unit.transaksi_metode_bayar?.TABUNG || 0}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                    <DollarSign className="w-3 h-3" />
                                    Jual Langsung
                                  </span>
                                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                                    {unit.transaksi_metode_bayar
                                      ?.JUAL_LANGSUNG || 0}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  Penarikan
                                </span>
                                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                  {unit.total_transaksi_tarik || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Perputaran Uang */}
                        <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Perputaran Uang
                          </p>
                          <div className="space-y-3">
                            {/* Total Perputaran */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  Total
                                </span>
                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                  {formatRupiah(unit.total_rp || 0)}
                                </span>
                              </div>

                              {/* Breakdown Metode Bayar */}
                              <div className="pl-3 space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                    <Wallet className="w-3 h-3" />
                                    Tabung
                                  </span>
                                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                                    {formatRupiah(
                                      unit.perputaran_uang_per_metode?.TABUNG ||
                                        0,
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                    <DollarSign className="w-3 h-3" />
                                    Jual Langsung
                                  </span>
                                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                                    {formatRupiah(
                                      unit.perputaran_uang_per_metode
                                        ?.JUAL_LANGSUNG || 0,
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Saldo Tabungan Nasabah */}
                            <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
                              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Saldo Tabungan Nasabah
                              </p>
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-500 dark:text-gray-400">
                                    Uang Masuk (Tabung)
                                  </span>
                                  <span className="font-semibold text-green-600 dark:text-green-400">
                                    {formatRupiah(
                                      unit.perputaran_uang_per_metode?.TABUNG ||
                                        0,
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-500 dark:text-gray-400">
                                    Uang Keluar (Tarik)
                                  </span>
                                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                                    {formatRupiah(unit.total_penarikan_rp || 0)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs pt-2 border-t border-gray-100 dark:border-slate-800">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    Saldo Aktif Tersisa
                                  </span>
                                  <span className="font-bold text-green-600 dark:text-green-400">
                                    {formatRupiah(unit.saldo_aktif || 0)}
                                  </span>
                                </div>
                              </div>
                            </div>
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
