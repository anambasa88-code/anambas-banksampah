"use client";
import { Users, UsersRound, Package, TrendingUp, DollarSign, Wallet, Waves, ArrowUpRight, ArrowDownRight, Recycle, Wrench, FileText, Layers } from "lucide-react";

const CATEGORY_ICONS = {
  PLASTIK: Recycle,
  LOGAM: Wrench,
  KERTAS: FileText,
  LAINNYA: Layers,
  CAMPURAN: Package,
};

export default function DashboardStatsCard({ 
  type, 
  data, 
  global, 
  formatRupiah
}) {
  const renderNasabahCard = () => (
    <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Nasabah</p>
      <p className="text-3xl font-bold text-gray-800 dark:text-white">{global.total_nasabah}</p>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-2">
        {[
          { key: "LAKI_LAKI",  label: "Laki-laki"  },
          { key: "PEREMPUAN",  label: "Perempuan"   },
        ].map(({ key, label }) => (
          <div key={key} className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <UsersRound className="w-4 h-4" /> {label}
            </span>
            <span className="font-semibold text-gray-800 dark:text-white">
              {global.gender_breakdown?.[key]?.jumlah || 0}{" "}
              <span className="text-xs text-gray-500">({global.gender_breakdown?.[key]?.persen || "0.00"}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSampahCard = () => {
    const globalSampah = global.sampah_terkumpul || [];
    const totalBerat = globalSampah.reduce((sum, item) => sum + (Number(item.total_berat) || 0), 0);
    
    // Semua kategori yang harus ditampilkan
    const allCategories = ["PLASTIK", "LOGAM", "KERTAS", "LAINNYA", "CAMPURAN"];
    
    return (
      <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700 hover:shadow-md transition-shadow">
        <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center mb-4">
          <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Setoran</p>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalBerat.toFixed(2)} kg</p>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-2">
          {allCategories.map((name) => {
            const Icon = CATEGORY_ICONS[name] || Package;
            const berat = global.per_kategori?.[name] || 0;
            return (
              <div key={name} className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Icon className="w-3 h-3" />
                  {name.charAt(0) + name.slice(1).toLowerCase()}
                </span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {berat.toFixed(1)} kg
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTransaksiCard = () => (
    <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mb-4">
        <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Transaksi</p>
      <p className="text-3xl font-bold text-gray-800 dark:text-white">
        {global.total_transaksi_setor + global.total_transaksi_tarik}
      </p>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
              <Package className="w-3 h-3" />
              Setoran
            </span>
            <span className="text-sm font-bold text-green-600 dark:text-green-400">
              {global.total_transaksi_setor}
            </span>
          </div>
          <div className="pl-4 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <Wallet className="w-3 h-3" />
                Tabung
              </span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {global.transaksi_metode_bayar?.TABUNG || 0}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <DollarSign className="w-3 h-3" />
                Jual Langsung
              </span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {global.transaksi_metode_bayar?.JUAL_LANGSUNG || 0}
              </span>
            </div>
          </div>
        </div>
        <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
              <TrendingUp className="w-3 h-3 rotate-180" />
              Penarikan
            </span>
            <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
              {global.total_transaksi_tarik}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderKeuanganCard = () => (
    <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center mb-4">
        <DollarSign className="w-6 h-6 text-violet-600 dark:text-violet-400" />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Perputaran Uang Seluruh</p>
      <p className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-4">
        {formatRupiah(global.total_rp)}
      </p>
      <div className="space-y-2 mb-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
          Breakdown Metode Bayar
        </p>
        <div className="flex justify-between items-center text-sm">
          <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Wallet className="w-4 h-4" />
            Tabung
          </span>
          <span className="font-semibold text-gray-800 dark:text-white">
            {formatRupiah(global.perputaran_uang_per_metode?.TABUNG || 0)}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <DollarSign className="w-4 h-4" />
            Jual Langsung
          </span>
          <span className="font-semibold text-gray-800 dark:text-white">
            {formatRupiah(global.perputaran_uang_per_metode?.JUAL_LANGSUNG || 0)}
          </span>
        </div>
      </div>
      <div className="pt-4 border-t border-gray-200 dark:border-slate-700 space-y-2">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
          Saldo Tabungan Nasabah
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-sm">
            <span className="flex items-center gap-1 text-green-700 dark:text-green-400">
              <ArrowUpRight className="w-3 h-3" />
              Uang Masuk (Tabung)
            </span>
            <span className="font-bold text-green-700 dark:text-green-400">
              {formatRupiah(global.perputaran_uang_per_metode?.TABUNG || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center px-2 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-sm">
            <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
              <ArrowDownRight className="w-3 h-3" />
              Uang Keluar (Tarik)
            </span>
            <span className="font-bold text-orange-600 dark:text-orange-400">
              {formatRupiah(global.total_penarikan_rp || 0)}
            </span>
          </div>
          <div className="flex items-center gap-2 my-1">
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              Saldo
            </span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
          </div>
          <div className="flex justify-between items-center px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-sm border border-emerald-300 dark:border-emerald-700">
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
              <Wallet className="w-3 h-3" />
              Saldo Aktif Tersisa
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              {formatRupiah(global.saldo_aktif || 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const cardRenderers = {
    nasabah: renderNasabahCard,
    sampah: renderSampahCard,
    transaksi: renderTransaksiCard,
    keuangan: renderKeuanganCard,
  };

  return cardRenderers[type]?.() || null;
}
