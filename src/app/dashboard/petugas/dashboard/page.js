"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import ExportDashboardPetugas from "@/components/petugas/dashboard/ExportDashboardPetugas";
import FilterSection from "@/components/petugas/dashboard/FilterSection";
import StatsGrid from "@/components/petugas/dashboard/StatsGrid";
import SampahTable from "@/components/petugas/dashboard/SampahTable";
import TipeSetoranCards from "@/components/petugas/dashboard/TipeSetoranCards";
import { FileSpreadsheet, FileText, RefreshCw } from "lucide-react";

export default function PetugasDashboard() {
  const exportRef = useRef();
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState("range");
  const [startDate, setStartDate]   = useState("");
  const [endDate, setEndDate]       = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth]     = useState("");
  const [activeTab, setActiveTab]   = useState("SEMUA");

  const [data, setData] = useState({
    total_kg: 0, total_rp: 0, per_tipe: {}, per_kategori: {},
    total_nasabah: 0, gender_breakdown: {}, total_transaksi_setor: 0,
    total_transaksi_tarik: 0, transaksi_metode_bayar: {}, total_penarikan_rp: 0,
    saldo_aktif: 0, perputaran_uang_per_metode: {}, sampah_terkumpul: [],
  });

  const isDateInvalid = startDate && endDate && new Date(startDate) > new Date(endDate);

  const resetFilter = () => {
    setStartDate(""); setEndDate("");
    setStartMonth(""); setEndMonth("");
  };

  const setQuickFilter = (type) => {
    const now = new Date();
    const start = new Date();
    if (type === "today") {
      const d = now.toISOString().split("T")[0];
      setStartDate(d); setEndDate(d);
    } else if (type === "week") {
      start.setDate(now.getDate() - 7);
      setStartDate(start.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
    } else if (type === "month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
    }
    toast.success(`Filter ${type === "today" ? "Hari Ini" : type === "week" ? "1 Pekan" : "Bulan Ini"} terpasang`);
  };

  const handleMonthSearch = () => {
    if (!startMonth || !endMonth) { toast.error("Pilih periode bulan secara lengkap!"); return; }
    const start   = new Date(startMonth + "-01");
    const end     = new Date(endMonth + "-01");
    const lastDay = new Date(end.getFullYear(), end.getMonth() + 1, 0);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(lastDay.toISOString().split("T")[0]);
    setTimeout(() => fetchDashboard(), 100);
  };

  const fetchDashboard = async () => {
    if (isDateInvalid) { toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai!"); return; }
    try {
      setLoading(true);
      const token = localStorage.getItem("bs_token");
      let url = "/api/users/petugas/dashboard";
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate)   params.append("endDate",   endDate);
      const qs = params.toString();
      if (qs) url += `?${qs}`;

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Gagal mengambil dashboard");
      const json = await res.json();
      setData({
        ...json,
        sampah_terkumpul: Array.isArray(json?.sampah_terkumpul) ? json.sampah_terkumpul : [],
      });
      if (startDate || endDate) toast.success("Data berhasil difilter");
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto animate-pulse space-y-6">
          <div className="h-8 w-64 rounded-lg bg-gray-200" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-52 rounded-2xl bg-gray-100" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 md:space-y-8">

        <ExportDashboardPetugas ref={exportRef} data={data} startDate={startDate} endDate={endDate} category={activeTab} />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Dashboard Petugas</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Rekap unit kerja Anda</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => exportRef.current.generateExcel()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-200 transition-all shadow-sm">
              <FileSpreadsheet className="w-4 h-4" /><span className="hidden sm:inline">Excel</span>
            </button>
            <button onClick={() => exportRef.current.generatePDF()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all shadow-sm">
              <FileText className="w-4 h-4" /><span className="hidden sm:inline">PDF</span>
            </button>
            <button onClick={fetchDashboard} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all disabled:opacity-50 shadow-sm">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>
          </div>
        </div>

        <FilterSection
          filterMode={filterMode}     setFilterMode={setFilterMode}
          startDate={startDate}       setStartDate={setStartDate}
          endDate={endDate}           setEndDate={setEndDate}
          startMonth={startMonth}     setStartMonth={setStartMonth}
          endMonth={endMonth}         setEndMonth={setEndMonth}
          isDateInvalid={isDateInvalid}
          loading={loading}
          onSearch={filterMode === "month" ? handleMonthSearch : fetchDashboard}
          onReset={resetFilter}
          onQuickFilter={setQuickFilter}
        />

        <StatsGrid data={data} formatRupiah={formatRupiah} />

        <SampahTable data={data.sampah_terkumpul} activeTab={activeTab} setActiveTab={setActiveTab} />

        <TipeSetoranCards per_tipe={data.per_tipe} total_kg={data.total_kg} />

      </div>
    </DashboardLayout>
  );
}
