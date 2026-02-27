"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import ConfirmTarikModal from "@/components/ConfirmTarikModal";
import {
  User,
  ArrowLeft,
  Wallet,
  ArrowDownCircle,
  FileText,
  AlertCircle,
  CheckCircle,
  CreditCard,
  TrendingDown,
  Info,
} from "lucide-react";

export default function TarikNasabahPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [nasabah, setNasabah] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [formData, setFormData] = useState({
    jumlah_tarik: 0,
    catatan_tarik: "",
  });
  const [displayJumlah, setDisplayJumlah] = useState("");

  useEffect(() => {
    if (id) {
      fetchNasabahDetail();
    }
  }, [id]);

  const fetchNasabahDetail = async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem("bs_token");
      const res = await fetch(`/api/users/petugas/detail-nasabah/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      const dataNasabah = result.nasabah;

      if (!dataNasabah) {
        throw new Error("Data nasabah tidak ditemukan di dalam response");
      }

      setNasabah({
        id_user: dataNasabah.id_user,
        nama: dataNasabah.nama_lengkap || dataNasabah.nickname || "Tanpa Nama",
        nik: dataNasabah.nik || "-",
        saldo: Number(dataNasabah.total_saldo || 0),
      });
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error(err.message);
    } finally {
      setLoadingData(false);
    }
  };

  const handleJumlahChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    const numericVal = parseInt(val) || 0;

    setDisplayJumlah(val ? new Intl.NumberFormat("id-ID").format(val) : "");
    setFormData((prev) => ({ ...prev, jumlah_tarik: numericVal }));
  };

  const handleSubmit = () => {
    const currentSaldo = Number(nasabah?.saldo || 0);

    if (formData.jumlah_tarik <= 0) {
      return toast.error("Masukkan jumlah penarikan yang valid");
    }

    if (formData.jumlah_tarik > currentSaldo) {
      return toast.error(
        `Saldo tidak mencukupi! Maksimal: Rp ${new Intl.NumberFormat("id-ID").format(currentSaldo)}`,
      );
    }

    setConfirmData({
      nasabah_name: nasabah.nama,
      saldo_nasabah: nasabah.saldo,
      jumlah_tarik: formData.jumlah_tarik,
      catatan_tarik: formData.catatan_tarik,
    });
    setShowConfirmModal(true);
  };

  const submitTarik = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bs_token");

      const res = await fetch("/api/transaksi/tarik", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nasabah_id: parseInt(id),
          jumlah_tarik: formData.jumlah_tarik,
          catatan_tarik: formData.catatan_tarik,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal memproses transaksi");

      toast.success("Penarikan berhasil dilakukan!");
      setShowConfirmModal(false);

      setFormData({ jumlah_tarik: 0, catatan_tarik: "" });
      setDisplayJumlah("");

      fetchNasabahDetail();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-200 dark:border-green-900 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-gray-700 dark:text-gray-300 font-semibold">
              Memuat Data Nasabah
            </p>
            <p className="text-sm text-gray-500 animate-pulse">
              Mohon tunggu sebentar...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!nasabah) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-red-600 dark:text-red-400 font-bold text-lg">
              Data Nasabah Tidak Ditemukan
            </p>
            <p className="text-gray-500 text-sm">
              Nasabah yang Anda cari tidak tersedia dalam sistem
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Kembali
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const saldoSetelahTarik = nasabah.saldo - formData.jumlah_tarik;
  const isValidAmount =
    formData.jumlah_tarik > 0 && formData.jumlah_tarik <= nasabah.saldo;

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Kembali ke Daftar</span>
            <span className="sm:hidden">Kembali</span>
          </button>

          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <TrendingDown
              size={18}
              className="text-green-600 dark:text-green-400"
            />
            <span className="text-sm font-semibold text-green-700 dark:text-green-300">
              Transaksi Penarikan
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Section - Informasi Nasabah */}
          <div className="md:col-span-1 space-y-4">
            {/* Card Identitas Nasabah */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 p-6 rounded-2xl shadow-lg text-white space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <User size={28} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-green-100">
                    Informasi Nasabah
                  </p>
                  <p className="text-sm font-bold mt-0.5">Data Pelanggan</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <p className="text-xs text-green-100 mb-1">Nama Lengkap</p>
                  <p className="font-bold text-base">{nasabah.nama}</p>
                </div>
                <div>
                  <p className="text-xs text-green-100 mb-1">Nomor NIK</p>
                  <p className="font-semibold text-sm font-mono">
                    {nasabah.nik}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Saldo Saat Ini */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-gray-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Wallet
                    size={20}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Saldo Tersedia
                  </p>
                  <p className="text-xs text-gray-400">Saat Ini</p>
                </div>
              </div>
              <p className="text-2xl font-black text-gray-800 dark:text-white">
                Rp {new Intl.NumberFormat("id-ID").format(nasabah.saldo)}
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
              <div className="flex gap-3">
                <Info
                  size={20}
                  className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-300">
                    Informasi Penting
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                    Pastikan jumlah penarikan tidak melebihi saldo tersedia.
                    Transaksi akan dicatat secara otomatis.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Form Penarikan */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border-2 border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
              {/* Header Form */}
              <div className="pb-4 border-b border-gray-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <ArrowDownCircle
                      size={24}
                      className="text-green-600 dark:text-green-400"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      Form Penarikan Dana
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Masukkan detail transaksi penarikan
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Input */}
              <div className="space-y-5">
                {/* Input Jumlah Penarikan */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    <CreditCard
                      size={18}
                      className="text-green-600 dark:text-green-400"
                    />
                    Jumlah Penarikan
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-lg">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={displayJumlah}
                      onChange={handleJumlahChange}
                      className="w-full pl-14 pr-5 py-4 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900/30 outline-none transition-all font-bold text-xl text-gray-800 dark:text-white"
                      placeholder="0"
                    />
                  </div>

                  {/* Warning jika melebihi saldo */}
                  {formData.jumlah_tarik > nasabah.saldo && (
                    <div className="flex items-start gap-2 mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <AlertCircle
                        size={18}
                        className="text-red-500 flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                          Jumlah Melebihi Saldo
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
                          Saldo tersedia: Rp{" "}
                          {new Intl.NumberFormat("id-ID").format(nasabah.saldo)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Success indicator jika valid */}
                  {isValidAmount && (
                    <div className="flex items-start gap-2 mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <CheckCircle
                        size={18}
                        className="text-green-500 flex-shrink-0 mt-0.5"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                          Jumlah Valid
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                          Saldo setelah penarikan: Rp{" "}
                          {new Intl.NumberFormat("id-ID").format(
                            saldoSetelahTarik,
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Catatan */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    <FileText
                      size={18}
                      className="text-green-600 dark:text-green-400"
                    />
                    Catatan Transaksi
                    <span className="text-xs font-normal text-gray-400">
                      (Opsional)
                    </span>
                  </label>
                  <textarea
                    value={formData.catatan_tarik}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        catatan_tarik: e.target.value,
                      }))
                    }
                    className="w-full p-4 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900/30 outline-none transition-all text-gray-700 dark:text-gray-300"
                    rows={3}
                    placeholder="Contoh: Penarikan untuk keperluan pribadi, biaya sekolah, dll."
                  />
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <Info size={14} />
                    Catatan akan tersimpan dalam riwayat transaksi
                  </p>
                </div>

                {/* Summary Box */}
                {formData.jumlah_tarik > 0 && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800/50 p-5 rounded-xl border border-gray-200 dark:border-slate-700">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
                      Ringkasan Transaksi
                    </p>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Jumlah Penarikan
                        </span>
                        <span className="font-bold text-gray-800 dark:text-white">
                          Rp{" "}
                          {new Intl.NumberFormat("id-ID").format(
                            formData.jumlah_tarik,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Saldo Saat Ini
                        </span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          Rp{" "}
                          {new Intl.NumberFormat("id-ID").format(nasabah.saldo)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-300 dark:border-slate-600">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Saldo Setelah Penarikan
                          </span>
                          <span
                            className={`font-bold text-lg ${saldoSetelahTarik >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                          >
                            Rp{" "}
                            {new Intl.NumberFormat("id-ID").format(
                              Math.max(0, saldoSetelahTarik),
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !isValidAmount}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-800 text-white font-bold rounded-xl transition-all disabled:cursor-not-allowed shadow-lg shadow-green-200 dark:shadow-none hover:shadow-xl hover:shadow-green-300 dark:hover:shadow-none disabled:shadow-none flex items-center justify-center gap-2 text-base"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Memproses Transaksi...
                    </>
                  ) : (
                    <>
                      <ArrowDownCircle size={20} />
                      Konfirmasi Penarikan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmTarikModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={submitTarik}
        data={confirmData}
        loading={loading}
      />
    </DashboardLayout>
  );
}
