"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Save, Loader2 } from "lucide-react";

const CATEGORIES = [
  { value: "PLASTIK", label: "Plastik" },
  { value: "LOGAM", label: "Logam" },
  { value: "KERTAS", label: "Kertas" },
  { value: "LAINNYA", label: "Lainnya" },
  { value: "CAMPURAN", label: "Campuran" }
];

export default function MasterSampahModal({ isOpen, onClose, editData }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_barang: "",
    kategori_utama: "PLASTIK",
    keterangan_pusat: "",
    harga_pusat: "",
    batas_bawah: "",
    batas_atas: ""
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        nama_barang: editData.nama_barang || "",
        kategori_utama: editData.kategori_utama || "PLASTIK",
        keterangan_pusat: editData.keterangan_pusat || "",
        harga_pusat: editData.harga_pusat?.toString() || "",
        batas_bawah: editData.batas_bawah?.toString() || "",
        batas_atas: editData.batas_atas?.toString() || ""
      });
    } else {
      setFormData({
        nama_barang: "",
        kategori_utama: "PLASTIK",
        keterangan_pusat: "",
        harga_pusat: "",
        batas_bawah: "",
        batas_atas: ""
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const hPusat = parseFloat(formData.harga_pusat);
    const bBawah = parseFloat(formData.batas_bawah);
    const bAtas = parseFloat(formData.batas_atas);

    if (!formData.nama_barang.trim()) {
      toast.error("Nama barang wajib diisi");
      return false;
    }
    if (!formData.kategori_utama) {
      toast.error("Kategori utama wajib dipilih");
      return false;
    }
    if (editData && formData.kategori_utama !== editData.kategori_utama) {
      toast.error("Kategori utama tidak boleh diubah saat mengedit");
      return false;
    }
    
    // Validasi nilai dasar
    if (!formData.harga_pusat || hPusat <= 0) {
      toast.error("Harga pusat harus lebih dari 0");
      return false;
    }
    if (!formData.batas_bawah || bBawah <= 0) {
      toast.error("Batas bawah harus lebih dari 0");
      return false;
    }
    if (!formData.batas_atas || bAtas <= 0) {
      toast.error("Batas atas harus lebih dari 0");
      return false;
    }

    // Validasi relasi antar harga
    if (bBawah === bAtas) {
      toast.error("Batas bawah dan batas atas tidak boleh sama nilainya");
      return false;
    }
    if (bBawah > bAtas) {
      toast.error("Batas bawah tidak boleh lebih besar dari batas atas");
      return false;
    }
    if (hPusat < bBawah || hPusat > bAtas) {
      toast.error(`Harga pusat harus berada di antara range Rp${bBawah.toLocaleString()} - Rp${bAtas.toLocaleString()}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("bs_token");
      const url = editData
        ? `/api/users/admin/master-sampah/${editData.id_barang}`
        : "/api/users/admin/master-sampah";
      const method = editData ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nama_barang: formData.nama_barang.trim(),
          kategori_utama: formData.kategori_utama,
          keterangan_pusat: formData.keterangan_pusat.trim(),
          harga_pusat: parseFloat(formData.harga_pusat),
          batas_bawah: parseFloat(formData.batas_bawah),
          batas_atas: parseFloat(formData.batas_atas)
        })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal menyimpan data");
      }

      toast.success(editData ? "Data berhasil diperbarui" : "Data berhasil ditambahkan");
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
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity">
      {/* Backdrop mobile fix */}
      <div className="absolute inset-0" onClick={() => !loading && onClose(false)}></div>
      
      <div className="relative bg-white dark:bg-slate-900 w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden transition-all transform animate-in slide-in-from-bottom-10 duration-300">
        
        {/* Header - Fixed at top */}
        <div className="shrink-0 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate max-w-[200px] sm:max-w-md">
              {editData ? "Edit Master Sampah" : "Tambah Master Sampah"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              {editData ? `ID: ${editData.id_barang}` : "Tambahkan data sampah baru"}
            </p>
          </div>
          <button
            onClick={() => onClose(false)}
            disabled={loading}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400 transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          {/* Nama Barang */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Nama Barang <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama_barang"
              value={formData.nama_barang}
              onChange={handleChange}
              placeholder="Contoh: Botol Plastik PET"
              maxLength={100}
              className="w-full px-4 py-3 sm:py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-base sm:text-sm"
              disabled={loading}
            />
          </div>

          {/* Kategori Utama */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Kategori Utama <span className="text-red-500">*</span>
            </label>

            {editData ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <input type="hidden" name="kategori_utama" value={formData.kategori_utama} />
                <div className="flex-1 px-4 py-3 sm:py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-700/50 text-gray-800 dark:text-white cursor-not-allowed text-base sm:text-sm font-medium">
                  {CATEGORIES.find((cat) => cat.value === formData.kategori_utama)?.label ||
                    formData.kategori_utama}
                </div>
                <span className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 font-medium italic">
                  * Kategori tidak dapat diubah
                </span>
              </div>
            ) : (
              <select
                name="kategori_utama"
                value={formData.kategori_utama}
                onChange={handleChange}
                className="w-full px-4 py-3 sm:py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-base sm:text-sm appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25em' }}
                disabled={loading}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Keterangan
            </label>
            <textarea
              name="keterangan_pusat"
              value={formData.keterangan_pusat}
              onChange={handleChange}
              placeholder="Tambahkan keterangan (opsional)"
              rows={3}
              className="w-full px-4 py-3 sm:py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none text-base sm:text-sm"
              disabled={loading}
            />
          </div>

          {/* Harga Grid - Stacked on Mobile, 3 Cols on Desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Harga Pusat (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="harga_pusat"
                value={formData.harga_pusat}
                onChange={handleChange}
                placeholder="5000"
                min="0"
                className="w-full px-4 py-3 sm:py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-base sm:text-sm"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Batas Bawah (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="batas_bawah"
                value={formData.batas_bawah}
                onChange={handleChange}
                placeholder="4000"
                min="0"
                className="w-full px-4 py-3 sm:py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-base sm:text-sm"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Batas Atas (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="batas_atas"
                value={formData.batas_atas}
                onChange={handleChange}
                placeholder="6000"
                min="0"
                className="w-full px-4 py-3 sm:py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-base sm:text-sm"
                disabled={loading}
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="p-3 sm:p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
              <span className="font-bold underline mr-1">Catatan:</span> 
              Batas harga digunakan sebagai validasi saat transaksi setoran agar harga tetap terkendali. Harga Pusat harus berada di antara Batas Bawah dan Batas Atas.
            </p>
          </div>
        </div>

        {/* Footer Buttons - Sticky at bottom */}
        <div className="shrink-0 p-4 sm:p-6 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={() => onClose(false)}
            disabled={loading}
            className="w-full sm:flex-1 px-4 py-3.5 sm:py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-white dark:hover:bg-slate-800 transition-all disabled:opacity-50 text-base sm:text-sm"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:flex-1 px-4 py-3.5 sm:py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-base sm:text-sm active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5 sm:w-4 sm:h-4" />
                <span>{editData ? "Perbarui" : "Simpan"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}