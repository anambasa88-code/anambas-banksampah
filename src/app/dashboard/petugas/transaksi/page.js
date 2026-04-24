"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { RefreshCw, Filter, Package, FileSpreadsheet } from "lucide-react";

// Import komponen yang sudah dipecah
import ExportRiwayatTransaksi from "@/components/petugas/transaksi/ExportRiwayatTransaksi";
import DetailTransaksiModal from "@/components/petugas/transaksi/DetailTransaksiModal";
import TransaksiFilterPanel from "@/components/petugas/transaksi/TransaksiFilterPanel";
import TransaksiTable from "@/components/petugas/transaksi/TransaksiTable";

export default function TransaksiPage() {
  const [transaksi, setTransaksi] = useState([]);
  const exportRef = useRef();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, limit: 20 });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setFilters({ tipe: "ALL", startDate: "", endDate: "" });
    setPage(1);
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
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

  const finalDisplayData = transaksi.map((item) => ({
    ...item,
    subItems: item.jenis === "SETOR" ? item.detail_items || [] : [],
    totalGroupRp: item.jenis === "SETOR" ? Number(item.total_rp) : Number(item.jumlah_tarik),
  }));

  return (
    <DashboardLayout>
      <ExportRiwayatTransaksi ref={exportRef} data={transaksi} filters={filters} />

      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
              <Package className="w-8 h-8 text-green-600 dark:text-green-400" />
              Riwayat Transaksi
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Semua transaksi di unit Anda</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                showFilter ? "bg-green-600 text-white" : "bg-green-50 text-green-600 border border-green-200"
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filter</span>
            </button>
            <button
              onClick={() => exportRef.current.generateExcel()}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-200"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden md:inline">Excel</span>
            </button>
            <button
              onClick={() => fetchTransaksi()}
              disabled={loading}
              className="p-2.5 bg-green-50 text-green-600 rounded-lg disabled:opacity-50 border border-green-200"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilter && (
          <TransaksiFilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
            onClose={() => setShowFilter(false)}
          />
        )}

        {/* Table Section */}
        <TransaksiTable
          data={finalDisplayData}
          loading={loading}
          page={page}
          pagination={pagination}
          onPageChange={setPage}
          onOpenModal={(t) => {
            setSelectedGroup(t);
            setIsModalOpen(true);
          }}
          formatRupiah={formatRupiah}
          formatDate={formatDate}
        />
      </div>

      {/* Modal Detail */}
      <DetailTransaksiModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedGroup}
        formatRupiah={formatRupiah}
      />
    </DashboardLayout>
  );
}