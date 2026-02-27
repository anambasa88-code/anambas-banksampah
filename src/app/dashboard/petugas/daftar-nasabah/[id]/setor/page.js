"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import ConfirmSetorModal from "@/components/ConfirmSetorModal";
import {
  ArrowLeft,
  Search,
  Trash2,
  Plus,
  ShoppingCart,
  MessageSquare,
} from "lucide-react";

const CATEGORIES = ["SEMUA", "PLASTIK", "KERTAS", "LOGAM", "CAMPURAN"];

export default function InputSetorPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [nasabah, setNasabah] = useState(null);
  const [barangList, setBarangList] = useState([]);
  const [activeCategory, setActiveCategory] = useState("SEMUA");
  const [searchBarang, setSearchBarang] = useState("");
  const [metodeBayar, setMetodeBayar] = useState("TABUNG");
  const [catatan, setCatatan] = useState("");

  const [cart, setCart] = useState([]);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [tempItem, setTempItem] = useState({
    berat: "",
    tipe_harga: "SISTEM",
    harga_manual: "",
    tipe_setoran: "COMMUNITY",
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (id) fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      const token = localStorage.getItem("bs_token");
      const [resN, resB] = await Promise.all([
        fetch(`/api/users/petugas/detail-nasabah/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/users/petugas/master-sampah", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const nData = await resN.json();
      const bData = await resB.json();
      setNasabah(nData.nasabah);
      setBarangList(bData.data?.data || bData.data || []);
    } catch (err) {
      toast.error("Gagal sinkron data");
    } finally {
      setLoadingData(false);
    }
  };

  const handleBarangClick = (barang) => {
    setSelectedBarang(barang);
    setTempItem((prev) => ({
      ...prev,
      berat: "",
      tipe_harga: "SISTEM",
      harga_manual: "",
    }));
  };

  const getHargaByTipe = (tipe) => {
    if (!selectedBarang) return 0;
    if (tipe === "SISTEM") return Number(selectedBarang.harga_aktif);
    if (tipe === "LOKAL")
      return selectedBarang.harga_lokal
        ? Number(selectedBarang.harga_lokal)
        : null;
    return Number(tempItem.harga_manual) || 0;
  };

  const addToCart = () => {
    // 1. Validasi Awal
    if (!selectedBarang) return toast.error("Pilih barang terlebih dahulu");
    if (!tempItem.berat || parseFloat(tempItem.berat) <= 0)
      return toast.error("Isi berat dengan benar");

    // 2. Penentuan Harga Deal (Pastikan angka)
    const hargaDeal =
      tempItem.tipe_harga === "CUSTOM"
        ? Number(tempItem.harga_manual)
        : Number(getHargaByTipe(tempItem.tipe_harga));

    // 3. Cek apakah harga valid
    if (isNaN(hargaDeal) || hargaDeal === null)
      return toast.error("Harga tidak valid atau belum ditetapkan!");

    // 4. Validasi Batas Harga (Jika Custom)
    if (tempItem.tipe_harga === "CUSTOM") {
      if (
        hargaDeal < selectedBarang.batas_bawah ||
        hargaDeal > selectedBarang.batas_atas
      ) {
        return toast.error(
          `Harga Rp${hargaDeal.toLocaleString()} melampaui batas (Rp${selectedBarang.batas_bawah.toLocaleString()} - Rp${selectedBarang.batas_atas.toLocaleString()})`,
        );
      }
    }

    // 5. Masukkan ke Keranjang (Mapping Nama Enum Prisma)
    setCart([
      ...cart,
      {
        barang_id: selectedBarang.id_barang,
        nama_barang: selectedBarang.nama_barang,
        berat: Number(tempItem.berat),
        // Pastikan value ini "COMMUNITY" atau "OCEAN_DEBRIS" sesuai schema.prisma
        tipe_setoran: tempItem.tipe_setoran,
        tipe_harga: tempItem.tipe_harga,
        harga_manual: Number(tempItem.harga_manual) || 0,
        harga_deal: hargaDeal,
        total_rp: hargaDeal * Number(tempItem.berat),
      },
    ]);

    // 6. Reset & Feedback
    setSelectedBarang(null);
    setTempItem({ ...tempItem, berat: "", harga_manual: "" });
    toast.success(`${selectedBarang.nama_barang} masuk keranjang`);
  };

  const submitSemuaSetoran = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/transaksi/setor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bs_token")}`,
        },
        body: JSON.stringify({
          nasabah_id: parseInt(id),
          items: cart,
          metode_bayar: metodeBayar,
          catatan_petugas: catatan,
        }),
      });
      if (!res.ok) throw new Error("Gagal proses setoran");
      toast.success("Setoran berhasil disimpan!");
      router.push(`/dashboard/petugas/detail-nasabah/${id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalTransaksi = cart.reduce((sum, item) => sum + item.total_rp, 0);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 text-slate-900">
        <header className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-slate-400 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-tight">
                Setor Sampah
              </h1>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                {nasabah?.nama_lengkap}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* KATALOG TABEL */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-3 bg-slate-50/50">
              <div className="flex gap-1 overflow-x-auto no-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${activeCategory === cat ? "bg-emerald-600 text-white" : "bg-white border border-slate-200 text-slate-400"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300"
                />
                <input
                  type="text"
                  placeholder="Cari..."
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] outline-none w-full sm:w-36"
                  value={searchBarang}
                  onChange={(e) => setSearchBarang(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white shadow-sm z-10 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b">
                  <tr>
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3 text-right">Harga</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {barangList
                    .filter(
                      (b) =>
                        (activeCategory === "SEMUA" ||
                          b.kategori_utama === activeCategory) &&
                        b.nama_barang
                          .toLowerCase()
                          .includes(searchBarang.toLowerCase()),
                    )
                    .map((b) => (
                      <tr
                        key={b.id_barang}
                        onClick={() => handleBarangClick(b)}
                        className={`cursor-pointer transition-colors ${selectedBarang?.id_barang === b.id_barang ? "bg-emerald-50" : "hover:bg-slate-50"}`}
                      >
                        <td className="px-4 py-3 text-xs font-semibold">
                          {b.nama_barang}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-black text-emerald-600">
                          Rp{b.harga_aktif?.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-200">
                          <Plus size={14} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FORM INPUT & KERANJANG */}
          <div className="lg:col-span-5 space-y-4">
            {selectedBarang && (
              <div className="p-4 bg-white rounded-xl border-2 border-emerald-500 shadow-md space-y-4 animate-in slide-in-from-right-2">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-[10px] font-black uppercase text-emerald-600 italic">
                    Pilih Harga: {selectedBarang.nama_barang}
                  </span>
                  <button
                    onClick={() => setSelectedBarang(null)}
                    className="text-slate-300 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {/* Opsi Harga Detail */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* Tombol Sistem */}
                    <button
                      type="button"
                      onClick={() =>
                        setTempItem({
                          ...tempItem,
                          tipe_harga: "SISTEM",
                          harga_manual: "",
                        })
                      }
                      className={`p-2 rounded-lg border flex flex-col items-center transition-all ${
                        tempItem.tipe_harga === "SISTEM"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm"
                          : "border-slate-100 text-slate-400"
                      }`}
                    >
                      <span className="text-[8px] font-black uppercase tracking-tighter">
                        Sistem
                      </span>
                      <span className="text-[10px] font-bold">
                        Rp{selectedBarang.harga_aktif.toLocaleString()}
                      </span>
                    </button>

                    {/* Tombol Lokal (Disabled jika null) */}
                    <button
                      type="button"
                      disabled={!selectedBarang.harga_lokal}
                      onClick={() =>
                        setTempItem({
                          ...tempItem,
                          tipe_harga: "LOKAL",
                          harga_manual: "",
                        })
                      }
                      className={`p-2 rounded-lg border flex flex-col items-center transition-all ${
                        !selectedBarang.harga_lokal
                          ? "opacity-40 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-300"
                          : tempItem.tipe_harga === "LOKAL"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm"
                            : "border-slate-100 text-slate-400 hover:border-emerald-200"
                      }`}
                    >
                      <span className="text-[8px] font-black uppercase tracking-tighter">
                        Lokal
                      </span>
                      <span className="text-[10px] font-bold">
                        {selectedBarang.harga_lokal
                          ? `Rp${selectedBarang.harga_lokal.toLocaleString()}`
                          : "Belum Ada"}
                      </span>
                    </button>

                    {/* Tombol Custom */}
                    <button
                      type="button"
                      onClick={() =>
                        setTempItem({ ...tempItem, tipe_harga: "CUSTOM" })
                      }
                      className={`p-2 rounded-lg border flex flex-col items-center transition-all ${
                        tempItem.tipe_harga === "CUSTOM"
                          ? "border-emerald-500 bg-emerald-600 text-white shadow-md"
                          : "border-slate-100 text-slate-400"
                      }`}
                    >
                      <span className="text-[8px] font-black uppercase tracking-tighter">
                        Custom
                      </span>
                      <span className="text-[10px] font-bold italic">
                        Atur Manual
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">
                        Berat (KG)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={tempItem.berat}
                        onChange={(e) =>
                          setTempItem({ ...tempItem, berat: e.target.value })
                        }
                        className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-emerald-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase">
                        Sumber Sampah
                      </label>
                      <div className="flex gap-2">
                        {["COMMUNITY", "OCEAN_DEBRIS"].map((sumber) => (
                          <button
                            key={sumber}
                            type="button"
                            onClick={() =>
                              setTempItem({ ...tempItem, tipe_setoran: sumber })
                            }
                            className={`flex-1 py-1.5 rounded-md text-[10px] font-black border transition-all ${
                              tempItem.tipe_setoran === sumber
                                ? sumber === "COMMUNITY"
                                  ? "bg-emerald-50 border-emerald-500 text-emerald-600" // Hijau untuk Community
                                  : "bg-blue-50 border-blue-500 text-blue-600" // Biru untuk Ocean
                                : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                            }`}
                          >
                            {sumber === "COMMUNITY" ? " COMMUNITY" : " OCEAN"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={addToCart}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>

                  {tempItem.tipe_harga === "CUSTOM" && (
                    <div className="space-y-2 animate-in fade-in">
                      <div className="flex justify-between items-end px-1">
                        <label className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                          Harga Manual (Rp)
                        </label>
                        {/* Range Harga yang lebih terlihat */}
                        <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          Minimal {selectedBarang.batas_bawah.toLocaleString()}{" "}
                          — Maksimal{" "}
                          {selectedBarang.batas_atas.toLocaleString()}
                        </span>
                      </div>

                      <input
                        type="number"
                        value={tempItem.harga_manual}
                        onChange={(e) =>
                          setTempItem({
                            ...tempItem,
                            harga_manual: e.target.value,
                          })
                        }
                        className="w-full bg-white border-2 border-emerald-100 rounded-xl px-3 py-2 text-xs font-black text-emerald-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                        placeholder="Masukkan harga..."
                      />

                      <p className="text-[9px] text-slate-400 italic px-1 font-medium">
                        *Pastikan harga sesuai dengan kondisi fisik sampah di
                        lapangan.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-100 p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b pb-3 text-[10px] font-black uppercase text-slate-400">
                <ShoppingCart size={14} /> Keranjang
              </div>
              <div className="space-y-3 max-h-40 overflow-y-auto no-scrollbar">
                {cart.length === 0 ? (
                  <p className="text-center py-4 text-[10px] text-slate-300 font-bold uppercase italic">
                    Kosong
                  </p>
                ) : (
                  cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center group"
                    >
                      <div>
                        <p className="text-xs font-bold">
                          {item.nama_barang}
                          <span
                            className={`ml-2 text-[8px] px-1.5 py-0.5 rounded font-black ${
                              item.tipe_setoran === "COMMUNITY"
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            {item.tipe_setoran === "COMMUNITY"
                              ? "COMMUNITY"
                              : "OCEAN"}
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-800">
                          {item.berat} kg × Rp{item.harga_deal.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-xs font-black text-emerald-600">
                          Rp{item.total_rp.toLocaleString()}
                        </p>
                        <button
                          onClick={() =>
                            setCart(cart.filter((_, i) => i !== idx))
                          }
                          className="text-slate-200 hover:text-red-500"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-6 border-t border-slate-100 space-y-4">
                {/* Baris Atas: Ringkasan Total */}

                {/* Input Catatan */}
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare size={12} /> Catatan Transaksi
                  </label>
                  <textarea
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Contoh: Sampah bersih, sudah dipilah..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500 min-h-[60px] resize-none transition-all"
                  />
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Total Transaksi
                    </p>
                    <p className="text-xl text-emerald-600 font-black tracking-tighter">
                      Rp{totalTransaksi.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {cart.length} Item Terpilih
                    </p>
                  </div>
                </div>

                {/* Baris Bawah: Kontrol Aksi */}
                <div className="flex flex-col gap-3">
                  {/* Pilihan Metode Bayar (Segmented Control) */}
                  <div className="flex p-1 bg-slate-100 rounded-xl">
                    {["TABUNG", "JUAL_LANGSUNG"].map((m) => (
                      <button
                        key={m}
                        onClick={() => setMetodeBayar(m)}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                          metodeBayar === m
                            ? "bg-white text-emerald-600 shadow-sm"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {/* Label tetap bisa menggunakan kata yang mudah dimengerti petugas */}
                        {m === "TABUNG"
                          ? "Masuk Saldo (Tabung)"
                          : "Jual Langsung (Tunai)"}
                      </button>
                    ))}
                  </div>

                  {/* Tombol Utama */}
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    disabled={cart.length === 0}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
                  >
                    SIMPAN SEMUA SETORAN
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmSetorModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={submitSemuaSetoran}
        data={{
          nasabah_name: nasabah?.nama_lengkap,
          total_rp: totalTransaksi,
          items: cart,
          metode_bayar: metodeBayar,
          catatan_petugas: catatan,
        }}
        loading={loading}
      />
    </DashboardLayout>
  );
}
