"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Save, Loader2 } from "lucide-react";

export default function UnitBankSampahModal({ isOpen, onClose, editData }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_unit: "",
    alamat_unit: ""
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        nama_unit: editData.nama_unit || "",
        alamat_unit: editData.alamat_unit || ""
      });
    } else {
      setFormData({
        nama_unit: "",
        alamat_unit: ""
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Blokir perubahan nama_unit saat edit
    if (name === "nama_unit" && editData) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.nama_unit.trim()) {
      toast.error("Nama unit wajib diisi");
      return false;
    }
    if (!formData.alamat_unit.trim()) {
      toast.error("Alamat unit wajib diisi");
      return false;
    }
    // Extra safety: cegah nama unit berubah saat edit
    if (editData && formData.nama_unit !== editData.nama_unit) {
      toast.error("Nama unit tidak boleh diubah saat mengedit");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("bs_token");
      if (!token) throw new Error("Token tidak ditemukan, silakan login ulang");

      const url = editData
        ? `/api/users/admin/unit-bank-sampah/${editData.id_unit}`
        : "/api/users/admin/unit-bank-sampah";
      const method = editData ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nama_unit: formData.nama_unit.trim(),
          alamat_unit: formData.alamat_unit.trim()
        })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal menyimpan data unit");
      }

      toast.success(editData ? "Unit berhasil diperbarui" : "Unit berhasil ditambahkan");
      onClose(true); // true = refresh data setelah simpan
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md sm:max-w-lg shadow-2xl my-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
            {editData ? "Edit Unit Bank Sampah" : "Tambah Unit Bank Sampah"}
          </h2>
          <button
            onClick={() => onClose(false)}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Nama Unit - readonly saat edit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nama Unit <span className="text-red-500">*</span>
            </label>

            {editData ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <input type="hidden" name="nama_unit" value={formData.nama_unit} />
                <div className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white cursor-not-allowed text-sm sm:text-base">
                  {formData.nama_unit}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 italic whitespace-nowrap">
                  (Tidak dapat diubah)
                </span>
              </div>
            ) : (
              <input
                type="text"
                name="nama_unit"
                value={formData.nama_unit}
                onChange={handleChange}
                placeholder="Contoh: Bank Sampah Harapan Jaya"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                disabled={loading}
              />
            )}
          </div>

          {/* Alamat Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alamat Unit <span className="text-red-500">*</span>
            </label>
            <textarea
              name="alamat_unit"
              value={formData.alamat_unit}
              onChange={handleChange}
              placeholder="Jl. Raya Barat No. 45, Desa Sukamaju, Kec. Cikarang"
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
              disabled={loading}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => onClose(false)}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 order-2 sm:order-1"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editData ? "Perbarui" : "Simpan"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}