"use client";
import { UsersRound, Waves, TrendingUp, Scale } from "lucide-react";

const CARDS = [
  {
    key:   "COMMUNITY",
    label: "Community",
    desc:  "Sampah dari komunitas",
    Icon:  UsersRound,
    gradient: "from-emerald-500 to-green-400",
    bg:       "bg-emerald-50 dark:bg-emerald-900/20",
    border:   "border-emerald-100 dark:border-emerald-800",
    hover:    "hover:border-emerald-300 dark:hover:border-emerald-600",
    iconBg:   "bg-emerald-100 dark:bg-emerald-900/40",
    iconText: "text-emerald-600 dark:text-emerald-400",
    barColor: "bg-emerald-500",
    textColor:"text-emerald-600 dark:text-emerald-400",
  },
  {
    key:   "OCEAN_DEBRIS",
    label: "Ocean Debris",
    desc:  "Sampah dari laut",
    Icon:  Waves,
    gradient: "from-blue-500 to-cyan-400",
    bg:       "bg-blue-50 dark:bg-blue-900/20",
    border:   "border-blue-100 dark:border-blue-800",
    hover:    "hover:border-blue-300 dark:hover:border-blue-600",
    iconBg:   "bg-blue-100 dark:bg-blue-900/40",
    iconText: "text-blue-600 dark:text-blue-400",
    barColor: "bg-blue-500",
    textColor:"text-blue-600 dark:text-blue-400",
  },
];

export default function TipeSetoranCards({ per_tipe = {}, total_kg = 0 }) {
  return (
    <div className="space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-gray-800 dark:text-white">Setoran Berdasarkan Tipe</h2>
          <p className="text-[11px] text-gray-500 mt-0.5">Distribusi berat sampah per tipe setoran</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <Scale className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            {total_kg.toFixed(2)} kg total
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CARDS.map(({ key, label, desc, Icon, bg, border, hover, iconBg, iconText, barColor, textColor, gradient }) => {
          const berat  = Number(per_tipe?.[key] || 0);
          const persen = total_kg > 0 ? ((berat / total_kg) * 100) : 0;

          return (
            <div key={key}
              className={`relative overflow-hidden p-5 rounded-2xl border ${border} ${hover} ${bg} shadow-sm transition-all duration-200 group`}>

              {/* Decorative gradient circle */}
              <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />

              {/* Top row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${iconText}`} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-800 dark:text-white">{label}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">{desc}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${iconBg} ${textColor}`}>
                  <TrendingUp size={10} />
                  {persen.toFixed(1)}%
                </div>
              </div>

              {/* Berat */}
              <div className="mb-4">
                <p className="text-[11px] text-gray-400 mb-0.5">Total Berat</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">
                  {berat.toFixed(2)}
                  <span className="text-base font-medium text-gray-400 ml-1.5">kg</span>
                </p>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] text-gray-400">Proporsi dari total</span>
                  <span className={`text-[10px] font-bold ${textColor}`}>{persen.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-white/60 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min(persen, 100)}%` }}
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Comparison bar */}
      {total_kg > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-medium text-slate-500 mb-2">Perbandingan</p>
          <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
            {CARDS.map(({ key, barColor }) => {
              const persen = total_kg > 0 ? ((Number(per_tipe?.[key] || 0) / total_kg) * 100) : 0;
              return (
                <div key={key} className={`${barColor} transition-all duration-700`} style={{ width: `${persen}%` }} />
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            {CARDS.map(({ key, label, textColor, iconBg }) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${iconBg.replace('bg-', 'bg-').replace('-50', '-500').replace('/20', '')}`}
                  style={{ background: key === "COMMUNITY" ? "#10b981" : "#3b82f6" }} />
                <span className="text-[10px] text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
