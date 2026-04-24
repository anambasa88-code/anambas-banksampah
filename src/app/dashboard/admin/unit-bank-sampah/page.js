"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import UnitBankSampahModal from "@/components/admin/bank-sampah/UnitBankSampahModal";
import { Building2, Plus, Pencil, MapPin } from "lucide-react";

export default function UnitBankSampahPage() {
  const [loading, setLoading] = useState(true);
  const [allData, setAllData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bs_token");
      if (!token) {
        toast.error("Token tidak ditemukan, silakan login ulang");
        window.location.href = "/auth/login";
        return;
      }

      const res = await fetch("/api/users/admin/unit-bank-sampah", {
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
      toast.error("Gagal memuat data unit bank sampah");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (item) => {
    setEditData(item);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditData(null);
    setShowModal(true);
  };

  const handleModalClose = (shouldRefresh) => {
    setShowModal(false);
    setEditData(null);
    if (shouldRefresh) fetchData();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-7 w-56 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="h-4 w-72 bg-slate-100 dark:bg-slate-800 rounded-md" />
              </div>
              <div className="h-9 w-36 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            </div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-slate-800 dark:text-white leading-tight">
                Unit Bank Sampah
              </h1>
              <p className="text-[12px] text-slate-400 mt-0.5">
                {allData.length} unit terdaftar
              </p>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            Tambah Unit
          </button>
        </div>

        {/* Content */}
        {allData.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl py-20 px-6 text-center space-y-4">
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
              <Building2 className="w-7 h-7 text-slate-400" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-slate-700 dark:text-slate-200">
                Belum ada unit bank sampah
              </p>
              <p className="text-[12px] text-slate-400 mt-1">
                Mulai dengan menambahkan unit pertama
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Unit Pertama
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {/* Table header */}
            <div className="grid grid-cols-[40px_1fr_2fr_72px] gap-4 px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">No</span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nama Unit</span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Alamat</span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Aksi</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {allData.map((item, index) => (
                <div
                  key={item.id_unit}
                  className="grid grid-cols-[40px_1fr_2fr_72px] gap-4 items-center px-5 py-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors group"
                >
                  {/* No */}
                  <span className="text-[12px] font-medium text-slate-400">
                    {index + 1}
                  </span>

                  {/* Nama Unit */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-[13px] font-semibold text-slate-800 dark:text-white truncate">
                      {item.nama_unit}
                    </span>
                  </div>

                  {/* Alamat */}
                  <div className="flex items-start gap-1.5 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 mt-0.5 shrink-0" />
                    <span className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.alamat_unit || "-"}
                    </span>
                  </div>

                  {/* Aksi */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 transition-all"
                      title="Edit unit ini"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <UnitBankSampahModal
          isOpen={showModal}
          onClose={handleModalClose}
          editData={editData}
        />
      )}
    </DashboardLayout>
  );
}