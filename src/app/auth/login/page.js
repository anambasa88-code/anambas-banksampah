"use client";

import { useState } from "react";
import { LogIn, Eye, EyeOff, User, Lock } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [nickname, setNickname] = useState("");
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length <= 6) setPin(value);
  };

  const handleSubmit = async () => {
    if (!nickname || !pin) {
      toast.error("Nickname dan PIN wajib diisi");
      return;
    }

    if (pin.length !== 6) {
      toast.error("PIN harus 6 digit");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Login gagal");
        return;
      }

      const { token, user } = data;

      if (!token) {
        toast.error("Token tidak ditemukan");
        return;
      }

      // Set cookie untuk middleware (expires 9 hours)
      document.cookie = `bs_token=${token}; path=/; max-age=${9 * 60 * 60}; SameSite=Lax`;

      // Simpan token, role, dan username di localStorage
      localStorage.setItem("bs_token", token);
      localStorage.setItem("bs_role", user.peran);
      localStorage.setItem("bs_username", user.nickname);

      toast.success("Login berhasil!");

      // Check if user must change PIN (jika ada field must_change_pin di response)
      if (user.must_change_pin) {
        setTimeout(() => {
          window.location.href = "/auth/change-pin?forced=true";
        }, 500);
        return;
      }

      // Redirect based on role
      setTimeout(() => {
        if (user.peran === "ADMIN") {
          window.location.href = "/dashboard/admin/dashboard";
        } else if (user.peran === "PETUGAS") {
          window.location.href = "/dashboard/petugas/dashboard";
        } else {
          window.location.href = "/dashboard/nasabah/dashboard";
        }
      }, 500);

    } catch (err) {
      console.error("Login error:", err);
      toast.error("Terjadi kesalahan koneksi server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-green-50 via-green-100 to-green-50">
      <div className="w-full max-w-md py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <User className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800">Masuk Akun</h1>
          <p className="text-sm text-gray-600 mt-2">
            Bank Sampah Anambas - Gunakan Nickname & PIN 6 digit
          </p>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-3xl border border-green-200 shadow-2xl bg-white">
          <div className="space-y-6">
            {/* Nickname */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-green-600" />
                Nickname
              </label>
              <input
                type="text"
                placeholder="Masukkan nickname Anda"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyPress={handleKeyPress}
                autoComplete="username"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-green-400 focus:border-green-400 transition outline-none"
              />
            </div>

            {/* PIN */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-green-600" />
                PIN (6 digit)
              </label>

              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="••••••"
                  value={pin}
                  onChange={handlePinChange}
                  onKeyPress={handleKeyPress}
                  autoComplete="off"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-sm bg-white focus:ring-2 focus:ring-green-400 focus:border-green-400 transition outline-none"
                />

                {/* Toggle Pin */}
                <button
                  type="button"
                  onClick={() => setShowPin((p) => !p)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* PIN hint */}
              <p className="text-xs text-gray-500 mt-1.5">
                {pin.length}/6 digit
              </p>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full rounded-xl py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-500 shadow-lg hover:shadow-green-500/40 hover:from-green-500 hover:to-green-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                "Memproses..."
              ) : (
                <span className="inline-flex items-center gap-2 justify-center">
                  <LogIn className="w-5 h-5" />
                  Masuk
                </span>
              )}
            </button>
          </div>

          {/* Extra Links */}
          <div className="mt-6 text-center text-xs text-gray-500 space-y-2">
            <p>
              Kembali ke{" "}
              <a href="/" className="text-green-600 hover:underline font-medium">
                halaman utama
              </a>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © {new Date().getFullYear()} Bank Sampah Anambas. All rights reserved.
        </p>
      </div>
    </main>
  );
}