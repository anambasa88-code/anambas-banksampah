"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import MasterSampahModal from "@/components/admin/master-sampah/MasterSampahModal";
import {
  Package, Plus, Search, ChevronLeft, ChevronRight,
  Pencil, LayoutGrid, Recycle, FileText, Wrench, Layers, Inbox
} from "lucide-react";

const CATEGORIES = [
  { value: "SEMUA", label: "Semua", icon: LayoutGrid, color: "emerald" },
  { value: "PLASTIK", label: "Plastik", icon: Recycle, color: "blue" },
  { value: "LOGAM", label: "Logam", icon: Wrench, color: "slate" },
  { value: "KERTAS", label: "Kertas", icon: FileText, color: "amber" },
  { value: "LAINNYA", label: "Lainnya", icon: Layers, color: "orange" },
  { value: "CAMPURAN", label: "Campuran", icon: Package, color: "purple" },
];

const CATEGORY_STYLE = {
  PLASTIK: { badge: "bg-blue-50 text-blue-600 ring-blue-100", dot: "bg-blue-400" },
  LOGAM: { badge: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
  KERTAS: { badge: "bg-amber-50 text-amber-600 ring-amber-100", dot: "bg-amber-400" },
  LAINNYA: { badge: "bg-orange-50 text-orange-500 ring-orange-100", dot: "bg-orange-400" },
  CAMPURAN: { badge: "bg-purple-50 text-purple-600 ring-purple-100", dot: "bg-purple-400" },
};

const TAB_ACTIVE_STYLE = {
  emerald: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800",
  blue: "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-800",
  slate: "bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800",
  orange: "bg-orange-50 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:ring-orange-800",
  purple: "bg-purple-50 text-purple-700 ring-1 ring-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:ring-purple-800",
};

const itemsPerPage = 20;

const formatRupiah = (num) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);

