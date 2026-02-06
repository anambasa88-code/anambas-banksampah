"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

export default function TambahNasabahModal({ isOpen, onClose }) {
  const [form, setForm] = useState({
    nama_lengkap: "",
    jenis_kelamin: "LAKI_LAKI",
    nik: "",
    desa: "",
    alamat: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen)
      setForm({
        nama_lengkap: "",
        jenis_kelamin: "LAKI_LAKI",
        nik: "",
        desa: "",
        alamat: "",
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi Detail
    if (!form.nama_lengkap.trim())
      return toast.error("Nama lengkap wajib diisi");

    // Validasi NIK harus tepat 16 digit jika diisi
    if (form.nik && form.nik.length !== 16) {
      return toast.error("NIK harus berjumlah tepat 16 digit");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("bs_token");
      const res = await fetch("/api/users/petugas/daftar-nasabah", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, peran: "NASABAH" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan data");

      toast.success("Nasabah berhasil didaftarkan");
      onClose(true);
    } catch (err) {
      toast.error(err.message); // Menampilkan pesan "NIK sudah terdaftar..." dari userService
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Tambah Nasabah Baru
          </h2>
          <button
            onClick={() => onClose(false)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 outline-none focus:ring-2 focus:ring-green-500"
              value={form.nama_lengkap}
              onChange={(e) =>
                setForm({ ...form, nama_lengkap: e.target.value })
              }
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Jenis Kelamin
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 outline-none focus:ring-2 focus:ring-green-500"
              value={form.jenis_kelamin}
              onChange={(e) =>
                setForm({ ...form, jenis_kelamin: e.target.value })
              }
            >
              <option value="LAKI_LAKI">Laki-laki</option>
              <option value="PEREMPUAN">Perempuan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              NIK (16 Digit)
            </label>
            <input
              type="text"
              maxLength={16}
              placeholder="Contoh: 3201xxxxxxxxxxxx"
              className={`w-full px-4 py-2 border rounded-lg dark:bg-slate-800 outline-none focus:ring-2 focus:ring-green-500 ${
                form.nik && form.nik.length !== 16
                  ? "border-red-500"
                  : "border-gray-300 dark:border-slate-600"
              }`}
              value={form.nik}
              onChange={(e) =>
                setForm({ ...form, nik: e.target.value.replace(/\D/g, "") })
              }
            />
            {form.nik && form.nik.length > 0 && form.nik.length !== 16 && (
              <p className="mt-1 text-xs text-red-500">
                NIK harus tepat 16 digit (Saat ini: {form.nik.length})
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Desa
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 outline-none focus:ring-2 focus:ring-green-500"
              value={form.desa}
              onChange={(e) => setForm({ ...form, desa: e.target.value })}
              placeholder="Contoh: Desa Makmur"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Alamat
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 outline-none focus:ring-2 focus:ring-green-500"
              value={form.alamat}
              onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              placeholder="Contoh: Jl. Merdeka No. 123"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Mendaftarkan..." : "Daftarkan Nasabah"}
            </button>
            <p className="text-center text-[10px] text-gray-500 mt-3">
              PIN default nasabah adalah <strong>123456</strong>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
