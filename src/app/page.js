"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Marquee from "react-fast-marquee";
import { Recycle, Scale, Wallet, Instagram, CheckCircle } from "lucide-react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-white text-slate-700">
      {/* ===== NAVBAR PREMIUM ===== */}
      <header className="sticky top-0 z-50">
        <div className="bg-white/60 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.06)] border-b border-white/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
            {/* LOGO AREA */}
            <Link href="/" className="flex items-center gap-4 group">
              <Image
                src="/logos/parongpong.png"
                alt="Parongpong"
                width={42}
                height={42}
                className="object-contain transition-all duration-300 group-hover:scale-110"
              />
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-800">
                Bank Sampah Anambas
              </h1>
              <Image
                src="/logos/anambas.png"
                alt="Anambas Foundation"
                width={42}
                height={42}
                className="object-contain transition-all duration-300 group-hover:scale-110"
              />
            </Link>

            {/* BUTTON AREA */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/auth/login"
                className="px-6 py-2.5 rounded-full font-semibold text-white bg-[#1D293D] hover:bg-[#233049] transition-all"
              >
                Login
              </Link>
            </div>

            {/* MOBILE ICON */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-slate-700"
            >
              {isMenuOpen ? (
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 8h16M4 16h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* MOBILE MENU */}
          {isMenuOpen && (
            <div className="md:hidden flex flex-col gap-3 bg-white px-6 py-4 border-t">
              <Link
                href="/auth/login"
                className="bg-white text-center text-slate-700 border border-slate-300 py-2 rounded-xl"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section
        className="relative bg-cover bg-center h-[80vh]"
        style={{ backgroundImage: `url('/anambas-bg4.jpg')` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center text-center text-white">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">
            Ubah Sampah Jadi Berkah
          </h1>
          <p className="mt-4 text-lg sm:text-xl max-w-2xl mx-auto">
            Program digital resmi Parongpong & Anambas Foundation untuk
            menciptakan ekosistem bank sampah modern.
          </p>

          {/* TOMBOL LOGIN TRANSPARAN */}
          <div className="mt-10">
            <Link
              href="/auth/login"
              className="inline-block px-12 py-5 text-xl sm:text-2xl font-black tracking-widest uppercase border-4 border-white bg-transparent hover:bg-white hover:text-slate-900 transition-all duration-300 rounded-2xl shadow-2xl"
            >
               Login
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CARA KERJA ===== */}
      <section id="cara-kerja" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-800">
              Sangat Mudah, Hanya 3 Langkah
            </h2>
            <p className="mt-3 text-slate-600">
              DWEP mempermudah Anda menabung sampah.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
              <div className="bg-teal-100 h-20 w-20 mx-auto rounded-full flex items-center justify-center">
                <Recycle className="h-12 w-12 text-teal-600" />
              </div>
              <h3 className="mt-6 text-xl font-bold">1. Pilah Sampah</h3>
              <p className="mt-2 text-slate-500">
                Pisahkan sampah sesuai kategori.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center transform md:scale-105">
              <div className="bg-orange-100 h-20 w-20 mx-auto rounded-full flex items-center justify-center">
                <Scale className="h-12 w-12 text-orange-600" />
              </div>
              <h3 className="mt-6 text-xl font-bold">2. Setor & Timbang</h3>
              <p className="mt-2 text-slate-500">
                Bawa sampah ke Bank Sampah terdekat.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
              <div className="bg-sky-100 h-20 w-20 mx-auto rounded-full flex items-center justify-center">
                <Wallet className="h-12 w-12 text-sky-600" />
              </div>
              <h3 className="mt-6 text-xl font-bold">3. Dapatkan Saldo</h3>
              <p className="mt-2 text-slate-500">
                Otomatis menambah saldo tabungan digital Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PREMIUM MARQUEE ===== */}
      <div className="w-full py-10 bg-slate-50">
        <Marquee speed={25} gradient={true}>
          <div className="flex items-center gap-32">
            <Image
              src="/logos/parongpong.png"
              alt="Parongpong"
              width={180}
              height={180}
              className="grayscale opacity-80"
            />
            <Image
              src="/logos/anambas.png"
              alt="Anambas Foundation"
              width={180}
              height={180}
              className="grayscale opacity-80"
            />
            <Image
              src="/logos/parongpong.png"
              alt="Parongpong"
              width={180}
              height={180}
              className="grayscale opacity-80"
            />
            <Image
              src="/logos/anambas.png"
              alt="Anambas Foundation"
              width={180}
              height={180}
              className="grayscale opacity-80"
            />
          </div>
        </Marquee>
      </div>

      {/* ===== MANFAAT (Single Image) ===== */}
      <section id="manfaat" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative w-full h-80 sm:h-96 rounded-2xl shadow-xl overflow-hidden">
            <Image
              src="/anambas-bg1.jpg"
              alt="Manfaat DWEP"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Dua Manfaat Sekaligus
            </h2>
            <p className="mt-4 text-slate-600 mb-6">
              Keuntungan ekonomi dan kelestarian lingkungan Anambas.
            </p>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="bg-teal-100 p-2 rounded-full">
                  <CheckCircle className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Keuntungan Ekonomi</h4>
                  <p className="text-slate-500">
                    Saldo dapat ditarik kapan pun.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="bg-teal-100 p-2 rounded-full">
                  <CheckCircle className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Menjaga Lingkungan</h4>
                  <p className="text-slate-500">
                    Mengurangi sampah di laut dan pesisir.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-800 text-white pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h1 className="text-xl font-extrabold mb-4">Bank Sampah Anambas</h1>
            <p className="text-slate-400 text-sm">
              Gerakan bersama untuk Anambas yang lebih bersih.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Navigasi</h4>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li>
                <Link href="#cara-kerja" className="hover:text-teal-400">
                  Cara Kerja
                </Link>
              </li>
              <li>
                <Link href="#manfaat" className="hover:text-teal-400">
                  Manfaat
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-teal-400">
                  Login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Kontak</h4>
            <p className="text-slate-300 text-sm">Kuala Maras, Anambas</p>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4">Ikuti Kami</h4>
            <a
              href="https://www.instagram.com/anambasorg"
              className="text-slate-300 hover:text-white"
            >
              <Instagram className="w-6 h-6" />
            </a>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-700 pt-6 text-center text-slate-400 text-sm">
          © 2026 Parongpong x Anambas Foundation
        </div>
      </footer>
    </div>
  );
}
