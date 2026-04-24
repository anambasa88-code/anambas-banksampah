"use client";
import { Users, Package, TrendingUp, DollarSign, Wallet, UsersRound,  ArrowUpRight, ArrowDownRight, CircleDollarSign, Recycle, Wrench, FileText, Layers,  } from "lucide-react";

export default function StatsGrid({ data, formatRupiah }) {
  const {
    total_kg = 0, total_rp = 0, per_kategori = {},
    total_nasabah = 0, gender_breakdown = {},
    total_transaksi_setor = 0, total_transaksi_tarik = 0,
    transaksi_metode_bayar = {}, total_penarikan_rp = 0,
    saldo_aktif = 0, perputaran_uang_per_metode = {},
  } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

      {/* Total Nasabah */}
      <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
          <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Nasabah</p>
        <p className="text-3xl font-bold text-gray-800 dark:text-white">{total_nasabah}</p>
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
                {gender_breakdown?.[key]?.jumlah || 0}{" "}
                <span className="text-xs text-gray-500">({gender_breakdown?.[key]?.persen || "0.00"}%)</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Total Setoran */}
      <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700">
        <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center mb-4">
          <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Setoran</p>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{total_kg.toFixed(2)} kg</p>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-2">
          {[
            { name: "PLASTIK",  Icon: Recycle   },
            { name: "LOGAM",    Icon: Wrench     },
            { name: "KERTAS",   Icon: FileText    },
            { name: "LAINNYA",  Icon: Layers},
            { name: "CAMPURAN", Icon: Package },
          ].map(({ name, Icon }) => (
            <div key={name} className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Icon className="w-3 h-3" />
                {name.charAt(0) + name.slice(1).toLowerCase()}
              </span>
              <span className="font-semibold text-gray-800 dark:text-white">
                {(per_kategori?.[name] || 0).toFixed(1)} kg
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Total Transaksi */}
      <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700">
        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mb-4">
          <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Transaksi</p>
        <p className="text-3xl font-bold text-gray-800 dark:text-white">{total_transaksi_setor + total_transaksi_tarik}</p>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                <Package className="w-3 h-3" /> Setoran
              </span>
              <span className="text-sm font-bold text-green-600">{total_transaksi_setor}</span>
            </div>
            <div className="pl-3 space-y-1">
              {[
                { key: "TABUNG",        label: "Tabung",        Icon: Wallet      },
                { key: "JUAL_LANGSUNG", label: "Jual Langsung", Icon: DollarSign  },
              ].map(({ key, label, Icon }) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Icon className="w-3 h-3" /> {label}
                  </span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {transaksi_metode_bayar?.[key] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <span className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
              <TrendingUp className="w-3 h-3 rotate-180" /> Penarikan
            </span>
            <span className="text-sm font-bold text-orange-600">{total_transaksi_tarik}</span>
          </div>
        </div>
      </div>

      {/* Perputaran Uang */}
      <div className="p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700">
        <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center mb-4">
          <CircleDollarSign className="w-6 h-6 text-violet-600 dark:text-violet-400" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Perputaran Uang</p>
        <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{formatRupiah(total_rp)}</p>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Breakdown Metode Bayar</p>
            <div className="space-y-2">
              {[
                { key: "TABUNG",        label: "Tabung",        Icon: Wallet     },
                { key: "JUAL_LANGSUNG", label: "Jual Langsung", Icon: DollarSign },
              ].map(({ key, label, Icon }) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Icon className="w-3 h-3" /> {label}
                  </span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {formatRupiah(perputaran_uang_per_metode?.[key] || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-gray-100 dark:border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-xs">
              <span className="flex items-center gap-1 text-green-700 dark:text-green-400">
                <ArrowUpRight className="w-3 h-3" /> Uang Masuk
              </span>
              <span className="font-bold text-green-700">{formatRupiah(perputaran_uang_per_metode?.TABUNG || 0)}</span>
            </div>
            <div className="flex justify-between items-center px-2 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-xs">
              <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <ArrowDownRight className="w-3 h-3" /> Uang Keluar
              </span>
              <span className="font-bold text-orange-600">{formatRupiah(total_penarikan_rp)}</span>
            </div>
            <div className="flex justify-between items-center px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 text-xs">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <Wallet className="w-3 h-3" /> Saldo Aktif
              </span>
              <span className="font-bold text-emerald-700">{formatRupiah(saldo_aktif)}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
