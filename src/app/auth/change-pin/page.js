"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

// Pisahkan komponen yang pakai useSearchParams
function ChangePinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isForced = searchParams.get("forced") === "true";

  // ... SEMUA STATE DAN LOGIC PINDAH KE SINI (copy semua dari bawah) ...

  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showOldPin, setShowOldPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ... SEMUA useEffect DAN FUNCTION handleSubmit, handlePinChange, handleKeyPress ...

  useEffect(() => {
    if (isForced) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = "";
      };

      const handlePopState = (e) => {
        window.history.pushState(null, "", window.location.href);
      };

      window.history.pushState(null, "", window.location.href);
      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [isForced]);

  const handlePinChange = (value, setter) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    if (cleaned.length <= 6) setter(cleaned);
  };

  const handleSubmit = async () => {
    setError("");

    if (!oldPin || !newPin || !confirmPin) {
      toast.error("Semua field PIN wajib diisi");
      return;
    }

    if (oldPin.length !== 6 || newPin.length !== 6 || confirmPin.length !== 6) {
      toast.error("PIN harus 6 digit");
      return;
    }

    if (newPin === oldPin) {
      toast.error("PIN baru tidak boleh sama dengan PIN lama");
      return;
    }

    if (newPin !== confirmPin) {
      toast.error("PIN baru dan konfirmasi PIN tidak cocok");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("bs_token");

      if (!token) {
        toast.error("Sesi tidak valid, silakan login kembali");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      const res = await fetch("/api/auth/change-pin", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPin, newPin }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.message || "Gagal mengganti PIN");
        return;
      }

      setSuccess(true);
      toast.success("PIN berhasil diperbarui!");

      setTimeout(() => {
        const role = localStorage.getItem("bs_role");
        if (role === "ADMIN") {
          router.push("/dashboard/admin/dashboard");
        } else if (role === "PETUGAS") {
          router.push("/dashboard/petugas/dashboard");
        } else {
          router.push("/dashboard/nasabah/dashboard");
        }
      }, 2000);
    } catch (err) {
      console.error("Change PIN error:", err);
      toast.error("Terjadi kesalahan koneksi server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-green-50 via-green-100 to-green-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            PIN Berhasil Diperbarui!
          </h2>
          <p className="text-gray-600">Mengalihkan ke dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-green-50 via-green-100 to-green-50">
      <div className="w-full max-w-md py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            {isForced ? "Ganti PIN Wajib" : "Ganti PIN"}
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            {isForced
              ? "Untuk keamanan akun, Anda harus mengganti PIN default"
              : "Perbarui PIN Anda untuk keamanan akun"}
          </p>
        </div>

        {isForced && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Perhatian!</p>
              <p className="mt-1">
                PIN baru harus berbeda dengan PIN lama/default. Anda tidak dapat
                melanjutkan tanpa mengganti PIN.
              </p>
            </div>
          </div>
        )}

        <div className="p-8 rounded-3xl border border-green-200 shadow-2xl bg-white">
          <div className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-gray-600" />
                PIN Lama
              </label>
              <div className="relative">
                <input
                  type={showOldPin ? "text" : "password"}
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="••••••"
                  value={oldPin}
                  onChange={(e) => handlePinChange(e.target.value, setOldPin)}
                  onKeyPress={handleKeyPress}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-sm bg-white focus:ring-2 focus:ring-green-400 focus:border-green-400 transition outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPin(!showOldPin)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                >
                  {showOldPin ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                {oldPin.length}/6 digit
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-green-600" />
                PIN Baru
              </label>
              <div className="relative">
                <input
                  type={showNewPin ? "text" : "password"}
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="••••••"
                  value={newPin}
                  onChange={(e) => handlePinChange(e.target.value, setNewPin)}
                  onKeyPress={handleKeyPress}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-sm bg-white focus:ring-2 focus:ring-green-400 focus:border-green-400 transition outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPin(!showNewPin)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                >
                  {showNewPin ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                {newPin.length}/6 digit
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-green-600" />
                Konfirmasi PIN Baru
              </label>
              <div className="relative">
                <input
                  type={showConfirmPin ? "text" : "password"}
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="••••••"
                  value={confirmPin}
                  onChange={(e) =>
                    handlePinChange(e.target.value, setConfirmPin)
                  }
                  onKeyPress={handleKeyPress}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-sm bg-white focus:ring-2 focus:ring-green-400 focus:border-green-400 transition outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPin ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                {confirmPin.length}/6 digit
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full rounded-xl py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-500 shadow-lg hover:shadow-green-500/40 hover:from-green-500 hover:to-green-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-6"
            >
              {isSubmitting ? (
                "Memproses..."
              ) : (
                <span className="inline-flex items-center gap-2 justify-center">
                  <Shield className="w-5 h-5" />
                  Ganti PIN
                </span>
              )}
            </button>

            {!isForced && (
              <button
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="w-full rounded-xl py-3 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                Batal
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/60 backdrop-blur rounded-xl border border-green-100">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            💡 Tips Keamanan PIN:
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Gunakan kombinasi angka yang tidak mudah ditebak</li>
            <li>• Jangan gunakan tanggal lahir atau nomor berurutan</li>
            <li>• PIN baru harus berbeda dari PIN lama/default</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

// Component utama yang di-export - WRAP dengan Suspense
export default function ChangePinPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-green-100 to-green-50">
          <div className="text-gray-600">Loading...</div>
        </main>
      }
    >
      <ChangePinForm />
    </Suspense>
  );
}
