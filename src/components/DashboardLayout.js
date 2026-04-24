"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Menu, Recycle } from "lucide-react";

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "",
    username: "",
    role:     "",
    unitName: "",
  });

  useEffect(() => {
    // Ambil cepat dari localStorage dulu
    setProfile((p) => ({
      ...p,
      username: localStorage.getItem("bs_username") || "",
      role:     localStorage.getItem("bs_role")     || "",
    }));

    // Lalu fetch lengkap dari API
    const fetchProfile = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("bs_token="))
          ?.split("=")[1];

        const res = await fetch("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setProfile({
            fullName: data.nama_lengkap  || "",
            username: data.nickname       || "",
            role:     data.peran          || "",
            unitName: data.unit?.nama_unit || "",
          });
        }
      } catch (err) {
        console.error("Gagal fetch profile:", err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar isMobile={false} profile={profile} />
      </div>

      {/* Mobile Sidebar Drawer */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <Sidebar
              isMobile={true}
              isOpen={isSidebarOpen}
              onClose={() => setSidebarOpen(false)}
              profile={profile}
            />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open Menu"
            >
              <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </button>

            {/* ✅ Nama unit dinamis */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Recycle className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-bold text-slate-800 dark:text-white leading-tight">
                  {profile.unitName || "Bank Sampah"}
                </p>
                {profile.role && (
                  <p className="text-[9px] font-semibold text-emerald-600 uppercase tracking-wider leading-tight">
                    {profile.role}
                  </p>
                )}
              </div>
            </div>

            {/* Spacer */}
            <div className="w-9" />
          </div>
        </div>

        <main className="flex-1 overflow-x-auto">
          {children}
        </main>

      </div>
    </div>
  );
}
