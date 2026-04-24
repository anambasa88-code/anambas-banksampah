"use client";
import { 
  Building2, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Package, 
  Waves, 
  DollarSign, 
  RefreshCw, 
  Wallet,
  TrendingUp,
  Users 
} from "lucide-react";

export default function UnitTable({ 
  per_unit, 
  expandedUnits, 
  toggleUnit, 
  formatRupiah 
}) {
  const CATEGORIES = [
    { name: "PLASTIK", icon: Package },
    { name: "LOGAM", icon: Waves },
    { name: "KERTAS", icon: Trash2 },
    { name: "LAINNYA", icon: DollarSign },
    { name: "CAMPURAN", icon: RefreshCw },
  ];

  if (per_unit.length === 0) {
    return (
      <div className="md:col-span-4 p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Breakdown Per Unit
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Data per unit bank sampah
            </p>
          </div>
        </div>
        
        <div className="p-8 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-slate-700 rounded-2xl">
          Belum ada unit terdaftar
        </div>
      </div>
    );
  }

  return (
    <div className="md:col-span-4 p-6 rounded-2xl border border-gray-200 shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Breakdown Per Unit ({per_unit.length} Unit)
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Data per unit bank sampah
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {per_unit.map((unit) => (
          <div
            key={unit.unit_id}
            className="border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden"
          >
            {/* Unit Header - Collapsible */}
            <button
              onClick={() => toggleUnit(unit.unit_id)}
              className="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {unit.nama_unit}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {unit.total_nasabah} nasabah •{" "}
                    {unit.total_kg.toFixed(2)} kg •{" "}
                    {formatRupiah(unit.total_rp)}
                  </p>
                </div>
              </div>
              {expandedUnits[unit.unit_id] ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {/* Unit Details - Expandable */}
            {expandedUnits[unit.unit_id] && (
              <div className="p-5 pt-0 border-t border-gray-100 dark:border-slate-800 space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Nasabah
                    </p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white">
                      {unit.total_nasabah}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Setoran
                    </p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      {unit.total_kg.toFixed(2)} kg
                    </p>
                  </div>
                </div>

                {/* Detail Breakdown - 4 Kolom */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Kategori Sampah */}
                  <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Kategori Sampah
                    </p>
                    <div className="space-y-2">
                      {CATEGORIES.map(({ name, icon: Icon }) => {
                        const berat = unit.per_kategori?.[name] || 0;
                        return (
                          <div
                            key={name}
                            className="flex justify-between text-xs"
                          >
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

                  {/* Transaksi */}
                  <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Transaksi
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Total</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {(unit.total_transaksi_setor + unit.total_transaksi_tarik).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Setor</span>
                        <span className="font-semibold text-green-600">
                          {unit.total_transaksi_setor.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Tarik</span>
                        <span className="font-semibold text-orange-600">
                          {unit.total_transaksi_tarik.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Perputaran Uang */}
                  <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Perputaran Uang
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                        <span className="font-semibold text-violet-600 dark:text-violet-400">
                          {formatRupiah(unit.total_rp)}
                        </span>
                      </div>
                      <div className="pl-3 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Tabung</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {formatRupiah(unit.perputaran_uang_per_metode?.TABUNG || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Jual Langsung</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {formatRupiah(unit.perputaran_uang_per_metode?.JUAL_LANGSUNG || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Saldo */}
                  <div className="p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Saldo
                    </p>
                    <div className="space-y-3">
                      <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 text-xs">
                            <span className="flex items-center gap-1.5">
                              <Wallet className="w-3.5 h-3.5 text-green-600" />
                              Tabung
                            </span>
                            <span className="font-semibold text-green-600">
                              {formatRupiah(unit.perputaran_uang_per_metode?.TABUNG || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center px-2 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-xs">
                            <span className="flex items-center gap-1.5">
                              <DollarSign className="w-3.5 h-3.5 text-orange-600" />
                              Jual Langsung
                            </span>
                            <span className="font-semibold text-orange-600">
                              {formatRupiah(unit.perputaran_uang_per_metode?.JUAL_LANGSUNG || 0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 my-1">
                          <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                          <span className="text-xs text-gray-500 whitespace-nowrap">Saldo Aktif</span>
                          <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
                        </div>
                        <div className="flex justify-between items-center px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-xs border border-emerald-300 dark:border-emerald-700">
                          <span className="flex items-center gap-1.5">
                            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                            Total Saldo
                          </span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">
                            {formatRupiah(unit.saldo_aktif)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
