"use client";

import { useEffect, useState,useRef } from "react";
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
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  CalendarRange,
  CircleDollarSign,
  CalendarDays,
  Search,
  FileSpreadsheet, 
  FileText,
} from "lucide-react";
import ExportDashboardPetugas from "@/components/ExportDashboardPetugas";

const CATEGORIES = [
  { value: "SEMUA", label: "Semua Kategori" },
  { value: "PLASTIK", label: "Plastik" },
  { value: "LOGAM", label: "Logam" },
  { value: "KERTAS", label: "Kertas" },
  { value: "LAINNYA", label: "Lainnya" },
  { value: "CAMPURAN", label: "Campuran" },
];

export default function PetugasDashboard() {
  const [loading, setLoading] = useState(true);
  const exportRef = useRef();

  const [data, setData] = useState({
    total_kg: 0,
    total_rp: 0,
    per_tipe: {},
    per_kategori: {},
    total_nasabah: 0,
    gender_breakdown: {},
    total_transaksi_setor: 0,
    total_transaksi_tarik: 0,
    transaksi_metode_bayar: {},
    total_penarikan_rp: 0,
    saldo_aktif: 0,
    sampah_terkumpul: [],
  });
  // Tambahkan dua baris ini bro:

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");

  const [activeTab, setActiveTab] = useState("SEMUA");

  const resetFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  const setQuickFilter = (type) => {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    if (type === "today") {
      // Set ke hari ini saja
      const dateStr = now.toISOString().split("T")[0];
      setStartDate(dateStr);
      setEndDate(dateStr);
    } else if (type === "week") {
      // 7 hari ke belakang
      start.setDate(now.getDate() - 7);
      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
    } else if (type === "month") {
      // Awal bulan ini sampai hari ini
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
    }

    toast.success(
      `Filter ${type === "today" ? "Hari Ini" : type === "week" ? "Pekan Ini" : "Bulan Ini"} Terpasang`,
    );
  };

  const setMonthFilter = (e) => {
    const [year, month] = e.target.value.split("-"); // format "YYYY-MM"
    if (!year || !month) return;

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0); // Angka 0 di tanggal otomatis ke hari terakhir bulan sebelumnya

    setStartDate(firstDay.toISOString().split("T")[0]);
    setEndDate(lastDay.toISOString().split("T")[0]);

    toast.success(
      `Periode diatur ke ${firstDay.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`,
    );
  };
  const [filterMode, setFilterMode] = useState("range");

  const handleMonthSearch = () => {
    if (!startMonth || !endMonth) {
      toast.error("Pilih periode bulan secara lengkap!");
      return;
    }

    // Set start ke tanggal 1
    const start = new Date(startMonth + "-01");
    // Set end ke tanggal terakhir di bulan tersebut
    const end = new Date(endMonth + "-01");
    const lastDay = new Date(end.getFullYear(), end.getMonth() + 1, 0);

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(lastDay.toISOString().split("T")[0]);

    // Panggil fetch setelah state di-update (Gunakan delay kecil agar state sempat terisi)
    setTimeout(() => fetchDashboard(), 100);
  };

  const filteredSampahTerkumpul =
    data.sampah_terkumpul?.filter((item) => {
      return (
        activeTab === "SEMUA" ||
        (item.kategori_utama || "LAINNYA") === activeTab
      );
    }) || [];

  const isDateInvalid =
    startDate && endDate && new Date(startDate) > new Date(endDate);

  // 2. Modifikasi fetchDashboard untuk mengirim parameter tanggal
  const fetchDashboard = async () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai, bro!");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("bs_token");

      // 2. Susun URL dengan query params
      let url = "/api/users/petugas/dashboard";
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      // 3. Eksekusi Fetch
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal mengambil dashboard");

      const json = await res.json();
      setData(json || {});

      // Kasih feedback kalau filter berhasil (opsional)
      if (startDate || endDate) {
        toast.success("Data berhasil difilter");
      }
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
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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

  const {
    total_kg,
    total_rp,
    per_tipe,
    per_kategori,
    total_nasabah,
    gender_breakdown,
    total_transaksi_setor,
    total_transaksi_tarik,
    transaksi_metode_bayar,
    total_penarikan_rp,
    saldo_aktif,
    perputaran_uang_per_metode,
    sampah_terkumpul,
  } = data;

  const topKategori = Object.entries(per_kategori || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Generator Komponen (Hidden) */}
        <ExportDashboardPetugas
          ref={exportRef}
          data={data}
          startDate={startDate}
          endDate={endDate}
          category={activeTab}
        />
        {/* Header */}
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              Dashboard Petugas
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Rekap unit kerja Anda
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Generator Komponen (Hidden) */}
            <ExportDashboardPetugas
              ref={exportRef}
              data={data}
              startDate={startDate}
              endDate={endDate}
              category={activeTab}
            />

            {/* Tombol Export Excel */}
            <button
              onClick={() => exportRef.current.generateExcel()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-200 transition-all shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            {/* Tombol Export PDF */}
            <button
              onClick={() => exportRef.current.generatePDF()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>

            {/* Tombol Refresh Bawaan */}
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold text-xs hover:bg-green-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm shadow-green-200"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden md:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Modern Filter Section */}
        <div className="space-y-4">
          {/* Header Filter: Tab Mode & Shortcuts */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setFilterMode("range")}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filterMode === "range"
                    ? "bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Harian
              </button>
              <button
                onClick={() => setFilterMode("month")}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filterMode === "month"
                    ? "bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Bulanan
              </button>
            </div>

            {/* Quick Shortcuts - Hanya muncul di mode harian */}
            {filterMode === "range" && (
              <div className="flex items-center gap-2">
                {["today", "week", "month"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setQuickFilter(type)}
                    className="px-3 py-1.5 text-[10px] font-bold uppercase bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-emerald-500 transition-all text-slate-500 hover:text-emerald-600 shadow-sm"
                  >
                    {type === "today"
                      ? "Hari Ini"
                      : type === "week"
                        ? "1 Pekan"
                        : "Bulan Ini"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main Input Box */}
          <div className="bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row items-stretch md:items-center">
              {filterMode === "range" ? (
                /* MODE HARIAN */
                <>
                  <div className="flex-1 p-3 border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-800 group transition-all">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                      Mulai Dari
                    </label>
                    <div className="flex items-center gap-2">
                      <CalendarRange className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-transparent w-full text-sm font-semibold outline-none text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="flex-1 p-3 border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-800 group transition-all">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                      Sampai Dengan
                    </label>
                    <div className="flex items-center gap-2">
                      <CalendarRange className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                      <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-transparent w-full text-sm font-semibold outline-none text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* MODE BULANAN */
                <>
                  <div className="flex-1 p-3 border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-800 group transition-all">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                      Dari Bulan
                    </label>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-emerald-500" />
                      <input
                        type="month"
                        value={startMonth}
                        onChange={(e) => setStartMonth(e.target.value)}
                        className="bg-transparent w-full text-sm font-bold outline-none text-slate-800 dark:text-white cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="flex-1 p-3 border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-800 group transition-all">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                      Sampai Bulan
                    </label>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-emerald-500" />
                      <input
                        type="month"
                        value={endMonth}
                        min={startMonth}
                        onChange={(e) => setEndMonth(e.target.value)}
                        className="bg-transparent w-full text-sm font-bold outline-none text-slate-800 dark:text-white cursor-pointer"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="p-3 px-6 flex items-center justify-center gap-3 bg-slate-50/50 dark:bg-slate-800/20">
                {(startDate || endDate || startMonth || endMonth) && (
                  <button
                    onClick={resetFilter}
                    className="p-2 text-slate-400 hover:text-red-500 transition-all"
                    title="Reset"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={
                    filterMode === "month" ? handleMonthSearch : fetchDashboard
                  }
                  disabled={loading || isDateInvalid}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md ${
                    isDateInvalid
                      ? "bg-red-50 text-red-500 cursor-not-allowed border border-red-200"
                      : "bg-slate-800 dark:bg-emerald-600 text-white hover:bg-black dark:hover:bg-emerald-500"
                  }`}
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" strokeWidth={3} />
                  )}
                  <span>{isDateInvalid ? "Range Error!" : "Cari Data"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats - 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Total Nasabah */}
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
              {total_nasabah}
            </p>

            {/* Gender Breakdown */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <UsersRound className="w-4 h-4" />
                  Laki-laki
                </span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {gender_breakdown?.LAKI_LAKI?.jumlah || 0}{" "}
                  <span className="text-xs text-gray-500">
                    ({gender_breakdown?.LAKI_LAKI?.persen || "0.00"}%)
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <UsersRound className="w-4 h-4" />
                  Perempuan
                </span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {gender_breakdown?.PEREMPUAN?.jumlah || 0}{" "}
                  <span className="text-xs text-gray-500">
                    ({gender_breakdown?.PEREMPUAN?.persen || "0.00"}%)
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Total Setoran (kg) */}
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
              {total_kg.toFixed(2)} kg
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
                const berat = per_kategori?.[name] || 0;
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

          {/* Total Transaksi */}
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
              {total_transaksi_setor + total_transaksi_tarik}
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
                    {total_transaksi_setor}
                  </span>
                </div>
                <div className="pl-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Wallet className="w-3 h-3" />
                      Tabung
                    </span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {transaksi_metode_bayar?.TABUNG || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <DollarSign className="w-3 h-3" />
                      Jual Langsung
                    </span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {transaksi_metode_bayar?.JUAL_LANGSUNG || 0}
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
                    {total_transaksi_tarik}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Perputaran Uang */}
          <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <CircleDollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Perputaran Uang
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatRupiah(total_rp || 0)}
            </p>

            {/* Breakdown */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
              {/* Metode Bayar */}
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Breakdown Metode Bayar
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Wallet className="w-3 h-3" />
                      Tabung
                    </span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {formatRupiah(
                        data.perputaran_uang_per_metode?.TABUNG || 0,
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
                        data.perputaran_uang_per_metode?.JUAL_LANGSUNG || 0,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Saldo Tabungan */}
              <div className="pt-3 border-t border-gray-100 dark:border-slate-800">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Saldo Tabungan Nasabah
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <ArrowUpRight className="w-3 h-3" />
                      Uang Masuk
                    </span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {formatRupiah(
                        data.perputaran_uang_per_metode?.TABUNG || 0,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <ArrowDownRight className="w-3 h-3" />
                      Uang Keluar
                    </span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                      {formatRupiah(data.total_penarikan_rp || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t border-gray-100 dark:border-slate-800">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Saldo Aktif
                    </span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      {formatRupiah(data.saldo_aktif || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sampah Terkumpul Per Jenis - TABEL */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Sampah Terkumpul Per Jenis
          </h2>

          {/* Filter Kategori Model Tab */}
          <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveTab(cat.value)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === cat.value
                    ? "bg-green-600 text-white shadow-md shadow-green-200" // GANTI DI SINI BRO
                    : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

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
                  {filteredSampahTerkumpul.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center text-gray-500 italic"
                      >
                        Data kategori {activeTab} tidak ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredSampahTerkumpul.map((item, idx) => (
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
                          <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase">
                            {item.kategori_utama || "LAINNYA"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-gray-900 dark:text-white">
                          {(Number(item.total_berat) || 0).toFixed(2)}
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

        {/* Tipe Setoran - 2 Cards */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Setoran Berdasarkan Tipe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Community */}
            <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                  <UsersRound className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Community
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Sampah dari komunitas
                  </p>
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                {(per_tipe?.COMMUNITY || 0).toFixed(2)}{" "}
                <span className="text-base md:text-lg text-gray-500">kg</span>
              </p>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(
                    ((per_tipe?.COMMUNITY || 0) / (total_kg || 1)) *
                    100
                  ).toFixed(1)}
                  % dari total
                </p>
              </div>
            </div>

            {/* Ocean Debris */}
            <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <Waves className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ocean Debris
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Sampah dari laut
                  </p>
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                {(per_tipe?.OCEAN_DEBRIS || 0).toFixed(2)}{" "}
                <span className="text-base md:text-lg text-gray-500">kg</span>
              </p>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(
                    ((per_tipe?.OCEAN_DEBRIS || 0) / (total_kg || 1)) *
                    100
                  ).toFixed(1)}
                  % dari total
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
