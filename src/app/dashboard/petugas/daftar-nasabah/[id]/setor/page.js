"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import ConfirmSetorModal from "@/components/petugas/setor/ConfirmSetorModal";
import CategoryTabs from "@/components/petugas/setor/CategoryTabs";
import BarangRow from "@/components/petugas/setor/BarangRow";
import ItemDetailSheet from "@/components/petugas/setor/ItemDetailSheet";
import Cart from "@/components/petugas/setor/Cart";
import { ArrowLeft, Search, ShoppingCart, User, PackageX } from "lucide-react";

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
  const [showCart, setShowCart] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (id) fetchInitialData();
  }, [id]);

  // ── Data fetching ──────────────────────────────────────────────────────────

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
    } catch {
      toast.error("Gagal sinkron data");
    } finally {
      setLoadingData(false);
    }
  };

  // ── Cart logic ─────────────────────────────────────────────────────────────

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
      return selectedBarang.harga_lokal ? Number(selectedBarang.harga_lokal) : null;
    return Number(tempItem.harga_manual) || 0;
  };

  const addToCart = () => {
    if (!selectedBarang) return toast.error("Pilih barang terlebih dahulu");
    if (!tempItem.berat || parseFloat(tempItem.berat) <= 0)
      return toast.error("Isi berat dengan benar");

    const hargaDeal =
      tempItem.tipe_harga === "CUSTOM"
        ? Number(tempItem.harga_manual)
        : Number(getHargaByTipe(tempItem.tipe_harga));

    if (isNaN(hargaDeal) || hargaDeal === null)
      return toast.error("Harga tidak valid atau belum ditetapkan!");

    if (tempItem.tipe_harga === "CUSTOM") {
      if (
        hargaDeal < selectedBarang.batas_bawah ||
        hargaDeal > selectedBarang.batas_atas
      ) {
        return toast.error(
          `Harga Rp${hargaDeal.toLocaleString()} melampaui batas (Rp${selectedBarang.batas_bawah.toLocaleString()} - Rp${selectedBarang.batas_atas.toLocaleString()})`
        );
      }
    }

    setCart((prev) => [
      ...prev,
      {
        barang_id: selectedBarang.id_barang,
        nama_barang: selectedBarang.nama_barang,
        berat: Number(tempItem.berat),
        tipe_setoran: tempItem.tipe_setoran,
        tipe_harga: tempItem.tipe_harga,
        harga_manual: Number(tempItem.harga_manual) || 0,
        harga_deal: hargaDeal,
        total_rp: hargaDeal * Number(tempItem.berat),
      },
    ]);

    setSelectedBarang(null);
    setTempItem((prev) => ({ ...prev, berat: "", harga_manual: "" }));
    toast.success(`${selectedBarang.nama_barang} masuk keranjang!`);
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

  // ── Derived ────────────────────────────────────────────────────────────────

  const removeFromCart = (idx) =>
    setCart((prev) => prev.filter((_, i) => i !== idx));

  const totalTransaksi = cart.reduce((sum, item) => sum + item.total_rp, 0);

  const filteredBarang = barangList.filter(
    (b) =>
      (activeCategory === "SEMUA" || b.kategori_utama === activeCategory) &&
      b.nama_barang.toLowerCase().includes(searchBarang.toLowerCase())
  );

  const sharedCartProps = {
    cart,
    onRemoveItem: removeFromCart,
    metodeBayar,
    onMetodeBayarChange: setMetodeBayar,
    catatan,
    onCatatanChange: setCatatan,
    totalTransaksi,
    loading,
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 pb-24 lg:pb-6">

        {/* ── Header ── */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-emerald-600"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-sm font-semibold text-slate-800">
                  Input Setoran
                </h1>
                {loadingData ? (
                  <div className="h-3 w-28 bg-slate-100 rounded-full animate-pulse mt-0.5" />
                ) : (
                  <div className="flex items-center gap-1">
                    <User size={10} className="text-emerald-500" />
                    <p className="text-[10px] font-medium text-emerald-600 truncate max-w-[180px]">
                      {nasabah?.nama_lengkap}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Cart button — mobile only */}
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition-all lg:hidden shadow-md shadow-emerald-200"
            >
              <ShoppingCart size={18} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-red-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Main ── */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="lg:grid lg:grid-cols-12 lg:gap-5 lg:items-start">

            {/* ── Katalog ── */}
            <div className="lg:col-span-8 space-y-3">

              {/* Search */}
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Cari nama barang..."
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
                  value={searchBarang}
                  onChange={(e) => setSearchBarang(e.target.value)}
                />
              </div>

              {/* Category Tabs */}
              <CategoryTabs
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />

              {/* List Container */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                {/* List Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                  <span className="text-[10px] font-medium text-slate-600">
                    Nama Barang
                  </span>
                  <span className="text-[10px] font-medium text-slate-600">
                    Harga / kg
                  </span>
                </div>

                {/* List Body */}
                <div className="divide-y divide-slate-50 overflow-y-auto max-h-[60vh]">
                  {loadingData ? (
                    [...Array(8)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-100 animate-pulse flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 w-36 bg-slate-100 rounded-full animate-pulse" />
                          <div className="h-2.5 w-14 bg-slate-100 rounded-full animate-pulse" />
                        </div>
                        <div className="h-3 w-16 bg-slate-100 rounded-full animate-pulse" />
                      </div>
                    ))
                  ) : filteredBarang.length === 0 ? (
                    <div className="py-16 flex flex-col items-center gap-2 text-center">
                      <PackageX size={28} className="text-slate-300" />
                      <p className="text-slate-500 font-medium text-sm">
                        Barang tidak ditemukan
                      </p>
                      <p className="text-slate-400 text-xs">
                        Coba kata kunci lain
                      </p>
                    </div>
                  ) : (
                    filteredBarang.map((b) => (
                      <BarangRow
                        key={b.id_barang}
                        barang={b}
                        isSelected={selectedBarang?.id_barang === b.id_barang}
                        onClick={handleBarangClick}
                      />
                    ))
                  )}
                </div>

                {/* List Footer */}
                {!loadingData && filteredBarang.length > 0 && (
                  <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
                    <p className="text-[10px] text-slate-500 font-medium">
                      {filteredBarang.length} barang tersedia
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Desktop Cart Panel ── */}
            <div className="hidden lg:block lg:col-span-4 sticky top-20">
              <Cart
                mode="panel"
                {...sharedCartProps}
                onCheckout={() => setShowConfirmModal(true)}
              />
            </div>
          </div>
        </div>

        {/* ── Mobile Sticky Bottom Bar ── */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-30 lg:hidden px-4 py-3 bg-white border-t border-slate-100 shadow-2xl transition-transform duration-300 ${
            cart.length > 0 ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <button
            onClick={() => setShowCart(true)}
            className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-semibold flex items-center justify-between px-5 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="bg-white text-emerald-600 text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                {cart.length}
              </span>
              <span className="text-sm">Lihat Keranjang</span>
            </div>
            <span className="text-sm font-semibold">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(totalTransaksi)}
            </span>
          </button>
        </div>

        {/* ── Item Detail Sheet ── */}
        {selectedBarang && (
          <ItemDetailSheet
            barang={selectedBarang}
            tempItem={tempItem}
            onTempItemChange={(changes) =>
              setTempItem((prev) => ({ ...prev, ...changes }))
            }
            onAddToCart={addToCart}
            onClose={() => setSelectedBarang(null)}
          />
        )}

        {/* ── Mobile Cart ── */}
        <div className="lg:hidden">
          <Cart
            mode="drawer"
            isOpen={showCart}
            onClose={() => setShowCart(false)}
            {...sharedCartProps}
            onCheckout={() => {
              setShowCart(false);
              setShowConfirmModal(true);
            }}
          />
        </div>

        {/* ── Confirm Modal ── */}
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
      </div>
    </DashboardLayout>
  );
}
