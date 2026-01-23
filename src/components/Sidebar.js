"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { LayoutDashboard, History, Users, Package, DollarSign, LogOut, X, Recycle, Building2, UserCog, TrendingUp } from "lucide-react";

export default function Sidebar({ isMobile = false, isOpen = false, onClose }) {
  const pathname = usePathname();
  
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    setMounted(true);
    setUsername(localStorage.getItem("bs_username") || "User");
    setRole(localStorage.getItem("bs_role") || "NASABAH");
  }, []);

 const handleLogout = () => {
  toast.warning("Yakin ingin keluar?", {
    action: {
      label: "Ya, Keluar",
      onClick: () => {
        // Clear cookie
        document.cookie = "bs_token=; path=/; max-age=0";
        localStorage.clear();
        toast.success("Berhasil logout");
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 300);
      },
    },
    cancel: {
      label: "Batal",
      onClick: () => {},
    },
    duration: 5000,
  });
};

  const getMenuByRole = () => {
    if (role === "NASABAH") {
      return [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/nasabah/dashboard" },
        { icon: History, label: "Riwayat", href: "/dashboard/nasabah/riwayat" },
      ];
    }

  if (role === "PETUGAS") {
      return [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/petugas/dashboard" },
        { icon: Users, label: "Daftar Nasabah", href: "/dashboard/petugas/daftar-nasabah" },
        { icon: TrendingUp, label: "Harga Lokal", href: "/dashboard/petugas/harga-lokal" },
        { icon: Package, label: "Input Setor", href: "/dashboard/petugas/input-setor" },
        { icon: DollarSign, label: "Input Tarik", href: "/dashboard/petugas/input-tarik" },
        { icon: History, label: "Riwayat Transaksi", href: "/dashboard/petugas/transaksi" },
      ];
    }

    if (role === "ADMIN") {
      return [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/admin/dashboard" },
         { icon: Users, label: "Daftar Petugas", href: "/dashboard/admin/daftar-petugas" },
        { icon: Recycle, label: "Master Sampah", href: "/dashboard/admin/master-sampah" },
        { icon: Building2, label: "Unit Bank Sampah", href: "/dashboard/admin/unit-bank-sampah" },
      ];
    }

    return [];
  };

  const menuItems = getMenuByRole();

  const sidebarClasses = isMobile
    ? `w-64 h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col shadow-xl transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`
    : "w-64 h-screen bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col sticky top-0";

  return (
    <aside className={sidebarClasses}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800 dark:text-white">
                Bank Sampah
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Anambas</p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close Menu"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800">
        {mounted ? (
          <>
            <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
              {username}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {role}
            </p>
          </>
        ) : (
          <>
            <div className="h-5 w-32 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-200 dark:bg-slate-800 rounded animate-pulse mt-1" />
          </>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <a
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${
                  isActive
                    ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                }
              `}
              onClick={isMobile ? onClose : undefined}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Footer - Logout */}
      <div className="p-3 border-t border-gray-200 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Keluar</span>
        </button>
      </div>
    </aside>
  );
}