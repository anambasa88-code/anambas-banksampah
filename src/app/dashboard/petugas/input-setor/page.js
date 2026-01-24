"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Search,
  Package,
  Save,
  Users,
  Trash2,
  DollarSign,
  Scale,
  AlertCircle
} from "lucide-react";

export default function InputSetorPage() {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // Master Data
  const [nasabahList, setNasabahList] = useState([]);
  const [barangList, setBarangList] = useState([]);
  
  // Search States
  const [searchNasabah, setSearchNasabah] = useState("");
  const [filteredNasabah, setFilteredNasabah] = useState([]);
  const [showNasabahDropdown, setShowNasabahDropdown] = useState(false);
  
  // Form Data
  const [formData, setFormData] = useState({
    nasabah_id: null,
    nasabah_name: "",
    barang_id: null,
    berat: "",
    tipe_harga: "SISTEM", // SISTEM, LOKAL, CUSTOM
    harga_manual: "",
    tipe_setoran: "COMMUNITY",
    metode_bayar: "TABUNG",
    catatan: ""
  });
  
  const [selectedBarang, setSelectedBarang] = useState(null);

  useEffect(() => {
    fetchMasterData();
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

  const fetchMasterData = async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem("bs_token");

      const [nasabahRes, barangRes] = await Promise.all([
        fetch("/api/users/petugas/daftar-nasabah?limit=100", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch("/api/users/petugas/master-sampah", {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const nasabahData = await nasabahRes.json();
      const barangData = await barangRes.json();

      const listNasabah = nasabahData.data?.data || nasabahData.data || [];
      const listBarang = barangData.data?.data || barangData.data || [];

      setNasabahList(listNasabah);
      setBarangList(listBarang);
      setFilteredNasabah(listNasabah.slice(0, 10));
      
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data master");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSelectNasabah = (nasabah) => {
    setFormData(prev => ({
      ...prev,
      nasabah_id: nasabah.id_user,
      nasabah_name: nasabah.nama_lengkap
    }));
    setSearchNasabah(nasabah.nama_lengkap);
    setShowNasabahDropdown(false);
  };

  const handleSelectBarang = (e) => {
    const barangId = parseInt(e.target.value);
    const barang = barangList.find(b => b.id_barang === barangId);
    
    setFormData(prev => ({ 
      ...prev, 
      barang_id: barangId,
      harga_manual: "" // Reset harga manual saat ganti barang
    }));
    setSelectedBarang(barang);
  };

  const getHargaToUse = () => {
    if (!selectedBarang) return 0;
    
    if (formData.tipe_harga === "SISTEM") {
      return Number(selectedBarang.harga_aktif);
    } else if (formData.tipe_harga === "LOKAL") {
      return Number(selectedBarang.harga_lokal || selectedBarang.harga_aktif);
    } else if (formData.tipe_harga === "CUSTOM") {
      return Number(formData.harga_manual) || 0;
    }
    return 0;
  };

  const calculateTotal = () => {
    if (!formData.berat || !selectedBarang) return 0;
    const berat = parseFloat(formData.berat);
    const harga = getHargaToUse();
    return berat * harga;
  };

  const isHargaCustomValid = () => {
    if (!selectedBarang || formData.tipe_harga !== "CUSTOM") return true;
    if (!formData.harga_manual) return false;
    
    const hargaCustom = Number(formData.harga_manual);
    const hargaMin = Number(selectedBarang.batas_bawah);
    const hargaMax = Number(selectedBarang.batas_atas);
    
    return hargaCustom >= hargaMin && hargaCustom <= hargaMax;
  };

  const getHargaBatas = () => {
    if (!selectedBarang) return { min: 0, max: 0 };
    
    return {
      min: Number(selectedBarang.batas_bawah) || 0,
      max: Number(selectedBarang.batas_atas) || 0
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi
    if (!formData.nasabah_id) {
      toast.error("Pilih nasabah terlebih dahulu");
      return;
    }
    if (!formData.barang_id) {
      toast.error("Pilih jenis sampah");
      return;
    }
    if (!formData.berat || parseFloat(formData.berat) <= 0) {
      toast.error("Masukkan berat sampah yang valid");
      return;
    }
    if (formData.tipe_harga === "CUSTOM" && !isHargaCustomValid()) {
      toast.error("Harga custom harus berada dalam batas minimal dan maksimal");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("bs_token");

      const payload = {
        nasabah_id: formData.nasabah_id,
        barang_id: formData.barang_id,
        berat: parseFloat(formData.berat),
        tipe_harga: formData.tipe_harga,
        harga_manual: formData.tipe_harga === "CUSTOM" ? Number(formData.harga_manual) : 0,
        tipe_setoran: formData.tipe_setoran,
        metode_bayar: formData.metode_bayar,
        catatan_petugas: formData.catatan || ""
      };  

       console.log('📤 Payload yang dikirim:', payload); // ← TAMBAH INI

      const res = await fetch("/api/transaksi/setor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan setoran");
      }

      toast.success("Setoran berhasil dicatat!");
      
      // Reset form
      setFormData({
        nasabah_id: null,
        nasabah_name: "",
        barang_id: null,
        berat: "",
        tipe_harga: "SISTEM",
        harga_manual: "",
        tipe_setoran: "COMMUNITY",
        metode_bayar: "TABUNG",
        catatan: ""
      });
      setSearchNasabah("");
      setSelectedBarang(null);
      
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
            <Package className="w-8 h-8 text-green-600 dark:text-green-400" />
            Input Setor Sampah
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Catat transaksi setoran sampah nasabah
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card Form */}
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
                        <p className="font-medium text-gray-900 dark:text-white">
                          {nasabah.nama_lengkap}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {nasabah.nickname} • {nasabah.nik || "NIK -"}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Jenis Sampah */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Trash2 className="w-4 h-4 inline mr-2" />
                Jenis Sampah
              </label>
              <select
                value={formData.barang_id || ""}
                onChange={handleSelectBarang}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                <option value="">Pilih jenis sampah</option>
                {barangList.map((barang) => (
                  <option key={barang.id_barang} value={barang.id_barang}>
                    {barang.nama_barang} - {formatRupiah(barang.harga_aktif)}/kg
                  </option>
                ))}
              </select>
            </div>

            {/* Tipe Harga */}
            {selectedBarang && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Tipe Harga
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tipe_harga: "SISTEM", harga_manual: "" }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.tipe_harga === "SISTEM"
                        ? "border-green-600 bg-green-50 dark:bg-green-900/30"
                        : "border-gray-300 dark:border-slate-600 hover:border-green-400"
                    }`}
                  >
                    <p className="font-semibold text-gray-800 dark:text-white">Harga Sistem</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
                      {formatRupiah(selectedBarang.harga_aktif)}
                    </p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tipe_harga: "LOKAL", harga_manual: "" }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.tipe_harga === "LOKAL"
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30"
                        : "border-gray-300 dark:border-slate-600 hover:border-blue-400"
                    }`}
                  >
                    <p className="font-semibold text-gray-800 dark:text-white">Harga Lokal</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {formatRupiah(selectedBarang.harga_lokal || selectedBarang.harga_aktif)}
                    </p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tipe_harga: "CUSTOM" }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.tipe_harga === "CUSTOM"
                        ? "border-orange-600 bg-orange-50 dark:bg-orange-900/30"
                        : "border-gray-300 dark:border-slate-600 hover:border-orange-400"
                    }`}
                  >
                    <p className="font-semibold text-gray-800 dark:text-white">Harga Custom</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Input manual
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Input Harga Custom */}
            {formData.tipe_harga === "CUSTOM" && selectedBarang && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Input Harga Custom (per kg)
                </label>
                <input
                  type="number"
                  step="1"
                  min={getHargaBatas().min}
                  max={getHargaBatas().max}
                  placeholder="Masukkan harga..."
                  value={formData.harga_manual}
                  onChange={(e) => setFormData(prev => ({ ...prev, harga_manual: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white ${
                    !isHargaCustomValid() 
                      ? "border-red-500 focus:ring-red-500" 
                      : "border-gray-300 dark:border-slate-600 focus:ring-orange-500"
                  }`}
                />
                <div className="mt-2 flex items-start gap-2 text-sm">
                  <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    !isHargaCustomValid() ? "text-red-500" : "text-gray-500 dark:text-gray-400"
                  }`} />
                  <p className={!isHargaCustomValid() ? "text-red-500" : "text-gray-500 dark:text-gray-400"}>
                    Batas harga: {formatRupiah(getHargaBatas().min)} - {formatRupiah(getHargaBatas().max)}
                  </p>
                </div>
              </div>
            )}

            {/* Berat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Scale className="w-4 h-4 inline mr-2" />
                Berat (kg)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.berat}
                onChange={(e) => setFormData(prev => ({ ...prev, berat: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Tipe Setoran */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipe Setoran
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tipe_setoran: "COMMUNITY" }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.tipe_setoran === "COMMUNITY"
                      ? "border-green-600 bg-green-50 dark:bg-green-900/30"
                      : "border-gray-300 dark:border-slate-600 hover:border-green-400"
                  }`}
                >
                  <p className="font-semibold text-gray-800 dark:text-white">Community</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sampah komunitas</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tipe_setoran: "OCEAN_DEBRIS" }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.tipe_setoran === "OCEAN_DEBRIS"
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30"
                      : "border-gray-300 dark:border-slate-600 hover:border-blue-400"
                  }`}
                >
                  <p className="font-semibold text-gray-800 dark:text-white">Ocean Debris</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sampah laut</p>
                </button>
              </div>
            </div>

            {/* Metode Bayar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, metode_bayar: "TABUNG" }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.metode_bayar === "TABUNG"
                      ? "border-green-600 bg-green-50 dark:bg-green-900/30"
                      : "border-gray-300 dark:border-slate-600 hover:border-green-400"
                  }`}
                >
                  <p className="font-semibold text-gray-800 dark:text-white">Tabung</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Masuk ke saldo</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, metode_bayar: "JUAL_LANGSUNG" }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.metode_bayar === "JUAL_LANGSUNG"
                      ? "border-orange-600 bg-orange-50 dark:bg-orange-900/30"
                      : "border-gray-300 dark:border-slate-600 hover:border-orange-400"
                  }`}
                >
                  <p className="font-semibold text-gray-800 dark:text-white">Jual Langsung</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Bayar tunai</p>
                </button>
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Catatan (Opsional)
              </label>
              <textarea
                value={formData.catatan}
                onChange={(e) => setFormData(prev => ({ ...prev, catatan: e.target.value }))}
                rows={3}
                placeholder="Tambahkan catatan..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Total */}
            {selectedBarang && formData.berat && (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Nilai
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatRupiah(calculateTotal())}
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.berat} kg × {formatRupiah(getHargaToUse())}/kg
                  {formData.tipe_harga === "CUSTOM" && !isHargaCustomValid() && (
                    <span className="text-red-500 ml-2">⚠️ Harga diluar batas!</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || (formData.tipe_harga === "CUSTOM" && !isHargaCustomValid())}
            className="w-full py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {loading ? "Menyimpan..." : "Simpan Setoran"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}