export default function MasterSampahPage() {
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState([]);
  const [activeTab, setActiveTab] = useState("SEMUA");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bs_token");
      if (!token) { window.location.href = "/auth/login"; return; }

      const res = await fetch("/api/users/admin/master-sampah?showAll=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.clear(); window.location.href = "/auth/login"; return;
        }
        throw new Error("Gagal mengambil data");
      }
      const json = await res.json();
      setAllData(json.data || []);
    } catch (err) {
      toast.error("Gagal memuat data master sampah");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setCurrentPage(1); }, [activeTab, searchTerm]);

  const filteredData = allData
    .filter((item) => activeTab === "SEMUA" || item.kategori_utama === activeTab)
    .filter((item) =>
      item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.keterangan_pusat || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEdit = (item) => { setEditData(item); setShowModal(true); };
  const handleModalClose = (shouldRefresh) => {
    setShowModal(false); setEditData(null);
    if (shouldRefresh) fetchData();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800 rounded-md" />
              </div>
              <div className="h-9 w-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            </div>
            <div className="flex gap-2">
              {[...Array(6)].map((_, i) => <div key={i} className="h-8 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />)}
            </div>
            <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-slate-800 dark:text-white leading-tight">
                Master Sampah
              </h1>
              <p className="text-[12px] text-slate-400 mt-0.5">
                {allData.length} jenis barang terdaftar
              </p>
            </div>
          </div>
          <button
            onClick={() => { setEditData(null); setShowModal(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            Tambah Baru
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveTab(cat.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${isActive
                    ? TAB_ACTIVE_STYLE[cat.color]
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama barang atau keterangan..."
            className="w-full pl-10 pr-4 py-2.5 text-[13px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Data Display - Cards for Mobile, Table for Desktop */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">

          {paginatedData.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">Data tidak ditemukan</p>
              <p className="text-[11px] text-slate-400">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          ) : (
            <>
              {/* Desktop Table Header - Hidden on Mobile */}
              <div className="hidden md:grid grid-cols-[36px_2fr_2fr_1fr_1fr_1fr_76px_48px] gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                {[
                  { label: "No", align: "" },
                  { label: "Nama Barang", align: "" },
                  { label: "Keterangan", align: "" },
                  { label: "Harga Pusat", align: "text-right" },
                  { label: "Batas Bawah", align: "text-right" },
                  { label: "Batas Atas", align: "text-right" },
                  { label: "Status", align: "" },
                  { label: "Aksi", align: "text-right" },
                ].map((h, i) => (
                  <span key={i} className={`text-[11px] font-semibold text-slate-400 uppercase tracking-wider ${h.align}`}>
                    {h.label}
                  </span>
                ))}
              </div>

              {/* Desktop Table Rows - Hidden on Mobile */}
              <div className="hidden md:block divide-y divide-slate-50 dark:divide-slate-800">
                {paginatedData.map((item, index) => {
                  const style = CATEGORY_STYLE[item.kategori_utama] || CATEGORY_STYLE.LAINNYA;
                  return (
                    <div
                      key={item.id_barang}
                      className="grid grid-cols-[36px_2fr_2fr_1fr_1fr_1fr_76px_48px] gap-3 items-center px-5 py-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <span className="text-[12px] text-slate-400 font-medium">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </span>

                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                        <span className="text-[13px] font-semibold text-slate-800 dark:text-white truncate">
                          {item.nama_barang}
                        </span>
                      </div>

                      <span className="text-[12px] text-slate-400 truncate">
                        {item.keterangan_pusat || "-"}
                      </span>

                      <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 text-right">
                        {formatRupiah(item.harga_pusat)}
                      </span>

                      <span className="text-[12px] text-slate-400 text-right">
                        {formatRupiah(item.batas_bawah)}
                      </span>

                      <span className="text-[12px] text-slate-400 text-right">
                        {formatRupiah(item.batas_atas)}
                      </span>

                      <div>
                        <span className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-semibold ring-1 ${item.is_active
                            ? "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800"
                            : "bg-red-50 text-red-500 ring-red-100 dark:bg-red-900/20 dark:text-red-400 dark:ring-red-800"
                          }`}>
                          {item.is_active ? "Aktif" : "Non-aktif"}
                        </span>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Row Layout - Simplified horizontal rows */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedData.map((item, index) => {
                  const style = CATEGORY_STYLE[item.kategori_utama] || CATEGORY_STYLE.LAINNYA;
                  return (
                    <div
                      key={item.id_barang}
                      className="flex items-center gap-2 px-3 py-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* No */}
                      <span className="text-[11px] text-slate-400 font-medium w-5 shrink-0">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </span>

                      {/* Dot indicator */}
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />

                      {/* Nama Barang + Keterangan - Flex grow */}
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-[13px] font-semibold text-slate-800 dark:text-white leading-tight break-words">
                          {item.nama_barang}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.keterangan_pusat || "-"}
                        </p>
                      </div>

                      {/* Harga Pusat + Batas */}
                      <div className="shrink-0 text-right min-w-[80px]">
                        <span className="text-[12px] font-semibold text-emerald-600 block">
                          {formatRupiah(item.harga_pusat)}
                        </span>
                        <span className="text-[9px] text-slate-400 block">
                          ↓{formatRupiah(item.batas_bawah)} ↑{formatRupiah(item.batas_atas)}
                        </span>
                      </div>

                      {/* Status */}
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold shrink-0 ${item.is_active
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-500"
                        }`}>
                        {item.is_active ? "Aktif" : "Nonaktif"}
                      </span>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all shrink-0"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">
                    Menampilkan{" "}
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredData.length)}
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{filteredData.length}</span> data
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300 px-1">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <MasterSampahModal
          isOpen={showModal}
          onClose={handleModalClose}
          editData={editData}
          defaultKategori={activeTab === "SEMUA" ? "PLASTIK" : activeTab}
        />
      )}
    </DashboardLayout>
  );
}