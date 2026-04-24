"use client";
import { X, User, Wallet, ClipboardList, Save, AlertTriangle, MessageSquare, } from "lucide-react";

export default function ConfirmSetorModal({
  isOpen,
  onClose,
  onConfirm,
  data,
  loading,
}) {
  if (!isOpen) return null;

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  const isTunai = data?.metode_bayar === "JUAL_LANGSUNG";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-xl">
              <ClipboardList className="w-4 h-4" />
            </div>
            <h3 className="text-[15px] font-semibold text-slate-800">
              Konfirmasi Setoran
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">

          {/* Info Nasabah & Metode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <User className="w-6 h-6 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-medium text-slate-500">Nasabah</p>
                <p className="text-[13px] font-semibold text-slate-800 mt-0.5">
                  {data?.nasabah_name}
                </p>
              </div>
            </div>
            <div
              className={`flex items-center gap-3 p-4 rounded-2xl border ${
                isTunai
                  ? "bg-orange-50 border-orange-200"
                  : "bg-emerald-50 border-emerald-200"
              }`}
            >
              {isTunai ? (
                <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0" />
              ) : (
                <Wallet className="w-6 h-6 text-emerald-500 flex-shrink-0" />
              )}
              <div>
                <p className={`text-[10px] font-medium ${isTunai ? "text-orange-500" : "text-emerald-600"}`}>
                  Metode Bayar
                </p>
                <p className={`text-[13px] font-semibold mt-0.5 ${isTunai ? "text-orange-700" : "text-emerald-700"}`}>
                  {isTunai ? "Jual Langsung (Tunai)" : "Tabung (Saldo)"}
                </p>
              </div>
            </div>
          </div>

          {/* Warning Tunai */}
          {isTunai && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-semibold text-red-700">
                  Perhatian: Pembayaran Tunai
                </p>
                <p className="text-[11px] text-red-600 font-normal leading-relaxed mt-0.5">
                  Saldo nasabah <span className="font-semibold">tidak akan bertambah</span> di aplikasi.
                </p>
              </div>
            </div>
          )}

          {/* Table Items */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[10px] font-medium text-slate-500">Item & Sumber</th>
                  <th className="px-4 py-2.5 text-center text-[10px] font-medium text-slate-500">Berat</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-medium text-slate-500">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data?.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-[12px] font-semibold text-slate-800 block">
                        {item.nama_barang}
                      </span>
                      <span
                        className={`text-[9px] w-fit px-1.5 py-0.5 rounded-md font-medium mt-1 inline-block ${
                          item.tipe_setoran === "OCEAN_DEBRIS"
                            ? "bg-blue-50 text-blue-500"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {item.tipe_setoran === "OCEAN_DEBRIS" ? "Ocean" : "Community"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-[12px] font-medium text-slate-600">
                      {item.berat} kg
                    </td>
                    <td className="px-4 py-3 text-right text-[12px] font-semibold text-emerald-600">
                      {formatRupiah(item.total_rp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Catatan */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <label className="text-[10px] font-medium text-slate-600">
                Catatan Transaksi
              </label>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[12px] text-slate-600 min-h-[46px] leading-relaxed">
              {data?.catatan_petugas || "Tidak ada catatan tambahan."}
            </div>
          </div>

          {/* Grand Total */}
          <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-[10px] font-medium text-emerald-600 mb-1">
                Total Terima
              </p>
              <p className="text-2xl font-bold text-emerald-600 tracking-tight">
                {formatRupiah(data?.total_rp)}
              </p>
            </div>
            <div className="bg-emerald-500 p-3 rounded-2xl shadow-md shadow-emerald-200">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-6 rounded-2xl border border-slate-200 text-[12px] font-medium text-slate-600 hover:bg-white hover:border-slate-300 transition-all"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 px-6 rounded-2xl text-[13px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Save className="w-4 h-4" /> Konfirmasi Setoran</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
