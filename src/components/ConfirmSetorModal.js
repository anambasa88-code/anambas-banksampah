"use client";
import {
  X,
  AlertCircle,
  Package,
  User,
  Scale,
  DollarSign,
  Wallet,
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

  const getTipeHargaLabel = (tipe) => {
    switch (tipe) {
      case "SISTEM":
        return "Harga Sistem";
      case "LOKAL":
        return "Harga Lokal";
      case "CUSTOM":
        return "Harga Custom";
      default:
        return tipe;
    }
  };

  const getMetodeBayarLabel = (metode) => {
    return metode === "TABUNG"
      ? "Tabung (Masuk Saldo)"
      : "Jual Langsung (Cash)";
  };

  const getTipeSetoranLabel = (tipe) => {
    return tipe === "COMMUNITY" ? "Community" : "Ocean Debris";
  };

  return (
    
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                Konfirmasi Setoran
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Periksa kembali data sebelum menyimpan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Nasabah */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                  Nasabah
                </p>
                <p className="text-sm font-bold text-gray-800 dark:text-white">
                  {data?.nasabah_name}
                </p>
              </div>
            </div>
          </div>

          {/* Jenis Sampah */}
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                  Jenis Sampah
                </p>
                <p className="text-sm font-bold text-gray-800 dark:text-white">
                  {data?.barang_name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Kategori: {data?.kategori_utama}
                </p>
              </div>
            </div>
          </div>

          {/* Berat & Harga */}
          <div className="grid grid-cols-2 gap-4">
            {/* Berat */}
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-2">
                <Scale className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">
                    Berat
                  </p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">
                    {data?.berat} kg
                  </p>
                </div>
              </div>
            </div>

            {/* Harga */}
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-1">
                    {getTipeHargaLabel(data?.tipe_harga)}
                  </p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white">
                    {formatRupiah(data?.harga_per_kg)}/kg
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Total & Metode */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800">
            <div className="space-y-3">
              {/* Total Rupiah */}
              <div>
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">
                  Total Nilai Setoran
                </p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatRupiah(data?.total_rp)}
                </p>
              </div>

              {/* Metode Bayar */}
              <div className="pt-3 border-t border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div className="flex-1">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Metode Pembayaran
                    </p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {getMetodeBayarLabel(data?.metode_bayar)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tipe Setoran */}
              <div className="pt-3 border-t border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div className="flex-1">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      Tipe Setoran
                    </p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">
                      {getTipeSetoranLabel(data?.tipe_setoran)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Catatan */}
          {data?.catatan && (
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Catatan Petugas
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {data.catatan}
              </p>
            </div>
          )}

          {/* Warning jika JUAL_LANGSUNG */}
          {data?.metode_bayar === "JUAL_LANGSUNG" && (
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    Perhatian!
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                    Uang tidak akan masuk ke tabungan nasabah. Pastikan
                    pembayaran cash sudah diterima.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 p-6">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  Konfirmasi Setor
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
