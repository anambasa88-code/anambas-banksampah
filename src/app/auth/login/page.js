"use client";

import { useState, useRef, useEffect } from "react";
import {
  LogIn, Eye, EyeOff, User, Lock, CheckCircle, ShieldCheck, Users, UserCog, Building2, ChevronDown, } from "lucide-react";
import { toast } from "sonner";

const UNITS = [
  { id: 1, prefix: "KBU", nama: "KIABU" },
  { id: 2, prefix: "TLB", nama: "TELAGA BESAR " },
  { id: 3, prefix: "TLK", nama: "TELAGA KECIL" },
  { id: 4, prefix: "LGR", nama: "LANGIR" },
  { id: 5, prefix: "CND", nama: "CANDI" },
  { id: 6, prefix: "KMR", nama: "KUALA MARAS" },
  { id: 7, prefix: "LDK", nama: "LANDAK" },
  { id: 8, prefix: "PSN", nama: "PIASAN" },
  { id: 9, prefix: "BYT", nama: "BAYAT" },
];

const ROLES = [
  { value: "NASABAH", label: "Nasabah", icon: Users, roleCode: "N" },
  { value: "PETUGAS", label: "Petugas", icon: UserCog, roleCode: "P" },
  { value: "ADMIN", label: "Admin", icon: ShieldCheck, roleCode: null },
];

function buildNickname(role, unitPrefix, roleCode, number) {
  if (role === "ADMIN" || !unitPrefix || !number) return "";
  return `${unitPrefix}-${roleCode}-${number.padStart(4, "0")}`;
}

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState("NASABAH");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);
  const [numberInput, setNumberInput] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const dropdownRef = useRef(null);
  const currentRole = ROLES.find((r) => r.value === selectedRole);
  const isAdmin = selectedRole === "ADMIN";

  const nickname = isAdmin
    ? adminUsername.trim()
    : buildNickname(
        selectedRole,
        selectedUnit?.prefix,
        currentRole.roleCode,
        numberInput,
      );

  const nicknameValid = isAdmin
    ? adminUsername.trim().length > 0
    : /^[A-Z]{3}-[NP]-\d{4}$/.test(nickname);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUnitDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setSelectedUnit(null);
    setNumberInput("");
    setAdminUsername("");
    setPin("");
    setUnitDropdownOpen(false);
  };

  const handleSelectUnit = (unit) => {
    setSelectedUnit(unit);
    setUnitDropdownOpen(false);
  };

  const handleNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setNumberInput(val);
  };

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 6) setPin(val);
  };

  const handleSubmit = async () => {
    if (!isAdmin && !selectedUnit) {
      toast.error("Pilih unit bank sampah terlebih dahulu");
      return;
    }
    if (!nicknameValid) {
      toast.error(
        isAdmin ? "Username admin wajib diisi" : "Masukkan 4 digit nomor akun",
      );
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

      document.cookie = `bs_token=${token}; path=/; max-age=${9 * 60 * 60}; SameSite=Lax`;
      localStorage.setItem("bs_token", token);
      localStorage.setItem("bs_role", user.peran);
      localStorage.setItem("bs_username", user.nickname);

      toast.success("Login berhasil!");

      if (user.must_change_pin) {
        setTimeout(() => {
          window.location.href = "/auth/change-pin?forced=true";
        }, 500);
        return;
      }

      setTimeout(() => {
        if (user.peran === "ADMIN")
          window.location.href = "/dashboard/admin/dashboard";
        else if (user.peran === "PETUGAS")
          window.location.href = "/dashboard/petugas/dashboard";
        else window.location.href = "/dashboard/nasabah/dashboard";
      }, 500);
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Terjadi kesalahan koneksi server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
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
          <p className="text-sm text-gray-600 mt-2">Bank Sampah Anambas</p>
        </div>

        <div className="p-8 rounded-3xl border border-green-200 shadow-2xl bg-white space-y-5">
          {/* 1. Pilih Role */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Login Sebagai
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleRoleChange(value)}
                  className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all
                    ${
                      selectedRole === value
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 2a. Custom Dropdown Unit (non-Admin) */}
          {!isAdmin && (
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-green-600" />
                Unit Bank Sampah
              </label>
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUnitDropdownOpen((o) => !o)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm transition-all bg-white
                    ${
                      unitDropdownOpen
                        ? "border-green-500 ring-2 ring-green-100"
                        : selectedUnit
                          ? "border-green-400 text-gray-800"
                          : "border-gray-300 text-gray-400 hover:border-green-300"
                    }`}
                >
                  {selectedUnit ? (
                    <span className="flex items-center gap-2.5 text-gray-800 font-medium">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-700 text-xs font-bold">
                        {selectedUnit.prefix}
                      </span>
                      {selectedUnit.nama}
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      Pilih unit bank sampah...
                    </span>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${unitDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown list */}
                {unitDropdownOpen && (
                  <div className="absolute z-20 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    <div className="max-h-56 overflow-y-auto py-1">
                      {UNITS.map((unit) => (
                        <button
                          key={unit.id}
                          type="button"
                          onClick={() => handleSelectUnit(unit)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-green-50 transition-colors text-left
                            ${selectedUnit?.id === unit.id ? "bg-green-50" : ""}`}
                        >
                          <span
                            className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-xs font-bold flex-shrink-0
                            ${
                              selectedUnit?.id === unit.id
                                ? "bg-green-500 text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {unit.prefix}
                          </span>
                          <span
                            className={`font-medium ${selectedUnit?.id === unit.id ? "text-green-700" : "text-gray-700"}`}
                          >
                            {unit.nama}
                          </span>
                          {selectedUnit?.id === unit.id && (
                            <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2b. Nomor Akun (non-Admin) */}
          {!isAdmin && (
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-green-600" />
                Nomor Akun
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-mono font-semibold text-gray-500 min-w-[108px] text-center">
                  {selectedUnit
                    ? `${selectedUnit.prefix}-${currentRole.roleCode}-`
                    : "???-?-"}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0001"
                  value={numberInput}
                  onChange={handleNumberChange}
                  onKeyPress={handleKeyPress}
                  maxLength={4}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-mono bg-white focus:ring-2 focus:ring-green-400 focus:border-green-400 transition outline-none"
                />
              </div>
              <p className="text-xs mt-1.5">
                {nicknameValid ? (
                  <span className="text-green-600 font-semibold">
                     Nickname: {nickname}
                  </span>
                ) : (
                  <span className="text-gray-400">
                    {!selectedUnit
                      ? "Pilih unit dahulu"
                      : "Masukkan 4 digit nomor akun"}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* 2c. Username Admin */}
          {isAdmin && (
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-green-600" />
                Username Admin
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Masukkan username admin"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoComplete="username"
                  maxLength={30}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-10 text-sm bg-white focus:ring-2 focus:ring-green-400 focus:border-green-400 transition outline-none"
                />
                {nicknameValid && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
            </div>
          )}

          {/* 3. PIN */}
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
              <button
                type="button"
                onClick={() => setShowPin((p) => !p)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
              >
                {showPin ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1.5">{pin.length}/6 digit</p>
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
                Masuk sebagai {currentRole.label}
              </span>
            )}
          </button>

          <div className="text-center text-xs text-gray-500">
            Kembali ke{" "}
            <a href="/" className="text-green-600 hover:underline font-medium">
              halaman utama
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          © {new Date().getFullYear()} Bank Sampah Anambas. All rights reserved.
        </p>
      </div>
    </main>
  );
}
