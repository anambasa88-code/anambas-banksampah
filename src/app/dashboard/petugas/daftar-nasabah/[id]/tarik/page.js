"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import ConfirmTarikModal from "@/components/petugas/tarik/ConfirmTarikModal";
import {
  ArrowLeft,
  Wallet,
  ArrowDownCircle,
  FileText,
  AlertCircle,
  CheckCircle,
  User,
  Loader2,
  ChevronRight,
} from "lucide-react";

const formatRp = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n || 0);
const formatNum = (n) => new Intl.NumberFormat("id-ID").format(n || 0);

function LoadingState() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 p-4 flex items-start justify-center pt-10">
        <div className="w-full max-w-md space-y-3 animate-pulse">
          <div className="h-10 w-32 bg-slate-200 rounded-xl" />
          <div className="h-48 bg-slate-200 rounded-3xl" />
          <div className="h-32 bg-slate-200 rounded-3xl" />
          <div className="h-14 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    </DashboardLayout>
  );
}

function ErrorState({ onBack }) {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-slate-900">
              Nasabah tidak ditemukan
            </p>
            <p className="text-[12px] text-slate-500 mt-1">
              Data tidak tersedia dalam sistem
            </p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[13px] font-semibold hover:bg-emerald-700 transition-all mx-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function TarikNasabahPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [nasabah, setNasabah] = useState(null);
  const [displayJumlah, setDisplayJumlah] = useState("");
  const [formData, setFormData] = useState({
    jumlah_tarik: 0,
    catatan_tarik: "",
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  useEffect(() => {
    if (id) fetchNasabah();
  }, [id]);

  const fetchNasabah = async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem("bs_token");
      const res = await fetch(`/api/users/petugas/detail-nasabah/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      const d = result.nasabah;
      if (!d) throw new Error("Data tidak ditemukan");
      setNasabah({
        nama: d.nama_lengkap || d.nickname || "Tanpa Nama",
        nik: d.nik || "-",
        saldo: Number(d.total_saldo || 0),
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingData(false);
    }
  };

  const handleJumlahChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setDisplayJumlah(raw ? formatNum(raw) : "");
    setFormData((p) => ({ ...p, jumlah_tarik: parseInt(raw) || 0 }));
  };

  const handleSubmit = () => {
    if (formData.jumlah_tarik <= 0)
      return toast.error("Masukkan jumlah penarikan");
    if (formData.jumlah_tarik > nasabah.saldo)
      return toast.error(
        `Saldo tidak cukup! Maksimal ${formatRp(nasabah.saldo)}`,
      );
    setConfirmData({
      nasabah_name: nasabah.nama,
      saldo_nasabah: nasabah.saldo,
      jumlah_tarik: formData.jumlah_tarik,
      catatan_tarik: formData.catatan_tarik,
    });
    setShowConfirm(true);
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
        body: JSON.stringify({ nasabah_id: parseInt(id), ...formData }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal memproses");
      toast.success("Penarikan berhasil!");
      setShowConfirm(false);
      setFormData({ jumlah_tarik: 0, catatan_tarik: "" });
      setDisplayJumlah("");
      fetchNasabah();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <LoadingState />;
  if (!nasabah) return <ErrorState onBack={() => router.back()} />;

  const saldoAkhir = nasabah.saldo - formData.jumlah_tarik;
  const isValid =
    formData.jumlah_tarik > 0 && formData.jumlah_tarik <= nasabah.saldo;
  const isOverLimit = formData.jumlah_tarik > nasabah.saldo;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-10">
        <div className="max-w-md mx-auto space-y-3 pt-2">
          {/* ── Top Nav ── */}
          <div className="flex items-center justify-between py-2">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
            <p className="text-[13px] font-bold text-slate-900 dark:text-white">
              Penarikan Saldo
            </p>
            <div className="w-16" /> {/* spacer */}
          </div>

          {/* ── Card Nasabah ── */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Green strip top */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-400" />

            <div className="p-5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Nasabah
              </p>
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-slate-900 dark:text-white truncate">
                    {nasabah.nama}
                  </p>
                  <p className="text-[12px] text-slate-500 font-mono mt-0.5">
                    {nasabah.nik}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
              </div>

              {/* Saldo bar */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-slate-500" />
                    <p className="text-[11px] font-semibold text-slate-500">
                      Saldo Tabungan
                    </p>
                  </div>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white">
                    {formatRp(nasabah.saldo)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Input Nominal ── */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 space-y-1">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Jumlah Penarikan
            </p>

            {/* Big Amount Input */}
            <div className="flex items-center gap-2 py-3">
              <span className="text-[22px] font-bold text-slate-400">Rp</span>
              <input
                type="text"
                value={displayJumlah}
                onChange={handleJumlahChange}
                placeholder="0"
                className="flex-1 text-[32px] font-bold text-slate-900 dark:text-white bg-transparent outline-none placeholder:text-slate-200 w-full"
              />
            </div>

            {/* Divider */}
            <div
              className={`h-0.5 rounded-full transition-colors ${
                isOverLimit
                  ? "bg-red-400"
                  : isValid
                    ? "bg-emerald-400"
                    : "bg-slate-100"
              }`}
            />

            {/* Saldo setelah tarik */}
            <div className="pt-1">
              {isOverLimit ? (
                <div className="flex items-center gap-2 mt-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <p className="text-[12px] font-semibold text-red-600">
                    Melebihi saldo! Maksimal {formatRp(nasabah.saldo)}
                  </p>
                </div>
              ) : isValid ? (
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <p className="text-[12px] font-semibold text-emerald-700">
                    Sisa saldo:{" "}
                    <span className="font-bold">{formatRp(saldoAkhir)}</span>
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 mt-2">
                  Saldo tersedia:{" "}
                  <span className="font-semibold text-slate-600">
                    {formatRp(nasabah.saldo)}
                  </span>
                </p>
              )}
            </div>

            {/* Quick amount chips */}
            <div className="flex gap-2 pt-2 flex-wrap">
              {[50000, 100000, 200000, 500000].map((nominal) => (
                <button
                  key={nominal}
                  disabled={nominal > nasabah.saldo}
                  onClick={() => {
                    setDisplayJumlah(formatNum(nominal));
                    setFormData((p) => ({ ...p, jumlah_tarik: nominal }));
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 rounded-xl text-[11px] font-semibold transition-all"
                >
                  {formatNum(nominal)}
                </button>
              ))}
            </div>
          </div>

          {/* ── Catatan ── */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Catatan{" "}
                <span className="normal-case font-normal text-slate-400">
                  (opsional)
                </span>
              </p>
            </div>
            <textarea
              value={formData.catatan_tarik}
              onChange={(e) =>
                setFormData((p) => ({ ...p, catatan_tarik: e.target.value }))
              }
              rows={2}
              placeholder="Keterangan penarikan..."
              className="w-full bg-transparent outline-none text-[13px] font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-300 resize-none"
            />
          </div>

          {/* ── Summary ── */}
          {isValid && (
            <div className="bg-emerald-600 rounded-3xl p-5 space-y-3">
              <p className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider">
                Ringkasan Transaksi
              </p>
              <div className="space-y-2">
                {[
                  { label: "Nasabah", value: nasabah.nama },
                  {
                    label: "Jumlah Tarik",
                    value: formatRp(formData.jumlah_tarik),
                  },
                  { label: "Saldo Saat Ini", value: formatRp(nasabah.saldo) },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center"
                  >
                    <span className="text-[12px] text-emerald-200">
                      {label}
                    </span>
                    <span className="text-[12px] font-semibold text-white">
                      {value}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-emerald-500 flex justify-between items-center">
                  <span className="text-[13px] font-semibold text-emerald-100">
                    Saldo Akhir
                  </span>
                  <span className="text-[18px] font-bold text-white">
                    {formatRp(saldoAkhir)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Submit ── */}
          <button
            onClick={handleSubmit}
            disabled={loading || !isValid}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 font-semibold rounded-2xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[14px] shadow-lg shadow-emerald-600/25 disabled:shadow-none active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
              </>
            ) : (
              <>
                <ArrowDownCircle className="w-4 h-4" /> Konfirmasi Penarikan
              </>
            )}
          </button>
        </div>
      </div>

      <ConfirmTarikModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={submitTarik}
        data={confirmData}
        loading={loading}
      />
    </DashboardLayout>
  );
}
