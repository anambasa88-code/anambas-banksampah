"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import UnitBankSampahModal from "@/components/UnitBankSampahModal";
import { Building2, Plus, Edit } from "lucide-react";

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
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="flex items-center justify-between">
              <div className="h-9 w-72 bg-gray-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-10 w-36 bg-gray-200 dark:bg-slate-700 rounded-xl" />
            </div>
            <div className="h-64 bg-gray-100 dark:bg-slate-800 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-950/40 rounded-xl">
              <Building2 className="w-7 h-7 text-green-600 dark:text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Unit Bank Sampah
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Daftar seluruh unit bank sampah yang terdaftar
              </p>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 
                     text-white font-medium rounded-xl shadow-sm transition-all 
                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 
                     dark:focus:ring-offset-slate-900"
          >
            <Plus className="w-5 h-5" />
            Tambah Unit
          </button>
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          {allData.length === 0 ? (
            <div className="py-20 px-6 text-center space-y-5">
              <Building2 className="w-16 h-16 mx-auto text-gray-300 dark:text-slate-600" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                  Belum ada unit bank sampah
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Mulai dengan menambahkan unit pertama
                </p>
              </div>
              <button
                onClick={handleAdd}
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 
                         text-white font-medium rounded-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                Tambah Unit Baru
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-16">
                      No
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Nama Unit
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Alamat
                    </th>
                    <th className="px-8 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-32">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {allData.map((item, index) => (
                    <tr
                      key={item.id_unit}
                      className="hover:bg-gray-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-8 py-5 text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-8 py-5 text-sm font-semibold text-gray-900 dark:text-white">
                        {item.nama_unit}
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-600 dark:text-gray-300">
                        {item.alamat_unit}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center justify-center p-2.5 rounded-lg 
                                   text-blue-600 hover:text-blue-700 hover:bg-blue-50/70 
                                   dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-slate-700/50 
                                   transition-all"
                          title="Edit unit ini"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
