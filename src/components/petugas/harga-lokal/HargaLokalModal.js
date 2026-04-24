"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Save, Loader2 } from "lucide-react";

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
      onClose(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-[15px] font-semibold text-slate-800">Set Harga Lokal</h2>
          <button
            onClick={() => onClose(false)}
            className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* Nama Barang */}
          <div>
            <label className="block text-[10px] font-medium text-slate-600 mb-1">Nama Barang</label>
            <p className="text-[14px] font-semibold text-slate-800">{barang?.nama_barang}</p>
          </div>

          {/* Batas Harga */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <div>
              <span className="block text-[10px] font-medium text-blue-500 mb-0.5">Batas Bawah</span>
              <span className="text-[13px] font-semibold text-slate-700">
                Rp{barang?.batas_bawah.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-medium text-blue-500 mb-0.5">Batas Atas</span>
              <span className="text-[13px] font-semibold text-slate-700">
                Rp{barang?.batas_atas.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Input Harga */}
          <div>
            <label className="block text-[10px] font-medium text-slate-600 mb-1.5">
              Harga Beli Unit (Rp)
            </label>
            <input
              type="number"
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 bg-white text-lg font-semibold text-emerald-700 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
              placeholder="Masukkan harga..."
              autoFocus
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={() => onClose(false)}
            className="flex-1 py-3 text-[12px] font-medium text-slate-600 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-2xl transition-all"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><Save className="w-4 h-4" /> Simpan</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
