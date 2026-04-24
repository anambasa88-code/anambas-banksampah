"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, User, MapPin, CreditCard, Users } from "lucide-react";

export default function EditNasabahModal({ isOpen, onClose, nasabah, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    alamat: "",
    desa: "",
    nik: "",
    jenis_kelamin: "",
  });

  useEffect(() => {
    if (nasabah && isOpen) {
      setFormData({
        nama_lengkap: nasabah.nama_lengkap || "",
        alamat: nasabah.alamat || "",
        desa: nasabah.desa || "",
        nik: nasabah.nik || "",
        jenis_kelamin: nasabah.jenis_kelamin === "LAKI_LAKI" ? "L" : 
                     nasabah.jenis_kelamin === "PEREMPUAN" ? "P" : "",
      });
    }
  }, [nasabah, isOpen]);

  const validateNIK = (nik) => {
    if (!nik || nik.trim() === "") return true; // Kosong diperbolehkan
    if (!/^\d+$/.test(nik)) return false; // Hanya angka
    if (nik.length !== 16) return false; // Harus 16 digit
    return true;
  };

  const isFormValid = () => {
    return formData.nama_lengkap.trim() !== "" && validateNIK(formData.nik);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nama_lengkap.trim()) {
      toast.error("Nama lengkap wajib diisi");
      return;
    }

    if (!validateNIK(formData.nik)) {
      toast.error("NIK harus 16 digit angka atau dikosongkan");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("bs_token");
      
      const res = await fetch(`/api/users/petugas/nasabah/${nasabah.id_user}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Sesi berakhir");
          localStorage.clear();
          window.location.href = "/login";
          return;
        }
        throw new Error(json.error || "Gagal memperbarui data nasabah");
      }

      toast.success("Data nasabah berhasil diperbarui");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen || !nasabah) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-800 dark:text-white">Edit Nasabah</p>
              <p className="text-[10px] text-slate-400">Ubah data nasabah</p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <User className="w-3.5 h-3.5" />
              Nama Lengkap
            </label>
            <input
              type="text"
              name="nama_lengkap"
              value={formData.nama_lengkap}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-[13px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>

          {/* NIK */}
          <div>
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <CreditCard className="w-3.5 h-3.5" />
              NIK (Opsional)
            </label>
            <input
              type="text"
              name="nik"
              value={formData.nik}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ''); // Hanya angka
                handleChange({ target: { name: 'nik', value } });
              }}
              className={`w-full px-3 py-2.5 text-[13px] bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                formData.nik && !validateNIK(formData.nik)
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500 focus:border-emerald-500'
              }`}
              placeholder="Masukkan 16 digit NIK"
              maxLength={16}
            />
            {formData.nik && !validateNIK(formData.nik) && (
              <p className="text-[10px] text-red-500 mt-1">
                {formData.nik.length !== 16 ? 'NIK harus 16 digit' : 'NIK hanya boleh angka'}
              </p>
            )}
          </div>

          {/* Jenis Kelamin */}
          <div>
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <Users className="w-3.5 h-3.5" />
              Jenis Kelamin
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="relative">
                <input
                  type="radio"
                  name="jenis_kelamin"
                  value="L"
                  checked={formData.jenis_kelamin === "L"}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <div className="px-3 py-2.5 text-[13px] border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer transition-all peer-checked:border-emerald-500 peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-900/20 peer-checked:text-emerald-700 dark:peer-checked:text-emerald-400 text-center">
                  Laki-laki
                </div>
              </label>
              <label className="relative">
                <input
                  type="radio"
                  name="jenis_kelamin"
                  value="P"
                  checked={formData.jenis_kelamin === "P"}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <div className="px-3 py-2.5 text-[13px] border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer transition-all peer-checked:border-emerald-500 peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-900/20 peer-checked:text-emerald-700 dark:peer-checked:text-emerald-400 text-center">
                  Perempuan
                </div>
              </label>
            </div>
          </div>

          {/* Desa */}
          <div>
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <MapPin className="w-3.5 h-3.5" />
              Desa
            </label>
            <input
              type="text"
              name="desa"
              value={formData.desa}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-[13px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              placeholder="Masukkan nama desa"
            />
          </div>

          {/* Alamat */}
          <div>
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <MapPin className="w-3.5 h-3.5" />
              Alamat Lengkap
            </label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2.5 text-[13px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
              placeholder="Masukkan alamat lengkap"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-[13px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className={`flex-1 px-4 py-2.5 text-[13px] font-semibold text-white rounded-xl transition-all shadow-lg ${
                isFormValid() 
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' 
                  : 'bg-slate-600 hover:bg-slate-600 cursor-not-allowed shadow-slate-600/20'
              } disabled:opacity-60`}
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
