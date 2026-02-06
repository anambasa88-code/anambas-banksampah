"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  LayoutDashboard,
  History,
  Users,
  Package,
  DollarSign,
  LogOut,
  X,
  Recycle,
  Building2,
  UserCog,
  TrendingUp,
} from "lucide-react";

export default function Sidebar({ isMobile = false, isOpen = false, onClose }) {
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  // Tambahan 2 state baru biar lengkap
  const [fullName, setFullName] = useState("");
  const [unitName, setUnitName] = useState("");

  useEffect(() => {
    setMounted(true);

    // 1. Ambil data cepat dari localStorage
    setUsername(localStorage.getItem("bs_username") || "User");
    setRole(localStorage.getItem("bs_role") || "");

    // 2. Ambil data lengkap dari API dengan TOKEN
    const fetchProfile = async () => {
      try {
        // Ambil token dari cookie
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("bs_token="))
          ?.split("=")[1];

        const response = await fetch("/api/users/profile", {
          headers: {
            // WAJIB KIRIM INI supaya tidak ditolak Middleware
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Data Profile:", data); // Cek di console F12

          setFullName(data.nama_lengkap);
          setUnitName(data.unit?.nama_unit);
          setRole(data.peran);
          setUsername(data.nickname);
        } else {
          console.error("Gagal fetch profile, status:", response.status);
        }
      } catch (error) {
        console.error("Error Fetching Profile:", error);
      }
    };

    fetchProfile();
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
        {
          icon: LayoutDashboard,
          label: "Dashboard",
          href: "/dashboard/nasabah/dashboard",
        },
        { icon: History, label: "Riwayat", href: "/dashboard/nasabah/riwayat" },
      ];
    }

    if (role === "PETUGAS") {
      return [
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
          icon: TrendingUp,
          label: "Harga Lokal",
          href: "/dashboard/petugas/harga-lokal",
        },
        {
          icon: Package,
          label: "Input Setor",
          href: "/dashboard/petugas/input-setor",
        },
        {
          icon: DollarSign,
          label: "Input Tarik",
          href: "/dashboard/petugas/input-tarik",
        },
        {
          icon: History,
          label: "Riwayat Transaksi",
          href: "/dashboard/petugas/transaksi",
        },
      ];
    }

    if (role === "ADMIN") {
      return [
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
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Anambas
              </p>
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
          <div className="flex flex-col gap-0.5">
            {/* 1. NAMA LENGKAP - Identitas Utama */}
            <p
              className="text-sm font-bold text-gray-800 dark:text-white truncate"
              title={fullName}
            >
              {fullName || "Nama Belum Diatur"}
            </p>

            {/* 2. NICKNAME - Tampil sesuai aslinya (Tanpa Lower Case) */}
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              {username}
            </p>

            {/* 3. ROLE - Badge Peran */}
            <div className="mt-1.5">
              <span className="px-2 py-0.5 text-[9px] font-extrabold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded uppercase tracking-wider">
                {role}
              </span>
            </div>

            {/* 4. UNIT BANK SAMPAH */}
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-gray-500 dark:text-gray-400">
              <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate font-medium italic">
                {unitName || "Unit Pusat"}
              </span>
            </div>
          </div>
        ) : (
          /* Loading Skeleton */
          <div className="space-y-2">
            <div className="h-4 w-40 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-3 w-24 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-3 w-32 bg-gray-100 dark:bg-slate-800 rounded animate-pulse mt-2" />
          </div>
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
