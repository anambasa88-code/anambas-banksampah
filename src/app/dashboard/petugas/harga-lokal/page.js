"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import HargaLokalModal from "@/components/petugas/harga-lokal/HargaLokalModal";
import {
  Tag,
  Edit,
  Search,
  LayoutGrid,
  Recycle,
  Wrench,
  FileText,
  Package,
  Layers,
} from "lucide-react";

const CATEGORIES = [
  { value: "SEMUA", label: "Semua", icon: LayoutGrid },
  { value: "PLASTIK", label: "Plastik", icon: Recycle },
  { value: "KERTAS", label: "Kertas", icon: FileText },
  { value: "LOGAM", label: "Logam", icon: Wrench },
  { value: "LAINNYA", label: "Lainnya", icon: Layers },
  { value: "CAMPURAN", label: "Campuran", icon: Package },
   // ← tambah ini
];

const CATEGORY_COLORS = {
  PLASTIK: "bg-blue-50 text-blue-600",
  KERTAS: "bg-amber-50 text-amber-600",
  LOGAM: "bg-slate-100 text-slate-600",
  LAINNYA: "bg-orange-50 text-orange-600",
  CAMPURAN: "bg-purple-50 text-purple-600",
  // ← tambah ini
};

export default function HargaLokalPage() {
  const [loading, setLoading] = useState(true);
  const [masterData, setMasterData] = useState([]);
  const [hargaLokalData, setHargaLokalData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("SEMUA");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bs_token");
      const [masterRes, lokalRes] = await Promise.all([
        fetch("/api/users/petugas/master-sampah", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/users/petugas/harga-lokal", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const masterJson = await masterRes.json();
      const lokalJson = await lokalRes.json();
      setMasterData(masterJson.data?.data || masterJson.data || []);
      setHargaLokalData(lokalJson.data || []);
    } catch {
      toast.error("Gagal memuat data harga");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (barang) => {
    setSelectedBarang(barang);
    setIsModalOpen(true);
  };
  const handleCloseModal = (refresh) => {
    setIsModalOpen(false);
    setSelectedBarang(null);
    if (refresh === true) fetchData();
  };

  const filteredData = Array.isArray(masterData)
    ? masterData.filter((item) => {
        const matchCategory =
          activeTab === "SEMUA" || item.kategori_utama === activeTab;
        const matchSearch = item.nama_barang
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        return matchCategory && matchSearch;
      })
    : [];

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-slate-100 rounded-xl" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-xl">
            <Tag className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-[16px] font-semibold text-slate-800">
              Harga Lokal Unit
            </h1>
            <p className="text-[11px] font-normal text-slate-500 mt-0.5">
              Atur harga beli sampah khusus unit sesuai batas yang ditentukan
              pusat.
            </p>
          </div>
        </div>

        {/* Category Tabs + Search */}
        <div className="space-y-3">
          <div className="flex gap-1 overflow-x-auto no-scrollbar bg-slate-100 p-1 rounded-xl">
            {CATEGORIES.map(({ value, label, icon: Icon }) => {
              const isActive = activeTab === value;
              return (
                <button
                  key={value}
                  onClick={() => setActiveTab(value)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "bg-white text-emerald-700 font-semibold shadow-sm"
                      : "text-slate-500 font-medium hover:text-slate-700"
                  }`}
                >
                  <Icon size={11} />
                  {label}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Cari nama barang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[13px] text-slate-700 placeholder:text-slate-400 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-center text-[10px] font-medium text-slate-500 w-12">
                    No
                  </th>
                  <th className="px-5 py-3 text-[10px] font-medium text-slate-500">
                    Barang
                  </th>
                  <th className="px-5 py-3 text-center text-[10px] font-medium text-slate-500">
                    Kategori
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-medium text-slate-500">
                    Harga Pusat
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-medium text-slate-500">
                    Batas Bawah
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-medium text-slate-500">
                    Batas Atas
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-semibold text-emerald-600">
                    Harga Lokal
                  </th>
                  <th className="px-5 py-3 text-center text-[10px] font-medium text-slate-500">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-12 text-center text-[12px] font-medium text-slate-400"
                    >
                      Data tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => {
                    const lokal = hargaLokalData.find(
                      (h) => h.barang_id === item.id_barang,
                    );
                    return (
                      <tr
                        key={item.id_barang}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-5 py-3.5 text-center text-[12px] font-normal text-slate-500">
                          {index + 1}
                        </td>
                        <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-800">
                          {item.nama_barang}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium ${CATEGORY_COLORS[item.kategori_utama] || "bg-slate-100 text-slate-600"}`}
                          >
                            {item.kategori_utama}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-[12px] font-normal text-slate-500">
                          {formatRupiah(item.harga_pusat)}
                        </td>
                        <td className="px-5 py-3.5 text-right text-[12px] font-medium text-red-500">
                          {formatRupiah(item.batas_bawah)}
                        </td>
                        <td className="px-5 py-3.5 text-right text-[12px] font-medium text-blue-500">
                          {formatRupiah(item.batas_atas)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span
                            className={`text-[13px] font-semibold ${lokal ? "text-emerald-600" : "text-slate-300"}`}
                          >
                            {lokal ? formatRupiah(lokal.harga_lokal) : "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleOpenModal(item)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                              title="Edit Harga"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          {filteredData.length > 0 && (
            <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50">
              <p className="text-[10px] font-medium text-slate-500">
                {filteredData.length} barang tersedia
              </p>
            </div>
          )}
        </div>
      </div>

      <HargaLokalModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        barang={selectedBarang}
        currentLokal={
          hargaLokalData.find((h) => h.barang_id === selectedBarang?.id_barang)
            ?.harga_lokal
        }
      />
    </DashboardLayout>
  );
}
