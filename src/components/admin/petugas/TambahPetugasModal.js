"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { X, User, CreditCard, Users, Building2 } from "lucide-react";

export default function TambahPetugasModal({ isOpen, onClose, editData = null }) {
  const [form, setForm] = useState({
    nama_lengkap: "",
    jenis_kelamin: "LAKI_LAKI",
    unit_id: "",
    nik: "",
  });
  const [units, setUnits] = useState([]);
  const [selectedUnitName, setSelectedUnitName] = useState("");
  const [loading, setLoading] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchUnits();
      if (editData) {
        setForm({
          nama_lengkap: editData.nama_lengkap || "",
          jenis_kelamin: editData.jenis_kelamin || "LAKI_LAKI",
          unit_id: editData.bank_sampah_id?.toString() || "",
          nik: editData.nik || "",
        });
        setSelectedUnitName(editData.unit?.nama_unit || "Tidak ada unit");
      } else {
        setForm({ nama_lengkap: "", jenis_kelamin: "LAKI_LAKI", unit_id: "", nik: "" });
        setSelectedUnitName("");
      }
    }
  }, [isOpen, editData]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose(false);
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

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
      } else {
        toast.error("Gagal memuat daftar unit");
      }
    } catch {
      toast.error("Gagal memuat daftar unit");
    }
  };

  const validateNIK = (nik) => {
    if (!nik || nik.trim() === "") return true; // kosong boleh
    if (!/^\d+$/.test(nik)) return false;
    if (nik.length !== 16) return false;
    return true;
  };

  const isFormValid = () => {
    if (!form.nama_lengkap.trim()) return false;
    if (!editData && !form.unit_id) return false;
    if (!validateNIK(form.nik)) return false;
    return true;
  };

  const handleNikChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setForm({ ...form, nik: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("bs_token");
      const method = editData ? "PUT" : "POST";
      const url = "/api/users/admin/daftar-petugas";
      const payload = editData ? { ...form, id_user: editData.id_user } : form;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal menyimpan data");
      }

      toast.success(editData ? "Petugas berhasil diupdate" : "Petugas berhasil ditambahkan");
      onClose(true);
    } catch (err) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => onClose(false)} />

      <div
        ref={modalRef}
        className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-800 dark:text-white">
                {editData ? "Edit Petugas" : "Tambah Petugas Baru"}
              </p>
              <p className="text-[10px] text-slate-400">
                {editData ? "Ubah data petugas" : "Isi data petugas baru"}
              </p>
            </div>
          </div>
          <button
            onClick={() => onClose(false)}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Nama Lengkap */}
          <div>
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <User className="w-3.5 h-3.5" />
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.nama_lengkap}
              onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
              className="w-full px-3 py-2.5 text-[13px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              placeholder="Masukkan nama lengkap"
              required
            />
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
                  value="LAKI_LAKI"
                  checked={form.jenis_kelamin === "LAKI_LAKI"}
                  onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })}
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
                  value="PEREMPUAN"
                  checked={form.jenis_kelamin === "PEREMPUAN"}
                  onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })}
                  className="peer sr-only"
                />
                <div className="px-3 py-2.5 text-[13px] border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer transition-all peer-checked:border-emerald-500 peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-900/20 peer-checked:text-emerald-700 dark:peer-checked:text-emerald-400 text-center">
                  Perempuan
                </div>
              </label>
            </div>
          </div>

          {/* Unit Bank Sampah */}
          <div>
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <Building2 className="w-3.5 h-3.5" />
              Unit Bank Sampah <span className="text-red-500">*</span>
            </label>
            {editData ? (
              <input
                type="text"
                value={selectedUnitName}
                disabled
                readOnly
                className="w-full px-3 py-2.5 text-[13px] bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            ) : (
              <select
                value={form.unit_id}
                onChange={(e) => setForm({ ...form, unit_id: e.target.value })}
                className="w-full px-3 py-2.5 text-[13px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                required
              >
                <option value="">Pilih Unit</option>
                {units.map((u) => (
                  <option key={u.id_unit || u.id} value={u.id_unit || u.id}>
                    {u.nama_unit}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* NIK */}
          <div>
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <CreditCard className="w-3.5 h-3.5" />
              NIK (Opsional)
            </label>
            <input
              type="text"
              value={form.nik}
              onChange={handleNikChange}
              maxLength={16}
              placeholder="Masukkan 16 digit NIK"
              className={`w-full px-3 py-2.5 text-[13px] bg-white dark:bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                form.nik && !validateNIK(form.nik)
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-200 dark:border-slate-700 focus:ring-emerald-500 focus:border-emerald-500"
              }`}
            />
            {form.nik && !validateNIK(form.nik) && (
              <p className="text-[10px] text-red-500 mt-1">NIK harus tepat 16 digit</p>
            )}
            {form.nik && form.nik.length > 0 && validateNIK(form.nik) && (
              <p className="text-[10px] text-emerald-500 mt-1">NIK valid ✓</p>
            )}
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
              type="submit"
              disabled={loading || !isFormValid()}
              className={`flex-1 px-4 py-2.5 text-[13px] font-semibold text-white rounded-xl transition-all shadow-lg ${
                isFormValid()
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                  : "bg-slate-400 dark:bg-slate-600 cursor-not-allowed shadow-none"
              } disabled:opacity-60`}
            >
              {loading ? "Menyimpan..." : editData ? "Update" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}