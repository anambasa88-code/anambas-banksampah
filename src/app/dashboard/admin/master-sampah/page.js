"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import MasterSampahModal from "@/components/MasterSampahModal";
import {
  Package,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Power,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const CATEGORIES = [
  { value: "PLASTIK", label: "Plastik", color: "blue" },
  { value: "LOGAM", label: "Logam", color: "gray" },
  { value: "KERTAS", label: "Kertas", color: "yellow" },
  { value: "LAINNYA", label: "Lainnya", color: "purple" },
  { value: "CAMPURAN", label: "Campuran", color: "green" },
];

export default function MasterSampahPage() {
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState([]);
  const [activeTab, setActiveTab] = useState("PLASTIK");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);

  const itemsPerPage = 20; // Diubah jadi 20 per halaman

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bs_token");
      if (!token) {
        toast.error("Token tidak ditemukan, silakan login ulang");
        window.location.href = "/auth/login";
        return;
      }

      const res = await fetch("/api/users/admin/master-sampah?showAll=true", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          toast.error("Sesi berakhir, silakan login ulang");
          localStorage.clear();
          window.location.href = "/auth/login";
          return;
        }
        throw new Error("Gagal mengambil data");
      }

      const json = await res.json();
      setAllData(json.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data master sampah");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data berdasarkan kategori aktif dan search
  const filteredData = allData
    .filter((item) => item.kategori_utama === activeTab)
    .filter(
      (item) =>
        item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.keterangan_pusat.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Reset page saat ganti tab atau search
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const handleToggleActive = async (item) => {
    try {
      const token = localStorage.getItem("bs_token");
      const res = await fetch(
        `/api/users/admin/master-sampah/${item.id_barang}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_active: !item.is_active }),
        },
      );

      if (!res.ok) throw new Error("Gagal mengubah status");

      toast.success(
        `${item.nama_barang} berhasil ${!item.is_active ? "diaktifkan" : "dinonaktifkan"}`,
      );
      fetchData();
    } catch (err) {
      toast.error(err.message || "Gagal mengubah status");
    } finally {
      setShowConfirm(null);
    }
  };

  const handleEdit = (item) => {
    setEditData(item);
    setShowModal(true);
  };

  const handleModalClose = (shouldRefresh) => {
    setShowModal(false);
    setEditData(null);
    if (shouldRefresh) fetchData();
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
            <div className="h-12 rounded-lg bg-gray-100 dark:bg-slate-800" />
            <div className="h-96 rounded-2xl bg-gray-100 dark:bg-slate-800" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-green-600" />
              Master Sampah
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Kelola daftar barang sampah pusat
            </p>
          </div>
          <button
            onClick={() => {
              setEditData(null);
              setShowModal(true);
            }}
            className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Baru
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-200 dark:border-slate-700">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveTab(cat.value)}
              className={`px-4 py-2 rounded-t-lg font-medium transition-all border-b-4 ${
                activeTab === cat.value
                  ? "border-green-600 bg-green-600 text-white" // active: hijau tegas
                  : "border-transparent bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama barang atau keterangan..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
          {paginatedData.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <Package className="w-12 h-12 mx-auto text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Tidak ada data ditemukan
              </p>
              {searchTerm && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Coba ubah kata kunci pencarian
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-slate-800">
                      {/* Kolom No - paling kiri */}
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-16">
                        No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Nama Barang
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Keterangan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Harga Pusat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Batas Bawah
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Batas Atas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {paginatedData.map((item, index) => (
                      <tr
                        key={item.id_barang}
                        className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
                      >
                        {/* Kolom No - hitung dari page saat ini */}
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {item.nama_barang}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {item.keterangan_pusat || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {formatRupiah(item.harga_pusat)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatRupiah(item.batas_bawah)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatRupiah(item.batas_atas)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              item.is_active
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            }`}
                          >
                            {item.is_active ? "Aktif" : "Non-Aktif"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowConfirm(item)}
                            className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-all ${
                              item.is_active
                                ? "text-red-600 dark:text-red-400"
                                : "text-green-600 dark:text-green-400"
                            }`}
                            title={item.is_active ? "Nonaktifkan" : "Aktifkan"}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} –{" "}
                    {Math.min(currentPage * itemsPerPage, filteredData.length)}{" "}
                    dari {filteredData.length} data
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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

      {/* Modal Form */}
      {showModal && (
        <MasterSampahModal
          isOpen={showModal}
          onClose={handleModalClose}
          editData={editData}
        />
      )}

      {/* Konfirmasi Toggle */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  showConfirm.is_active
                    ? "bg-red-100 dark:bg-red-900/30"
                    : "bg-green-100 dark:bg-green-900/30"
                }`}
              >
                <AlertCircle
                  className={`w-6 h-6 ${
                    showConfirm.is_active
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  Konfirmasi{" "}
                  {showConfirm.is_active ? "Nonaktifkan" : "Aktifkan"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Apakah Anda yakin?
                </p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {showConfirm.is_active ? "Menonaktifkan" : "Mengaktifkan"}{" "}
              <span className="font-semibold">{showConfirm.nama_barang}</span>
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => handleToggleActive(showConfirm)}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all ${
                  showConfirm.is_active
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Ya, {showConfirm.is_active ? "Nonaktifkan" : "Aktifkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
