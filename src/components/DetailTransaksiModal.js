"use client";

import { X, ReceiptText, Package, ArrowUpRight, ArrowDownRight, Layers } from "lucide-react";

const DetailTransaksiModal = ({ isOpen, onClose, transaction, formatRupiah }) => {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop dengan Glassmorphism */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Container Modal */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
        
        {/* Header: Lebih Bersih & Informatif */}
        <div className="p-8 pb-6 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
              <ReceiptText className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                Rincian Setoran
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                ID: {transaction.group_id || transaction.id_setor}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Body: Item List dengan Desain Card-in-Card */}
        <div className="px-8 space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pb-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Daftar Sampah ({transaction.subItems.length} Item)
          </p>
          
          {transaction.subItems.map((item, idx) => (
            <div 
              key={idx} 
              className="group p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-all flex justify-between items-center"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-slate-400 group-hover:text-emerald-500 transition-colors">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-tight">
                    {item.nama_barang_snapshot || "Sampah Tidak Terdeteksi"}
                  </p>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase">
                    {item.berat} kg <span className="mx-1 text-slate-300">×</span> {formatRupiah(item.harga_deal)}
                  </p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-1.5">
                 <span className={`text-[8px] px-2 py-0.5 rounded-md font-black border tracking-widest ${
                    item.tipe_setoran === "COMMUNITY" 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                      : "bg-blue-50 border-blue-100 text-blue-600"
                  }`}>
                    {item.tipe_setoran === "COMMUNITY" ? "COMMUNITY" : "OCEAN"}
                  </span>
                  <p className="text-sm font-black text-slate-700 dark:text-emerald-400">
                    {formatRupiah(item.total_rp || (item.berat * item.harga_deal))}
                  </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer: Menghilangkan Background Hijau Pekat */}
        <div className="p-8 pt-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                Total Penerimaan
              </p>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">
                {formatRupiah(transaction.totalGroupRp)}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                <Layers className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase tracking-tighter">Verified</span>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="w-full py-4 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 dark:shadow-none transition-all active:scale-[0.98]"
          >
            Tutup Rincian
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailTransaksiModal;