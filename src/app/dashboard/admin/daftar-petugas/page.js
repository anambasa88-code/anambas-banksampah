"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import TambahPetugasModal from "@/components/TambahPetugasModal";
import { Users, Plus, ChevronLeft, ChevronRight, Edit, Power, RefreshCw, AlertCircle, X } from "lucide-react";

export default function DaftarPetugasPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [units, setUnits] = useState([]);
  const [activeUnit, setActiveUnit] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editPetugas, setEditPetugas] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null); // { type: 'reset' | 'unblock', item }
  const confirmRef = useRef(null);

  const itemsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchUnits = async () => {
    try {
      const token = localStorage.getItem("bs_token");
      if (!token) return;
      const res = await fetch("/api/users/admin/unit-bank-sampah", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setUnits(json.data || []);
      }
    } catch (err) {
      console.error("Gagal fetch units", err);
    }
  };

  const fetchPetugas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bs_token");
      if (!token) {
        toast.error("Token tidak ditemukan, silakan login ulang");
        window.location.href = "/auth/login";
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(activeUnit !== "all" && { unitId: activeUnit }),
      });

      const res = await fetch(`/api/users/admin/daftar-petugas?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          toast.error("Sesi berakhir, silakan login ulang");
          localStorage.clear();
          window.location.href = "/auth/login";
          return;
        }
        throw new Error("Gagal memuat data petugas");
      }

      const json = await res.json();
      setData(json.data || []);
      setPagination(json.pagination || { total: 0, totalPages: 1 });
    } catch (err) {
      toast.error(err.message || "Gagal memuat daftar petugas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    fetchPetugas();
  }, [activeUnit, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeUnit]);

  // Tutup modal konfirmasi kalau klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (confirmRef.current && !confirmRef.current.contains(e.target)) {
        setConfirmAction(null);
      }
    };
    if (confirmAction) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [confirmAction]);

  const openConfirm = (type, item) => {
    setConfirmAction({ type, item });
  };

  const executeAction = async () => {
    if (!confirmAction) return;
    const { type, item } = confirmAction;

    try {
      const token = localStorage.getItem("bs_token");
      let endpoint, bodyData = { targetUserId: item.id_user };

      if (type === "reset") {
        endpoint = "/api/management/reset-pin";
      } else if (type === "unblock") {
        if (!item.is_blocked) return;
        endpoint = "/api/management/unblock";
      } else {
        return;
      }

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Gagal melakukan aksi" }));
        throw new Error(errData.error);
      }

      toast.success(
        type === "reset"
          ? `PIN ${item.nickname} berhasil direset`
          : `${item.nickname} berhasil dibuka blokir`
      );

      fetchPetugas();
    } catch (err) {
      toast.error(err.message || "Gagal melakukan aksi");
    } finally {
      setConfirmAction(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-green-600" />
            Daftar Petugas
          </h1>

          <button
            onClick={() => {
              setEditPetugas(null);
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
          >
            <Plus className="w-5 h-5" />
            Tambah Petugas
          </button>
        </div>

        {/* Filter dropdown unit */}
        <div className="mb-6">
          <select
            value={activeUnit}
            onChange={(e) => setActiveUnit(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 outline-none w-full max-w-xs"
          >
            <option value="all">Semua Unit Bank Sampah</option>
            {units.map((u) => (
              <option key={u.id_unit || u.id} value={u.id_unit || u.id}>
                {u.nama_unit}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">Memuat data...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">Tidak ada data petugas</div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nickname</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nama Lengkap</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">NIK</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Jenis Kelamin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {data.map((petugas, index) => (
                  <tr key={petugas.id_user} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{petugas.nickname}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{petugas.nama_lengkap}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{petugas.nik || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {petugas.jenis_kelamin === "LAKI_LAKI" ? "Laki-laki" : "Perempuan"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {petugas.unit?.nama_unit || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {petugas.is_blocked ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          Diblokir
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditPetugas(petugas);
                            setShowModal(true);
                          }}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => openConfirm("reset", petugas)}
                          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400"
                          title="Reset PIN"
                        >
                          <Power className="w-5 h-5" />
                        </button>

                        {petugas.is_blocked && (
                          <button
                            onClick={() => openConfirm("unblock", petugas)}
                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-green-600 dark:text-green-400"
                            title="Buka Blokir"
                          >
                            <Power className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          
        )}

        {/* Pagination */}
        {pagination.total > itemsPerPage && (
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Halaman {currentPage} dari {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= pagination.totalPages}
                className="p-2 rounded-lg border disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Tambah/Edit */}
        <TambahPetugasModal
          isOpen={showModal}
          onClose={(shouldRefresh) => {
            setShowModal(false);
            setEditPetugas(null);
            if (shouldRefresh) fetchPetugas();
          }}
          editData={editPetugas}
        />

        {/* Modal Konfirmasi */}
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <div ref={confirmRef} className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-start gap-4 mb-5">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                    confirmAction.type === "reset" ? "bg-amber-100 dark:bg-amber-900/30" : "bg-green-100 dark:bg-green-900/30"
                  }`}
                >
                  <AlertCircle
                    className={`w-7 h-7 ${
                      confirmAction.type === "reset" ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"
                    }`}
                  />
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {confirmAction.type === "reset" ? "Reset PIN Petugas" : "Buka Blokir Petugas"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Apakah Anda yakin?</p>
                </div>

                <button onClick={() => setConfirmAction(null)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800">
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {confirmAction.type === "reset"
                  ? `PIN ${confirmAction.item.nickname} akan direset ke default (654321)`
                  : `Akun ${confirmAction.item.nickname} akan dibuka blokirnya dan bisa login kembali`}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 py-3 px-5 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium transition"
                >
                  Batal
                </button>
                <button
                  onClick={executeAction}
                  className={`flex-1 py-3 px-5 rounded-xl text-white font-medium transition ${
                    confirmAction.type === "reset" ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  Ya, {confirmAction.type === "reset" ? "Reset PIN" : "Buka Blokir"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>

    
  );
}