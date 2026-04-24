"use client";
import { X, ShoppingCart, MessageSquare, Wallet, AlertTriangle, Save } from "lucide-react";
import CartItemRow from "./CartItemRow";

const formatRp = (num) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);

export default function Cart({
  mode = "drawer",
  isOpen,
  onClose,
  cart,
  onRemoveItem,
  metodeBayar,
  onMetodeBayarChange,
  catatan,
  onCatatanChange,
  totalTransaksi,
  onCheckout,
  loading,
}) {
  if (mode === "panel") {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <CartContent
          mode="panel"
          cart={cart}
          onRemoveItem={onRemoveItem}
          metodeBayar={metodeBayar}
          onMetodeBayarChange={onMetodeBayarChange}
          catatan={catatan}
          onCatatanChange={onCatatanChange}
          totalTransaksi={totalTransaksi}
          onCheckout={onCheckout}
          loading={loading}
        />
      </div>
    );
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-center pt-3">
          <div className="w-8 h-1 bg-slate-200 rounded-full" />
        </div>
        <CartContent
          mode="drawer"
          onClose={onClose}
          cart={cart}
          onRemoveItem={onRemoveItem}
          metodeBayar={metodeBayar}
          onMetodeBayarChange={onMetodeBayarChange}
          catatan={catatan}
          onCatatanChange={onCatatanChange}
          totalTransaksi={totalTransaksi}
          onCheckout={onCheckout}
          loading={loading}
        />
      </div>
    </>
  );
}

function CartContent({
  mode,
  onClose,
  cart,
  onRemoveItem,
  metodeBayar,
  onMetodeBayarChange,
  catatan,
  onCatatanChange,
  totalTransaksi,
  onCheckout,
  loading,
}) {
  return (
    <div className={`flex flex-col ${mode === "drawer" ? "max-h-[85vh]" : ""}`}>

      {/* Header */}
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-50 rounded-xl">
            <ShoppingCart size={14} className="text-emerald-500" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-slate-800">Keranjang</h3>
            <p className="text-[10px] font-normal text-slate-500">{cart.length} item dipilih</p>
          </div>
        </div>
        {mode === "drawer" && onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={15} className="text-slate-500" />
          </button>
        )}
      </div>

      {/* Items */}
      <div
        className={`overflow-y-auto flex-1 px-5 divide-y divide-slate-100 ${
          mode === "panel" ? "max-h-52" : ""
        }`}
      >
        {cart.length === 0 ? (
          <div className="py-10 text-center">
            <ShoppingCart size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-[12px] font-medium text-slate-400">Keranjang masih kosong</p>
            <p className="text-[10px] font-normal text-slate-400 mt-0.5">Pilih barang dari katalog</p>
          </div>
        ) : (
          cart.map((item, idx) => (
            <CartItemRow key={idx} item={item} onRemove={() => onRemoveItem(idx)} />
          ))
        )}
      </div>

      {/* Form & Actions */}
      <div className="px-5 pb-5 pt-3 space-y-3 border-t border-slate-100 flex-shrink-0">

        {/* Catatan */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-slate-600 flex items-center gap-1.5">
            <MessageSquare size={10} /> Catatan
          </label>
          <textarea
            value={catatan}
            onChange={(e) => onCatatanChange(e.target.value)}
            placeholder="Contoh: Sampah bersih, sudah dipilah..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[12px] text-slate-700 placeholder:text-slate-400 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 min-h-[46px] resize-none transition-all"
          />
        </div>

        {/* Metode Bayar */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-slate-600 flex items-center gap-1.5">
            <Wallet size={10} /> Metode Pembayaran
          </label>
          <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
            {[
              { key: "TABUNG", label: "Tabung", sub: "Masuk Saldo" },
              { key: "JUAL_LANGSUNG", label: "Tunai", sub: "Jual Langsung" },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => onMetodeBayarChange(m.key)}
                className={`flex-1 py-2 rounded-lg text-center transition-all duration-200 ${
                  metodeBayar === m.key ? "bg-white shadow-sm" : "hover:bg-white/50"
                }`}
              >
                <p className={`text-[11px] font-semibold ${metodeBayar === m.key ? "text-emerald-600" : "text-slate-500"}`}>
                  {m.label}
                </p>
                <p className={`text-[9px] font-normal mt-0.5 ${metodeBayar === m.key ? "text-slate-500" : "text-slate-400"}`}>
                  {m.sub}
                </p>
              </button>
            ))}
          </div>

          {metodeBayar === "JUAL_LANGSUNG" && (
            <div className="flex gap-2 p-3 bg-orange-50 border border-orange-100 rounded-xl animate-in fade-in">
              <AlertTriangle size={12} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-orange-600 font-normal leading-relaxed">
                Saldo nasabah <span className="font-semibold">tidak akan bertambah</span> di aplikasi.
              </p>
            </div>
          )}
        </div>

        {/* Total + Submit */}
        <div className="pt-1 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-medium text-slate-600">Total Setoran</p>
            <p className="text-lg font-bold text-emerald-600 tracking-tight">
              {formatRp(totalTransaksi)}
            </p>
          </div>
          <button
            onClick={onCheckout}
            disabled={cart.length === 0 || loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl text-[13px] font-semibold shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Save size={14} /> Simpan Setoran</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
