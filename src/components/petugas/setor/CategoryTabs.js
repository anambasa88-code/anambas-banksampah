"use client";
import { LayoutGrid, Recycle, FileText, Wrench, Package, Layers } from "lucide-react";

const CATEGORIES = ["SEMUA", "PLASTIK", "KERTAS", "LOGAM", "LAINNYA", "CAMPURAN"];

const CATEGORY_ICON = {
  SEMUA:    LayoutGrid,
  PLASTIK:  Recycle,
  KERTAS:   FileText,
  LOGAM:    Wrench,
  LAINNYA:  Layers,   // ← tambah ini
  CAMPURAN: Package,
};

export default function CategoryTabs({ activeCategory, onCategoryChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto no-scrollbar bg-slate-100 p-1 rounded-xl">
      {CATEGORIES.map((cat) => {
        const Icon = CATEGORY_ICON[cat];
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-all duration-200 whitespace-nowrap ${
              isActive
                ? "bg-white text-emerald-700 font-semibold shadow-sm"
                : "text-slate-400 font-medium hover:text-slate-600"
            }`}
          >
            <Icon size={11} />
            {cat}
          </button>
        );
      })}
    </div>
  );
}
