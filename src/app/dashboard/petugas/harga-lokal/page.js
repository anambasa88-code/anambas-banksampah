"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
// Import modal baru
import HargaLokalModal from "@/components/HargaLokalModal";
import {
  DollarSign,
  Edit,
  Search,
} from "lucide-react";

const CATEGORIES = [
  { value: "SEMUA", label: "Semua Kategori", color: "slate" },
  { value: "PLASTIK", label: "Plastik", color: "blue" },
  { value: "LOGAM", label: "Logam", color: "gray" },
  { value: "KERTAS", label: "Kertas", color: "yellow" },
  { value: "LAINNYA", label: "Lainnya", color: "purple" },
  { value: "CAMPURAN", label: "Campuran", color: "green" },
];

export default function HargaLokalPage() {
  const [loading, setLoading] = useState(true);
  const [masterData, setMasterData] = useState([]);
  const [hargaLokalData, setHargaLokalData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("SEMUA");

  // State baru untuk Modal
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
    } catch (err) {
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
        const matchCategory = activeTab === "SEMUA" || item.kategori_utama === activeTab;
        const matchSearch = item.nama_barang?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCategory && matchSearch;
      })
    : [];

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 animate-pulse space-y-4">
          <div className="h-10 w-48 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-100 rounded-xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              Harga Lokal Unit
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Atur harga beli sampah khusus unit Anda sesuai batas yang ditentukan pusat.
            </p>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveTab(cat.value)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === cat.value
                    ? "bg-green-600 text-white shadow-md shadow-green-200"
                    : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 hover:bg-gray-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari barang sampah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                  <th className="px-6 py-4 text-center w-16">No</th>
                  <th className="px-6 py-4">Barang</th>
                  <th className="px-6 py-4 text-center">Kategori</th>
                  <th className="px-6 py-4 text-right">Harga Pusat</th>
                  <th className="px-6 py-4 text-right bg-blue-50/30 dark:bg-blue-900/5">Batas Bawah</th>
                  <th className="px-6 py-4 text-right bg-blue-50/30 dark:bg-blue-900/5">Batas Atas</th>
                  <th className="px-6 py-4 text-right font-bold text-green-700 dark:text-green-400">Harga Lokal</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500 italic">
                      Data tidak ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => {
                    const lokal = hargaLokalData.find((h) => h.barang_id === item.id_barang);
                    return (
                      <tr key={item.id_barang} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 text-center text-gray-400 font-medium">{index + 1}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{item.nama_barang}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-[10px] font-black uppercase">
                            {item.kategori_utama}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-500 italic">{formatRupiah(item.harga_pusat)}</td>
                        <td className="px-6 py-4 text-right text-red-500/80 bg-blue-50/10 dark:bg-blue-900/5 font-medium">{formatRupiah(item.batas_bawah)}</td>
                        <td className="px-6 py-4 text-right text-blue-500/80 bg-blue-50/10 dark:bg-blue-900/5 font-medium">{formatRupiah(item.batas_atas)}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-black ${lokal ? "text-green-600" : "text-gray-300"}`}>
                            {lokal ? formatRupiah(lokal.harga_lokal) : "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleOpenModal(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
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
        </div>
      </div>

      {/* Render Modal */}
      <HargaLokalModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        barang={selectedBarang}
        currentLokal={hargaLokalData.find(h => h.barang_id === selectedBarang?.id_barang)?.harga_lokal}
      />
    </DashboardLayout>
  );
}