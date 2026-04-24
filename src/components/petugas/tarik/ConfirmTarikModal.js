import {
  X,
  AlertCircle,
  Wallet,
  User,
  ArrowDownRight,
  CheckCircle,
  FileText,
  TrendingDown,
} from "lucide-react";

export default function ConfirmTarikModal({
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

  const sisaSaldo = (data?.saldo_nasabah || 0) - (data?.jumlah_tarik || 0);
  const isSaldoCukup = sisaSaldo >= 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Konfirmasi Penarikan Dana
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Verifikasi detail transaksi sebelum memproses
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Informasi Nasabah */}
          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Informasi Nasabah
                </p>
              </div>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {data?.nasabah_name}
            </p>
          </div>

          {/* Detail Saldo - Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Saldo Saat Ini */}
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Saldo Saat Ini
                </p>
              </div>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                {formatRupiah(data?.saldo_nasabah || 0)}
              </p>
            </div>

            {/* Saldo Setelah Penarikan */}
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Sisa Saldo
                </p>
              </div>
              <p
                className={`text-base font-bold ${isSaldoCukup ? "text-gray-900 dark:text-white" : "text-red-600 dark:text-red-400"}`}
              >
                {formatRupiah(sisaSaldo)}
              </p>
            </div>
          </div>

          {/* Jumlah Penarikan - Highlighted */}
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-xl p-6 border-2 border-green-200 dark:border-green-800/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-600 dark:bg-green-700 rounded-lg flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Jumlah Penarikan
              </p>
            </div>
            <p className="text-3xl font-black text-green-700 dark:text-green-400">
              {formatRupiah(data?.jumlah_tarik || 0)}
            </p>
          </div>

          {/* Catatan (jika ada) */}
          {data?.catatan_tarik && (
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Catatan Transaksi
                </p>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {data.catatan_tarik}
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-slate-700"></div>

          {/* Warning Message - Kondisional */}
          {!isSaldoCukup ? (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-900 dark:text-red-300">
                    Saldo Tidak Mencukupi
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1 leading-relaxed">
                    Jumlah penarikan melebihi saldo yang tersedia. Transaksi
                    tidak dapat diproses.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-300">
                    Konfirmasi Serah Terima Dana
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                    Pastikan Anda telah menyerahkan uang tunai sebesar{" "}
                    <span className="font-bold">
                      {formatRupiah(data?.jumlah_tarik || 0)}
                    </span>{" "}
                    kepada nasabah sebelum mengkonfirmasi transaksi ini.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Indicator (jika saldo cukup) */}
          {isSaldoCukup && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-green-900 dark:text-green-300">
                    Transaksi Siap Diproses
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1 leading-relaxed">
                    Semua validasi terpenuhi. Klik tombol konfirmasi untuk
                    menyelesaikan transaksi.
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
              className="flex-1 px-5 py-3 rounded-xl border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={loading || !isSaldoCukup}
              className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold transition-all disabled:opacity-50 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg shadow-green-200 dark:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Konfirmasi Penarikan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
