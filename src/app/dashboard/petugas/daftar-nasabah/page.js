"use client";

import { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  LockOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
} from "lucide-react";
import TambahNasabahModal from "@/components/TambahNasabahModal";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";

export default function DaftarNasabahPage() {
  const [nasabah, setNasabah] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const router = useRouter();
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    limit: 20,
  });
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchNasabah();
    }, 700); // Tunggu 700ms setelah user selesai ngetik

    return () => clearTimeout(debounceTimer); // Clear timer kalau user masih ngetik
  }, [page, search]);

  const fetchNasabah = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bs_token");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search: search,
      });

      const res = await fetch(`/api/users/petugas/daftar-nasabah?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Gagal memuat data");

      const data = await res.json();
      setNasabah(data.data || []);
      setPagination(data.pagination || { total: 0, totalPages: 1, limit: 20 });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPin = async (userId, namaLengkap) => {
    toast.warning(`Reset PIN untuk ${namaLengkap}?`, {
      action: {
        label: "Ya, Reset",
        onClick: async () => {
          setActionLoading(userId);
          try {
            const token = localStorage.getItem("bs_token");
            const res = await fetch("/api/management/reset-pin", {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ targetUserId: userId }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success(data.message);
            fetchNasabah();
          } catch (error) {
            toast.error(error.message);
          } finally {
            setActionLoading(null);
          }
        },
      },
      cancel: {
        label: "Batal",
        onClick: () => {},
      },
      duration: 5000,
    });
  };

  const handleUnblock = async (userId, namaLengkap) => {
    toast.warning(`Buka blokir akun ${namaLengkap}?`, {
      action: {
        label: "Ya, Buka Blokir",
        onClick: async () => {
          setActionLoading(userId);
          try {
            const token = localStorage.getItem("bs_token");
            const res = await fetch("/api/management/unblock", {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ targetUserId: userId }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success(data.message);
            fetchNasabah();
          } catch (error) {
            toast.error(error.message);
          } finally {
            setActionLoading(null);
          }
        },
      },
      cancel: {
        label: "Batal",
        onClick: () => {},
      },
      duration: 5000,
    });
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              Daftar Nasabah
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Kelola data nasabah di unit Anda
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol Tambah Nasabah - Hijau Solid */}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Tambah Nasabah</span>
            </button>

            {/* Tombol Refresh - Hijau Soft / Outlined */}
            <button
              onClick={fetchNasabah}
              disabled={loading}
              className="p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 disabled:opacity-50 transition-colors border border-green-200 dark:border-green-800"
              title="Refresh Data"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, nickname, atau NIK..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-slate-700">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Memuat data...
            </div>
          ) : nasabah.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Tidak ada data nasabah
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        Nickname
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        Nama Lengkap
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        NIK
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        Jenis Kelamin
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        Desa
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        Alamat
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        Saldo
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {nasabah.map((n, idx) => (
                      <tr
                        key={n.id_user}
                        className="hover:bg-gray-50 dark:hover:bg-slate-800"
                      >
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {(page - 1) * pagination.limit + idx + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          {n.nickname}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {n.nama_lengkap}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {n.nik || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {n.jenis_kelamin}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {n.desa || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {n.alamat || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-green-600 dark:text-green-400">
                          {formatRupiah(n.total_saldo)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => router.push(`/dashboard/petugas/detail-nasabah/${n.id_user}`)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            Detail
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                handleResetPin(n.id_user, n.nama_lengkap)
                              }
                              disabled={actionLoading === n.id_user}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg disabled:opacity-50"
                              title="Reset PIN"
                            >
                              <RefreshCw
                                className={`w-4 h-4 ${actionLoading === n.id_user ? "animate-spin" : ""}`}
                              />
                            </button>
                            {n.is_blocked && (
                              <button
                                onClick={() =>
                                  handleUnblock(n.id_user, n.nama_lengkap)
                                }
                                disabled={actionLoading === n.id_user}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg disabled:opacity-50"
                                title="Buka Blokir"
                              >
                                <LockOpen className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Menampilkan {(page - 1) * pagination.limit + 1} -{" "}
                  {Math.min(page * pagination.limit, pagination.total)} dari{" "}
                  {pagination.total} data
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Halaman {page} dari {pagination.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(pagination.totalPages, p + 1))
                    }
                    disabled={page === pagination.totalPages}
                    className="p-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <TambahNasabahModal
        isOpen={showModal}
        onClose={(shouldRefresh) => {
          setShowModal(false);
          if (shouldRefresh === true) fetchNasabah();
        }}
      />
    </DashboardLayout>
  );
}
