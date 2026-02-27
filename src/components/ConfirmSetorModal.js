"use client";
import {
  X,
  User,
  Wallet,
  ClipboardList,
  Save,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";

export default function ConfirmSetorModal({
  isOpen,
  onClose,
  onConfirm,
  data,
  loading,
}) {
  if (!isOpen) return null;

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Mencocokkan dengan Enum Prisma: JUAL_LANGSUNG
  const isTunai = data?.metode_bayar === "JUAL_LANGSUNG";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase tracking-tighter">
              Konfirmasi Setoran
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
          {/* Info Nasabah & Metode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100">
              <User className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">
                  Nasabah
                </p>
                <p className="font-black text-gray-800 dark:text-white">
                  {data?.nasabah_name}
                </p>
              </div>
            </div>
            <div
              className={`flex items-center gap-3 p-4 rounded-2xl border ${
                isTunai
                  ? "bg-orange-50 border-orange-200 text-orange-700"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}
            >
              {isTunai ? (
                <AlertTriangle className="w-8 h-8" />
              ) : (
                <Wallet className="w-8 h-8" />
              )}
              <div>
                <p className="text-[10px] font-black uppercase opacity-70">
                  Metode Bayar
                </p>
                <p className="font-black italic">
                  {isTunai ? "JUAL LANGSUNG (TUNAI)" : "TABUNG (SALDO)"}
                </p>
              </div>
            </div>
          </div>

          {/* Warning untuk Jual Langsung */}
          {isTunai && (
            <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
              <div>
                <p className="text-sm font-black text-red-700 uppercase italic">
                  Peringatan Tunai!
                </p>
                <p className="text-xs text-red-600 font-bold leading-relaxed">
                  Saldo nasabah{" "}
                  <span className="underline font-black">TIDAK</span> akan
                  bertambah di aplikasi.
                </p>
              </div>
            </div>
          )}

          {/* Table Items dengan Tipe Setoran */}
          <div className="border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/50 text-[10px] font-black text-gray-400 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Item & Sumber</th>
                  <th className="px-4 py-3 text-center">Berat</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {data?.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700 dark:text-gray-200 uppercase text-[11px]">
                          {item.nama_barang}
                        </span>
                        <span
                          className={`text-[8px] w-fit px-1.5 py-0.5 rounded font-black uppercase mt-1 ${
                            item.tipe_setoran === "OCEAN_DEBRIS"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          {item.tipe_setoran === "OCEAN_DEBRIS"
                            ? " Ocean"
                            : " Community"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-black text-gray-500">
                      {item.berat} kg
                    </td>
                    <td className="px-4 py-3 text-right font-black text-emerald-600">
                      {formatRupiah(item.total_rp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Catatan */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 ml-1">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Catatan Transaksi
              </label>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 text-xs italic text-gray-500 min-h-[50px]">
              {data?.catatan_petugas || "Tidak ada catatan tambahan."}
            </div>
          </div>

          {/* Grand Total */}
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex justify-between items-center shadow-sm">
            <div>
              <p className="text-[10px] font-black text-emerald-800/60 uppercase tracking-[0.2em] mb-1">
                Total Terima 
              </p>
              <p className="text-3xl font-black text-emerald-600 tracking-tighter">
                {formatRupiah(data?.total_rp)}
              </p>
            </div>

            <div className="bg-emerald-600 p-3.5 rounded-2xl shadow-md shadow-emerald-200">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 flex gap-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-4 px-6 rounded-2xl border-2 border-slate-200 font-black text-gray-400 hover:bg-white transition-all uppercase text-[11px]"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-4 px-6 rounded-2xl font-black text-white shadow-lg transition-all flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 uppercase text-[11px] tracking-widest"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" /> Konfirmasi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
