"use client";
import { X, Plus } from "lucide-react";

const formatRp = (num) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);

export default function ItemDetailSheet({
  barang,
  tempItem,
  onTempItemChange,
  onAddToCart,
  onClose,
}) {
  if (!barang) return null;

  const { tipe_harga, harga_manual, berat, tipe_setoran } = tempItem;

  const getHargaPreview = () => {
    if (tipe_harga === "SISTEM") return Number(barang.harga_aktif);
    if (tipe_harga === "LOKAL")
      return barang.harga_lokal ? Number(barang.harga_lokal) : 0;
    return Number(harga_manual) || 0;
  };

  const previewTotal = getHargaPreview() * (Number(berat) || 0);

  const PRICE_OPTIONS = [
    { key: "SISTEM", label: "Sistem", value: formatRp(barang.harga_aktif), available: true },
    {
      key: "LOKAL",
      label: "Lokal",
      value: barang.harga_lokal ? formatRp(barang.harga_lokal) : "Belum ada",
      available: !!barang.harga_lokal,
    },
    { key: "CUSTOM", label: "Custom", value: "Atur manual", available: true },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-center pt-3">
          <div className="w-8 h-1 bg-slate-200 rounded-full" />
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[85vh] overflow-y-auto">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-medium text-emerald-500">
                Tambah ke keranjang
              </p>
              <h3 className="text-[15px] font-semibold text-slate-800 mt-0.5">
                {barang.nama_barang}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X size={15} className="text-slate-500" />
            </button>
          </div>

          {/* Tipe Harga */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-slate-600">
              Tipe Harga
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRICE_OPTIONS.map(({ key, label, value, available }) => (
                <button
                  key={key}
                  disabled={!available}
                  onClick={() => onTempItemChange({ tipe_harga: key, harga_manual: "" })}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${
                    !available
                      ? "opacity-40 cursor-not-allowed border-slate-100 bg-slate-50"
                      : tipe_harga === key
                      ? "border-emerald-400 bg-emerald-50 shadow-sm"
                      : "border-slate-100 bg-white hover:border-emerald-200"
                  }`}
                >
                  <span className={`text-[10px] font-medium ${tipe_harga === key ? "text-emerald-600" : "text-slate-500"}`}>
                    {label}
                  </span>
                  <span className={`text-[11px] font-semibold ${tipe_harga === key ? "text-emerald-700" : "text-slate-700"}`}>
                    {value}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Harga */}
          {tipe_harga === "CUSTOM" && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-medium text-slate-600">
                  Harga Manual
                </label>
                <span className="text-[10px] font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {formatRp(barang.batas_bawah)} – {formatRp(barang.batas_atas)}
                </span>
              </div>
              <input
                type="number"
                value={harga_manual}
                onChange={(e) => onTempItemChange({ harga_manual: e.target.value })}
                className="w-full bg-white border-2 border-emerald-100 rounded-2xl px-4 py-3 text-[13px] font-medium text-slate-800 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400"
                placeholder="Masukkan harga..."
              />
            </div>
          )}

          {/* Berat & Sumber */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-slate-600">
                Berat (kg)
              </label>
              <input
                type="number"
                step="0.01"
                value={berat}
                onChange={(e) => onTempItemChange({ berat: e.target.value })}
                className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3 text-[13px] font-medium text-slate-800 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-slate-600">
                Sumber
              </label>
              <div className="flex gap-2 h-[50px]">
                {[
                  { key: "COMMUNITY", label: "Community", color: "emerald" },
                  { key: "OCEAN_DEBRIS", label: "Ocean", color: "blue" },
                ].map(({ key, label, color }) => (
                  <button
                    key={key}
                    onClick={() => onTempItemChange({ tipe_setoran: key })}
                    className={`flex-1 rounded-2xl text-[11px] font-medium border-2 transition-all ${
                      tipe_setoran === key
                        ? color === "emerald"
                          ? "bg-emerald-50 border-emerald-400 text-emerald-600"
                          : "bg-blue-50 border-blue-400 text-blue-600"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Total */}
          {Number(berat) > 0 && getHargaPreview() > 0 && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center animate-in fade-in">
              <div>
                <p className="text-[10px] font-medium text-emerald-600">
                  Preview total
                </p>
                <p className="text-lg font-bold text-emerald-600 tracking-tight">
                  {formatRp(previewTotal)}
                </p>
              </div>
              <p className="text-[11px] text-emerald-600 font-normal">
                {berat} kg × {formatRp(getHargaPreview())}
              </p>
            </div>
          )}

          {/* Add Button */}
          <button
            onClick={onAddToCart}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-2xl text-[13px] font-semibold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mb-2"
          >
            <Plus size={14} />
            Masuk Keranjang
          </button>
        </div>
      </div>
    </>
  );
}
