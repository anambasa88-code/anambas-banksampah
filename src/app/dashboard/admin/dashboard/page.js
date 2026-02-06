"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import ExportDashboardAdmin from "@/components/ExportDashboardAdmin";
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
  Categories,
  Search,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
const CATEGORIES = [
  { value: "SEMUA", label: "Semua Kategori" },
  { value: "PLASTIK", label: "Plastik" },
  { value: "LOGAM", label: "Logam" },
  { value: "KERTAS", label: "Kertas" },
  { value: "LAINNYA", label: "Lainnya" },
  { value: "CAMPURAN", label: "Campuran" },
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [expandedUnits, setExpandedUnits] = useState({});
  const [activeTab, setActiveTab] = useState("SEMUA");
  const [filters, setFilters] = useState({
    mode: "DATE", // Pilihan: "DATE" atau "MONTH"
    startDate: "",
    endDate: "",
    startMonth: "",
    endMonth: "",
  });
  const exportRef = useRef();
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

  const filteredGlobalSampah =
    data.global?.sampah_terkumpul?.filter((item) => {
      return (
        activeTab === "SEMUA" ||
        (item.kategori_utama || "LAINNYA") === activeTab
      );
    }) || [];

  const setQuickFilter = (type) => {
    const now = new Date();
    let start = "";
    let end = "";

    if (type === "THIS_MONTH") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (type === "LAST_MONTH") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (type === "THIS_YEAR") {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
    }

    // Format ke YYYY-MM-DD agar masuk ke input type="date"
    const formatDate = (date) => date.toISOString().split("T")[0];

    setFilters({
      startDate: formatDate(start),
      endDate: formatDate(end),
    });
  };
  // Ganti fungsi fetchDashboard lama dengan ini
  const fetchDashboard = async (sDate, eDate) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bs_token");

      // Gunakan parameter sDate/eDate jika ada, jika tidak pakai dari state filters
      const startDate = sDate || filters.startDate;
      const endDate = eDate || filters.endDate;

      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      console.log("Fetching with params:", params.toString()); // Debug log

      const res = await fetch(
        `/api/users/admin/dashboard?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error("Gagal mengambil data");
      const result = await res.json();
      setData(result);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(); // Ini cuma jalan sekali pas pertama kali halaman dibuka
  }, []);

  // Ganti fungsi handleSearch lama dengan ini
  const handleSearch = () => {
    let finalStartDate = filters.startDate;
    let finalEndDate = filters.endDate;

    if (filters.mode === "MONTH") {
      if (!filters.startMonth || !filters.endMonth) {
        return toast.error("Pilih bulan mulai dan bulan akhir!");
      }

      // Format: YYYY-MM-01
      finalStartDate = `${filters.startMonth}-01`;

      // Ambil hari terakhir di bulan tersebut
      const [year, month] = filters.endMonth.split("-");
      const lastDay = new Date(year, month, 0).getDate();
      finalEndDate = `${filters.endMonth}-${lastDay}`;
    }

    if (!finalStartDate || !finalEndDate) {
      return toast.error("Rentang waktu belum lengkap!");
    }

    // Validasi urutan waktu
    if (new Date(finalEndDate) < new Date(finalStartDate)) {
      return toast.error("Rentang waktu terbalik!");
    }

    // Kirim data langsung ke fungsi fetch
    fetchDashboard(finalStartDate, finalEndDate);
  };

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
      <ExportDashboardAdmin
        ref={exportRef}
        data={data}
        startDate={filters.startDate}
        endDate={filters.endDate}
        category={activeTab}
      />
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
          <div className="flex items-center gap-2">
            {/* Tombol Export Excel - Soft Blue Style */}
            <button
              onClick={() => exportRef.current.generateExcel()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-200 transition-all shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            {/* Tombol Export PDF - Soft Slate Style */}
            <button
              onClick={() => exportRef.current.generatePDF()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
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

        {/* FILTER SECTION */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 mb-6 shadow-sm">
          {/* Tab Switcher */}
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl w-fit mb-6">
            <button
              onClick={() => setFilters({ ...filters, mode: "DATE" })}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filters.mode === "DATE"
                  ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600"
                  : "text-gray-500"
              }`}
            >
              Rentang Tanggal
            </button>
            <button
              onClick={() => setFilters({ ...filters, mode: "MONTH" })}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filters.mode === "MONTH"
                  ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600"
                  : "text-gray-500"
              }`}
            >
              Pilih Bulan
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1 grid grid-cols-2 gap-4">
              {filters.mode === "DATE" ? (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">
                      Dari Tanggal
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm outline-none"
                      value={filters.startDate}
                      onChange={(e) =>
                        setFilters({ ...filters, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">
                      Sampai Tanggal
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm outline-none"
                      value={filters.endDate}
                      onChange={(e) =>
                        setFilters({ ...filters, endDate: e.target.value })
                      }
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">
                      Dari Bulan
                    </label>
                    <input
                      type="month"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm outline-none"
                      value={filters.startMonth}
                      onChange={(e) =>
                        setFilters({ ...filters, startMonth: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">
                      Sampai Bulan
                    </label>
                    <input
                      type="month"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm outline-none"
                      value={filters.endMonth}
                      onChange={(e) =>
                        setFilters({ ...filters, endMonth: e.target.value })
                      }
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-8 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Cari
              </button>
              <button
                onClick={() =>
                  setFilters({
                    mode: "DATE",
                    startDate: "",
                    endDate: "",
                    startMonth: "",
                    endMonth: "",
                  })
                }
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-500 hover:bg-gray-100 transition-all"
              >
                Reset
              </button>
            </div>
          </div>
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

        {/* Judul & Filter Kategori */}
        <div className="space-y-4 mt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Total Sampah Terkumpul (Seluruh Unit)
            </h2>

            {/* Tabs Kategori */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveTab(cat.value)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    activeTab === cat.value
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabel Data Global */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">No</th>
                    <th className="px-6 py-4">Nama Sampah</th>
                    <th className="px-6 py-4 text-center">Kategori</th>
                    <th className="px-6 py-4 text-right">Total Berat (kg)</th>
                    <th className="px-6 py-4 text-right">Total Transaksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                  {filteredGlobalSampah.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center text-gray-500 italic"
                      >
                        Data tidak ditemukan untuk periode ini.
                      </td>
                    </tr>
                  ) : (
                    filteredGlobalSampah.map((item, idx) => (
                      <tr
                        key={item.barang_id}
                        className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-white">
                          {item.nama_sampah}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                            {item.kategori_utama}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-gray-900 dark:text-white">
                          {item.total_berat.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-500">
                          {item.total_transaksi}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
