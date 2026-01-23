"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

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
    } catch (err) {
      toast.error("Gagal memuat daftar unit");
    }
  };

  const handleNikChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // hanya angka
    setForm({ ...form, nik: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nama_lengkap.trim()) return toast.error("Nama lengkap wajib diisi");
    if (!editData && !form.unit_id) return toast.error("Unit harus dipilih");

    if (form.nik && form.nik.length !== 16) {
      return toast.error("NIK harus tepat 16 digit");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("bs_token");
      const method = editData ? "PUT" : "POST";
      const url = "/api/users/admin/daftar-petugas";

      // Payload sesuai backend (enum LAKI_LAKI / PEREMPUAN sudah dipetakan di backend)
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
      onClose(true); // trigger refresh di parent
    } catch (err) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div
        ref={modalRef}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl"
      >
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {editData ? "Edit Petugas" : "Tambah Petugas Baru"}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nama Lengkap */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.nama_lengkap}
              onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>

          {/* Jenis Kelamin */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Jenis Kelamin
            </label>
            <select
              value={form.jenis_kelamin}
              onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="LAKI_LAKI">Laki-laki</option>
              <option value="PEREMPUAN">Perempuan</option>
            </select>
          </div>

          {/* Unit Bank Sampah */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Unit Bank Sampah <span className="text-red-500">*</span>
            </label>
            {editData ? (
              <input
                type="text"
                value={selectedUnitName}
                disabled
                readOnly
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
              />
            ) : (
              <select
                value={form.unit_id}
                onChange={(e) => setForm({ ...form, unit_id: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
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
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              NIK (opsional, tepat 16 digit)
            </label>
            <input
              type="text"
              value={form.nik}
              onChange={handleNikChange}
              maxLength={16}
              placeholder="Masukkan 16 digit NIK"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-green-500 outline-none"
            />
            {form.nik && form.nik.length > 0 && form.nik.length !== 16 && (
              <p className="mt-1 text-xs text-red-600">NIK harus tepat 16 digit</p>
            )}
          </div>

          {/* Tombol */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => onClose(false)}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-medium"
            >
              {loading ? "Menyimpan..." : editData ? "Update" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}