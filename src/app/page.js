// src/app/page.tsx
import Link from "next/link";
import {
  Leaf,
  Wallet,
  Package,
  Users,
  Shield,
  BarChart3,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Waves,
  UsersRound,
  Recycle,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-green-50 via-green-100 to-green-50">
        <div className="container grid gap-12 md:grid-cols-2 items-center">
          {/* Text */}
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-[var(--foreground)]">
              Ekosistem Digital Pengelolaan Sampah <br />
              <span className="text-[var(--primary)]">yang Terintegrasi</span>
            </h1>
            <p className="text-base md:text-lg text-[var(--muted)] leading-relaxed max-w-xl mx-auto md:mx-0">
              Bank Sampah Anambas menghubungkan nasabah, petugas, dan admin
              dalam satu platform modern untuk mencatat setoran, mengatur harga,
              memantau transaksi, dan mencairkan dana secara cepat dan
              transparan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 px-6 py-3 text-base md:text-lg font-medium rounded-lg bg-green-600 text-white shadow-md hover:shadow-lg hover:bg-green-700 transition"
              >
                <BarChart3 className="h-5 w-5" />
                Masuk ke Dashboard
              </Link>
            </div>
          </div>

          {/* Sneak Peek Dashboard */}
          <div className="relative group block overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
            {/* Glow background */}
            <div className="absolute -inset-6 bg-gradient-to-r from-green-500/30 to-green-600/20 rounded-3xl blur-3xl group-hover:blur-xl transition duration-1000 -z-10"></div>

            {/* Dashboard Card */}
            <div className="relative bg-white rounded-3xl shadow-2xl border border-green-200 overflow-hidden transform hover:scale-[1.015] transition-all duration-700">
              {/* Window bar */}
              <div className="bg-gray-100 px-6 py-4 flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-800"></div>
                  <div className="w-3 h-3 rounded-full bg-green-600"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span className="text-xs font-medium text-gray-500">
                  banksampah-anambas.com
                </span>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Header + Welcome */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Dashboard Nasabah
                    </h3>
                    <p className="text-sm text-gray-500">
                      Selamat datang kembali,{" "}
                      <span className="font-medium">Nasabah</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Saldo Saat Ini</p>
                    <p className="text-3xl font-bold text-green-600">
                      Rp 2.450.000
                    </p>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
                      +Rp 320.000 hari ini
                    </span>
                  </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Total Setoran</p>
                        <p className="text-2xl font-bold text-gray-800">42</p>
                      </div>
                      <Package className="w-8 h-8 text-green-600 opacity-70" />
                    </div>
                    <p className="text-lg font-semibold text-green-700 mt-2">
                      185 kg
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Community</p>
                        <p className="text-2xl font-bold text-gray-800">8</p>
                      </div>
                      <UsersRound className="w-8 h-8 text-green-600 opacity-70" />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Jenis Setoran</p>
                  </div>

                  <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Ocean Debris</p>
                        <p className="text-2xl font-bold text-gray-800">34</p>
                      </div>
                      <Waves className="w-8 h-8 text-green-600 opacity-70" />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Jenis Setoran</p>
                  </div>
                </div>

                {/* Mini Area Chart */}
                <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Tren Setoran 6 Bulan Terakhir
                  </p>
                  <svg viewBox="0 0 300 80" className="w-full h-20">
                    <defs>
                      <linearGradient
                        id="gradient-green"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#16a34a"
                          stopOpacity="0.6"
                        />
                        <stop
                          offset="100%"
                          stopColor="#16a34a"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,60 Q50,40 75,30 Q100,20 150,35 Q200,50 250,25 Q300,10 300,60 L300,80 L0,80 Z"
                      fill="url(#gradient-green)"
                    />
                    <path
                      d="M0,60 Q50,40 75,30 Q100,20 150,35 Q200,50 250,25 Q300,10 300,60"
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth="3"
                      className="drop-shadow-sm"
                    />
                  </svg>
                </div>

                {/* Recent Activity */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    Aktivitas Terbaru
                  </p>
                  {[
                    {
                      text: "Setoran Plastik PET 15 kg",
                      amount: "+Rp 320.000",
                      color: "text-emerald-600",
                    },
                    {
                      text: "Setor Kardus 28 kg",
                      amount: "+Rp 185.000",
                      color: "text-emerald-600",
                    },
                    {
                      text: "Harga Botol Plastik naik → Rp 2.500/kg",
                      amount: "",
                      color: "text-amber-600",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-600">
                          {item.text}
                        </span>
                      </div>
                      {item.amount && (
                        <span className={`text-sm font-semibold ${item.color}`}>
                          {item.amount}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Link
                  href="auth/login"
                  className="group relative w-full block"
                >
                  <div className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-green-500/40 transform hover:-translate-y-0.5 transition-all duration-300 text-center">
                    <Sparkles className="w-5 h-5 inline-block" /> Masuk ke
                    Dashboard
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-[var(--muted)] border-t border-[var(--border)] mt-auto">
        © {new Date().getFullYear()} Bank Sampah Anambas. All rights reserved.
      </footer>
    </main>
  );
}
