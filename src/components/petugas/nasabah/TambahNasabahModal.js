"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, UserPlus, User, CreditCard, MapPin, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const INITIAL_FORM = {
  nama_lengkap:  "",
  jenis_kelamin: "LAKI_LAKI",
  nik:           "",
  desa:          "",
  alamat:        "",
};

function InputField({ label, icon: Icon, required, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
          <p className="text-[11px] font-medium text-red-600">{error}</p>
        </div>
      )}
      {hint && !error && (
        <p className="text-[11px] text-slate-400">{hint}</p>
      )}
    </div>
  );
}

export default function TambahNasabahModal({ isOpen, onClose }) {
  const [form, setForm]       = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setForm(INITIAL_FORM);
  }, [isOpen]);

  if (!isOpen) return null;

  const nikError = form.nik && form.nik.length > 0 && form.nik.length !== 16
    ? `NIK harus tepat 16 digit (sekarang ${form.nik.length})`
    : null;

  const nikValid = form.nik.length === 16;

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nama_lengkap.trim()) return toast.error("Nama lengkap wajib diisi");
    if (form.nik && form.nik.length !== 16) return toast.error("NIK harus tepat 16 digit");

    setLoading(true);
    try {
      const token = localStorage.getItem("bs_token");
      const res   = await fetch("/api/users/petugas/daftar-nasabah", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ ...form, peran: "NASABAH" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan data");
      toast.success("Nasabah berhasil didaftarkan!");
      onClose(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* ── Header ── */}
        <div className="relative bg-emerald-600 px-6 pt-6 pb-8">
          {/* Decorative circles */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute bottom-0 left-8 w-16 h-16 bg-black/10 rounded-full" />

          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-white">Daftarkan Nasabah</h2>
                <p className="text-[11px] text-emerald-100 mt-0.5">Isi data nasabah baru di bawah ini</p>
              </div>
            </div>
            <button onClick={() => onClose(false)}
              className="p-1.5 hover:bg-white/20 rounded-xl transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">

            {/* Nama Lengkap */}
            <InputField label="Nama Lengkap" icon={User} required>
              <input
                type="text"
                value={form.nama_lengkap}
                onChange={set("nama_lengkap")}
                placeholder="Masukkan nama lengkap"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-[13px] font-medium text-slate-800 dark:text-white placeholder:text-slate-300 placeholder:font-normal"
              />
            </InputField>

            {/* Jenis Kelamin */}
            <InputField label="Jenis Kelamin" icon={User}>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "LAKI_LAKI", label: "Laki-laki"  },
                  { value: "PEREMPUAN", label: "Perempuan"   },
                ].map(({ value, label }) => (
                  <button key={value} type="button"
                    onClick={() => setForm((p) => ({ ...p, jenis_kelamin: value }))}
                    className={`py-3 rounded-2xl text-[12px] font-semibold transition-all border-2 ${
                      form.jenis_kelamin === value
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-300"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </InputField>

            {/* NIK */}
            <InputField
              label="NIK"
              icon={CreditCard}
              error={nikError}
              hint="16 digit sesuai KTP (opsional)"
            >
              <div className="relative">
                <input
                  type="text"
                  maxLength={16}
                  value={form.nik}
                  onChange={(e) => setForm((p) => ({ ...p, nik: e.target.value.replace(/\D/g, "") }))}
                  placeholder="3201xxxxxxxxxxxx"
                  className={`w-full px-4 py-3 pr-11 bg-slate-50 dark:bg-slate-800 border-2 rounded-2xl outline-none transition-all text-[13px] font-mono text-slate-800 dark:text-white placeholder:text-slate-300 placeholder:font-sans placeholder:font-normal ${
                    nikError
                      ? "border-red-400 focus:ring-4 focus:ring-red-500/10"
                      : nikValid
                      ? "border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                      : "border-slate-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                  }`}
                />
                {/* Status icon */}
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {nikValid && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {nikError && <AlertCircle className="w-4 h-4 text-red-500" />}
                  {!nikValid && !nikError && form.nik.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400">{form.nik.length}/16</span>
                  )}
                </div>
              </div>
            </InputField>

            {/* Desa */}
            <InputField label="Desa / Kelurahan" icon={MapPin}>
              <input
                type="text"
                value={form.desa}
                onChange={set("desa")}
                placeholder="Contoh: Desa Makmur"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-[13px] font-medium text-slate-800 dark:text-white placeholder:text-slate-300 placeholder:font-normal"
              />
            </InputField>

            {/* Alamat */}
            <InputField label="Alamat Lengkap" icon={FileText}>
              <textarea
                rows={2}
                value={form.alamat}
                onChange={set("alamat")}
                placeholder="Jl. Merdeka No. 123, RT 01/RW 02"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-[13px] font-medium text-slate-800 dark:text-white placeholder:text-slate-300 placeholder:font-normal resize-none"
              />
            </InputField>

          </div>

          {/* ── Footer ── */}
          <div className="px-6 pb-6 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">

            {/* PIN Info */}
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
              <div className="w-7 h-7 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                PIN default nasabah: <span className="font-black tracking-widest">123456</span> — ingatkan nasabah untuk segera menggantinya
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button type="button" onClick={() => onClose(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-[13px] font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                Batal
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white disabled:text-slate-400 rounded-2xl text-[13px] font-semibold transition-all shadow-sm shadow-emerald-600/20 disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98]">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Mendaftarkan...</>
                  : <><UserPlus className="w-4 h-4" /> Daftarkan Nasabah</>
                }
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
