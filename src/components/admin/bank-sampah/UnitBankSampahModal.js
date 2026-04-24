"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, MapPin, Building2, Save, Loader2 } from "lucide-react";

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
      setFormData({ nama_unit: "", alamat_unit: "" });
    }
  }, [editData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "nama_unit" && editData) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    return formData.nama_unit.trim() !== "" && formData.alamat_unit.trim() !== "";
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
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan data unit");

      toast.success(editData ? "Unit berhasil diperbarui" : "Unit berhasil ditambahkan");
      onClose(true);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !loading && onClose(false)} />

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-800 dark:text-white">
                {editData ? "Edit Unit Bank Sampah" : "Tambah Unit Bank Sampah"}
              </p>
              <p className="text-[10px] text-slate-400">
                {editData ? "Ubah data unit" : "Isi data unit baru"}
              </p>
            </div>
          </div>
          <button
            onClick={() => !loading && onClose(false)}
            disabled={loading}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-4">
          {/* Nama Unit */}
          <div>
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <Building2 className="w-3.5 h-3.5" />
              Nama Unit <span className="text-red-500">*</span>
            </label>
            {editData ? (
              <div className="relative">
                <input
                  type="text"
                  value={formData.nama_unit}
                  readOnly
                  disabled
                  className="w-full px-3 py-2.5 text-[13px] bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 italic">
                  Tidak dapat diubah
                </span>
              </div>
            ) : (
              <input
                type="text"
                name="nama_unit"
                value={formData.nama_unit}
                onChange={handleChange}
                placeholder="Contoh: Bank Sampah Harapan Jaya"
                disabled={loading}
                className="w-full px-3 py-2.5 text-[13px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all disabled:opacity-60"
              />
            )}
          </div>

          {/* Alamat Unit */}
          <div>
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <MapPin className="w-3.5 h-3.5" />
              Alamat Unit <span className="text-red-500">*</span>
            </label>
            <textarea
              name="alamat_unit"
              value={formData.alamat_unit}
              onChange={handleChange}
              placeholder="Jl. Raya Barat No. 45, Desa Sukamaju, Kec. Cikarang"
              rows={3}
              disabled={loading}
              className="w-full px-3 py-2.5 text-[13px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none disabled:opacity-60"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => onClose(false)}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-[13px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !isFormValid()}
              className={`flex-1 px-4 py-2.5 text-[13px] font-semibold text-white rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 ${
                isFormValid()
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                  : "bg-slate-400 dark:bg-slate-600 cursor-not-allowed shadow-none"
              } disabled:opacity-60`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
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