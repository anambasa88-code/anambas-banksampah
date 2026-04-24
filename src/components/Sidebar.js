"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  LayoutDashboard,
  History,
  Users,
  Wallet,
  LogOut,
  X,
  Recycle,
  Building2,
} from "lucide-react";

const MENU_BY_ROLE = {
  NASABAH: [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard/nasabah/dashboard",
    },
    { icon: History, label: "Riwayat", href: "/dashboard/nasabah/riwayat" },
  ],
  PETUGAS: [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard/petugas/dashboard",
    },
    {
      icon: Users,
      label: "Daftar Nasabah",
      href: "/dashboard/petugas/daftar-nasabah",
    },
    {
      icon: Wallet,
      label: "Harga Lokal",
      href: "/dashboard/petugas/harga-lokal",
    },
    {
      icon: History,
      label: "Riwayat Transaksi",
      href: "/dashboard/petugas/transaksi",
    },
  ],
  ADMIN: [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard/admin/dashboard",
    },
    {
      icon: Users,
      label: "Daftar Petugas",
      href: "/dashboard/admin/daftar-petugas",
    },
    {
      icon: Recycle,
      label: "Master Sampah",
      href: "/dashboard/admin/master-sampah",
    },
    {
      icon: Building2,
      label: "Unit Bank Sampah",
      href: "/dashboard/admin/unit-bank-sampah",
    },
  ],
};

export default function Sidebar({
  isMobile = false,
  isOpen = false,
  onClose,
  profile = {},
}) {
  const pathname = usePathname();
  const { fullName, username, role, unitName } = profile;
  const menuItems = MENU_BY_ROLE[role] || [];

  const handleLogout = () => {
    toast.warning("Yakin ingin keluar?", {
      action: {
        label: "Ya, Keluar",
        onClick: () => {
          document.cookie = "bs_token=; path=/; max-age=0";
          localStorage.clear();
          toast.success("Berhasil logout");
          setTimeout(() => {
            window.location.href = "/auth/login";
          }, 300);
        },
      },
      cancel: { label: "Batal", onClick: () => {} },
      duration: 5000,
    });
  };

  const sidebarClasses = isMobile
    ? `w-64 h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col shadow-xl transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`
    : "w-64 h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col sticky top-0";

  return (
    <aside className={sidebarClasses}>
      {/* Logo & Unit Name */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
              <Recycle className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[13px] font-bold text-slate-800 dark:text-white leading-tight truncate">
                {/* ✅ Nama unit dinamis */}
                {unitName || "Bank Sampah"}
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Sistem Pengelolaan
              </p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800">
        {fullName ? (
          <div className="space-y-0.5">
            <p
              className="text-[13px] font-bold text-slate-800 dark:text-white truncate"
              title={fullName}
            >
              {fullName}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {username}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md uppercase tracking-wider">
                {role}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Building2 className="w-3 h-3" />
                <span className="truncate max-w-[100px] italic">
                  {unitName || "Unit Pusat"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 w-36 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-3 w-28 bg-slate-100 dark:bg-slate-800 rounded mt-2" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={isMobile ? onClose : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[13px] ${
                isActive
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-200 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-[13px] font-medium"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
