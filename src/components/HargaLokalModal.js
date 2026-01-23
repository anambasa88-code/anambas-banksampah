"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Save, Loader2, AlertCircle } from "lucide-react";

export default function HargaLokalModal({ isOpen, onClose, barang, currentLokal }) {
  const [loading, setLoading] = useState(false);
  const [harga, setHarga] = useState("");

  useEffect(() => {
    if (barang) {
      setHarga(currentLokal || barang.harga_pusat || "");
    }
  }, [barang, currentLokal]);

  const handleSubmit = async () => {
    const hargaNum = parseFloat(harga);

    if (hargaNum < barang.batas_bawah || hargaNum > barang.batas_atas) {
      toast.error(`Harga harus antara Rp${barang.batas_bawah.toLocaleString()} - Rp${barang.batas_atas.toLocaleString()}`);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("bs_token");
      const res = await fetch("/api/users/petugas/harga-lokal", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ barangId: barang.id_barang, hargaLokal: hargaNum }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan harga");

      toast.success("Harga lokal berhasil diperbarui!");
      onClose(true); // Tutup dan refresh data
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="font-bold text-lg text-gray-800 dark:text-white">Set Harga Lokal</h2>
          <button onClick={() => onClose(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Nama Barang</label>
            <p className="font-semibold text-gray-800 dark:text-white">{barang?.nama_barang}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <div>
              <span className="block text-[10px] uppercase font-bold text-blue-600">Batas Bawah</span>
              <span className="text-sm font-black text-gray-700 dark:text-blue-200">Rp{barang?.batas_bawah.toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-blue-600">Batas Atas</span>
              <span className="text-sm font-black text-gray-700 dark:text-blue-200">Rp{barang?.batas_atas.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Harga Beli Unit (Rp)</label>
            <input
              type="number"
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xl font-black text-green-600 outline-none focus:border-green-500 transition-all"
              placeholder="Masukkan harga..."
              autoFocus
            />
          </div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-slate-800/50 flex gap-3">
          <button onClick={() => onClose(false)} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all">Batal</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}