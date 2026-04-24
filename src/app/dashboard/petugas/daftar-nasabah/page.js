"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import TambahNasabahModal from "@/components/petugas/nasabah/TambahNasabahModal";
import EditNasabahModal from "@/components/petugas/nasabah/EditNasabahModal";
import NasabahTable from "@/components/petugas/nasabah/NasabahTable";
import { Users, Plus, RefreshCw, Search } from "lucide-react";

export default function DaftarNasabahPage() {
  const router = useRouter();
  const [nasabah, setNasabah] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNasabah, setSelectedNasabah] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    limit: 20,
  });

  useEffect(() => {
    const timer = setTimeout(() => fetchNasabah(), 700);
    return () => clearTimeout(timer);
  }, [page, search]);

  const fetchNasabah = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bs_token");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search,
      });
      const res = await fetch(`/api/users/petugas/daftar-nasabah?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal memuat data");
      const data = await res.json();
      setNasabah(data.data || []);
      setPagination(data.pagination || { total: 0, totalPages: 1, limit: 20 });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPin = (userId, nama) => {
    toast.warning(`Reset PIN untuk ${nama}?`, {
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
          } catch (err) {
            toast.error(err.message);
          } finally {
            setActionLoading(null);
          }
        },
      },
      cancel: { label: "Batal", onClick: () => {} },
      duration: 5000,
    });
  };

  const handleUnblock = (userId, nama) => {
    toast.warning(`Buka blokir akun ${nama}?`, {
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
          } catch (err) {
            toast.error(err.message);
          } finally {
            setActionLoading(null);
          }
        },
      },
      cancel: { label: "Batal", onClick: () => {} },
      duration: 5000,
    });
  };

  const handleEdit = (nasabahData) => {
    setSelectedNasabah(nasabahData);
    setShowEditModal(true);
  };

  const handleCloseEditModal = (refresh) => {
    setShowEditModal(false);
    setSelectedNasabah(null);
    if (refresh === true) fetchNasabah();
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-[16px] font-semibold text-slate-800 dark:text-white">
                Daftar Nasabah
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {pagination.total > 0
                  ? `${pagination.total} nasabah terdaftar`
                  : "Kelola data nasabah unit Anda"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[12px] font-semibold hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/20 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" /> Tambah Nasabah
            </button>
            <button
              onClick={fetchNasabah}
              disabled={loading}
              className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 disabled:opacity-50 transition-all dark:bg-slate-800 dark:text-slate-300"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, nickname, atau NIK..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[13px] text-slate-700 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
          />
        </div>

        {/* Table */}
        <NasabahTable
          data={nasabah}
          loading={loading}
          page={page}
          pagination={pagination}
          actionLoading={actionLoading}
          onPageChange={setPage}
          onSetor={(id) =>
            router.push(`/dashboard/petugas/daftar-nasabah/${id}/setor`)
          }
          onTarik={(id) =>
            router.push(`/dashboard/petugas/daftar-nasabah/${id}/tarik`)
          }
          onDetail={(id) =>
            router.push(`/dashboard/petugas/detail-nasabah/${id}`)
          }
          onEdit={handleEdit}
          onResetPin={handleResetPin}
          onUnblock={handleUnblock}
        />
      </div>

      <TambahNasabahModal
        isOpen={showModal}
        onClose={(refresh) => {
          setShowModal(false);
          if (refresh === true) fetchNasabah();
        }}
      />

      <EditNasabahModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        nasabah={selectedNasabah}
        onSuccess={() => fetchNasabah()}
      />
    </DashboardLayout>
  );
}
