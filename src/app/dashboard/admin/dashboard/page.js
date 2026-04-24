"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import ExportDashboardAdmin from "@/components/admin/dashboard/ExportDashboardAdmin";
import DashboardStatsCard from "@/components/admin/dashboard/DashboardStatsCard";
import UnitTable from "@/components/admin/dashboard/UnitTable";
import FilterControls from "@/components/admin/dashboard/FilterControls";
import ExportButtons from "@/components/admin/dashboard/ExportButtons";
import GlobalSampahTable from "@/components/admin/dashboard/GlobalSampahTable";
import { 
  RefreshCw, 
  Building2, 
  TrendingUp, 
  FileSpreadsheet, 
  FileText, 
  ArrowLeft,
  Search,
  Categories
} from "lucide-react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [expandedUnits, setExpandedUnits] = useState({});
  const [activeTab, setActiveTab] = useState("SEMUA");
  const [filters, setFilters] = useState({
    mode: "DATE",
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
        item.kategori_utama === activeTab
      );
    }) || [];

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bs_token");
      if (!token) {
        toast.error("Token tidak ditemukan");
        return;
      }

      const params = new URLSearchParams();
      if (filters.mode === "DATE") {
        if (filters.startDate) params.append("start_date", filters.startDate);
        if (filters.endDate) params.append("end_date", filters.endDate);
      } else {
        if (filters.startMonth) params.append("start_month", filters.startMonth);
        if (filters.endMonth) params.append("end_month", filters.endMonth);
      }

      const res = await fetch(`/api/users/admin/dashboard?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Gagal mengambil data");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = () => {
    fetchData();
  };

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  };

  const formatRupiah = (num) => {
    const value = Number(num) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const { global, per_unit } = data;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 rounded-lg bg-gray-200 dark:bg-slate-800" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-lg bg-gray-200 dark:bg-slate-800" />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Dashboard Admin
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monitoring dan analisis data seluruh unit bank sampah
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-all dark:bg-gray-800 dark:text-gray-300"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <FilterControls
          filters={filters}
          setFilters={setFilters}
          handleFilter={handleFilter}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <DashboardStatsCard
            type="nasabah"
            data={data}
            global={global}
            formatRupiah={formatRupiah}
          />
          <DashboardStatsCard
            type="sampah"
            data={data}
            global={global}
            formatRupiah={formatRupiah}
          />
          <DashboardStatsCard
            type="transaksi"
            data={data}
            global={global}
            formatRupiah={formatRupiah}
          />
          <DashboardStatsCard
            type="keuangan"
            data={data}
            global={global}
            formatRupiah={formatRupiah}
          />
        </div>

        {/* Global Sampah Table */}
        <div className="space-y-4 mt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
                Data Sampah Global ({filteredGlobalSampah.length} Jenis)
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Rekapitulasi seluruh jenis sampah terkumpul
              </p>
            </div>
            <ExportButtons
              data={data}
              exportRef={exportRef}
              filters={filters}
              activeTab={activeTab}
            />
          </div>
          
          <GlobalSampahTable 
            filteredGlobalSampah={filteredGlobalSampah}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        {/* Unit Table */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-4">
            <UnitTable
              per_unit={per_unit}
              expandedUnits={expandedUnits}
              toggleUnit={toggleUnit}
              formatRupiah={formatRupiah}
            />
          </div>
        </div>

        {/* Export Component (Hidden) */}
        <ExportDashboardAdmin
          ref={exportRef}
          data={data}
          filters={filters}
          activeTab={activeTab}
        />
      </div>
    </DashboardLayout>
  );
}
