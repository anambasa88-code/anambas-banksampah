"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Search,
  Wallet,
  Save,
  Users,
  DollarSign,
  AlertCircle
} from "lucide-react";

export default function InputTarikPage() {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // Master Data
  const [nasabahList, setNasabahList] = useState([]);
  
  // Search States
  const [searchNasabah, setSearchNasabah] = useState("");
  const [filteredNasabah, setFilteredNasabah] = useState([]);
  const [showNasabahDropdown, setShowNasabahDropdown] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState({
    nasabah_id: null,
    nasabah_name: "",
    saldo_nasabah: 0,
    jumlah_tarik: "",
    catatan_tarik: ""
  });
  
  const [displayJumlah, setDisplayJumlah] = useState("");

  useEffect(() => {
    fetchNasabahList();
  }, []);

  useEffect(() => {
    if (searchNasabah) {
      const filtered = nasabahList.filter(n => 
        n.nama_lengkap.toLowerCase().includes(searchNasabah.toLowerCase()) ||
        n.nickname.toLowerCase().includes(searchNasabah.toLowerCase()) ||
        (n.nik && n.nik.includes(searchNasabah))
      );
      setFilteredNasabah(filtered);
    } else {
      setFilteredNasabah(nasabahList.slice(0, 10));
    }
  }, [searchNasabah, nasabahList]);

  const fetchNasabahList = async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem("bs_token");

      const res = await fetch("/api/users/petugas/daftar-nasabah?limit=100", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error("Gagal memuat data nasabah");
      }

      const data = await res.json();
      setNasabahList(data.data || []);
      setFilteredNasabah((data.data || []).slice(0, 10));
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data nasabah");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSelectNasabah = (nasabah) => {
    setFormData(prev => ({
      ...prev,
      nasabah_id: nasabah.id_user,
      nasabah_name: nasabah.nama_lengkap,
      saldo_nasabah: nasabah.total_saldo || 0
    }));
    setSearchNasabah(nasabah.nama_lengkap);
    setShowNasabahDropdown(false);
  };

  const formatRupiahInput = (value) => {
    const number = value.replace(/[^0-9]/g, "");
    if (!number) return "";
    return new Intl.NumberFormat("id-ID").format(number);
  };

  const parseRupiahToNumber = (value) => {
    return parseInt(value.replace(/\./g, "")) || 0;
  };

  const handleJumlahChange = (e) => {
    const formatted = formatRupiahInput(e.target.value);
    setDisplayJumlah(formatted);
    setFormData(prev => ({ 
      ...prev, 
      jumlah_tarik: parseRupiahToNumber(formatted) 
    }));
  };

  const handleSubmit = async () => {
    // Validasi
    if (!formData.nasabah_id) {
      toast.error("Pilih nasabah terlebih dahulu");
      return;
    }
    if (!formData.jumlah_tarik || formData.jumlah_tarik <= 0) {
      toast.error("Masukkan jumlah penarikan yang valid");
      return;
    }
    if (formData.jumlah_tarik > formData.saldo_nasabah) {
      toast.error("Jumlah penarikan melebihi saldo nasabah");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("bs_token");

      const payload = {
        nasabah_id: formData.nasabah_id,
        jumlah_tarik: formData.jumlah_tarik,
        catatan_tarik: formData.catatan_tarik || ""
      };

      const res = await fetch("/api/transaksi/tarik", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal melakukan penarikan");
      }

      toast.success("Penarikan berhasil dicatat!");
      
      // Reset form
      setFormData({
        nasabah_id: null,
        nasabah_name: "",
        saldo_nasabah: 0,
        jumlah_tarik: "",
        catatan_tarik: ""
      });
      setSearchNasabah("");
      setDisplayJumlah("");
      
      // Refresh nasabah list untuk update saldo
      fetchNasabahList();
      
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  if (loadingData) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 dark:bg-slate-800 rounded" />
            <div className="h-96 bg-gray-100 dark:bg-slate-800 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Wallet className="w-8 h-8 text-green-600 dark:text-green-400" />
            Input Tarik Saldo
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Proses penarikan saldo nasabah
          </p>
        </div>

        {/* Card Form */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-6">
            
            {/* Pilih Nasabah */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Nasabah
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau NIK nasabah..."
                  value={searchNasabah}
                  onChange={(e) => setSearchNasabah(e.target.value)}
                  onFocus={() => setShowNasabahDropdown(true)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>
              
              {showNasabahDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredNasabah.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      Nasabah tidak ditemukan
                    </div>
                  ) : (
                    filteredNasabah.map((nasabah) => (
                      <button
                        key={nasabah.id_user}
                        type="button"
                        onClick={() => handleSelectNasabah(nasabah)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 border-b border-gray-100 dark:border-slate-700 last:border-0"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {nasabah.nama_lengkap}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {nasabah.nickname} • {nasabah.nik || "NIK -"}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {formatRupiah(nasabah.total_saldo || 0)}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Saldo Info */}
            {formData.nasabah_id && (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Saldo Saat Ini
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatRupiah(formData.saldo_nasabah)}
                  </p>
                </div>
              </div>
            )}

            {/* Jumlah Tarik */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Jumlah Penarikan
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                  Rp
                </span>
                <input
                  type="text"
                  placeholder="0"
                  value={displayJumlah}
                  onChange={handleJumlahChange}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                />
              </div>
              {formData.jumlah_tarik > 0 && formData.saldo_nasabah > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Sisa saldo: {formatRupiah(formData.saldo_nasabah - formData.jumlah_tarik)}
                </p>
              )}
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Catatan (Opsional)
              </label>
              <textarea
                value={formData.catatan_tarik}
                onChange={(e) => setFormData(prev => ({ ...prev, catatan_tarik: e.target.value }))}
                rows={3}
                placeholder="Tambahkan catatan penarikan..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Warning */}
            {formData.jumlah_tarik > 0 && formData.jumlah_tarik > formData.saldo_nasabah && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  Jumlah penarikan melebihi saldo nasabah!
                </p>
              </div>
            )}

            {/* Total Preview */}
            {formData.jumlah_tarik > 0 && formData.jumlah_tarik <= formData.saldo_nasabah && (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Jumlah Ditarik
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatRupiah(formData.jumlah_tarik)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !formData.nasabah_id || formData.jumlah_tarik > formData.saldo_nasabah || formData.jumlah_tarik <= 0}
            className="w-full py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {loading ? "Memproses..." : "Proses Penarikan"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}