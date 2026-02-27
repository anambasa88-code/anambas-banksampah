const TransactionItem = ({ sub, formatRupiah }) => {
  // Logika pencarian nama: Snapshot > Nama dari Join > ID Barang sebagai fallback terakhir
  const displayName = sub.nama_barang_snapshot || sub.barang?.nama_barang || `Barang #${sub.barang_id}`;

  return (
    <div className="border-l-2 border-emerald-500 pl-3 py-1 bg-slate-50/50 dark:bg-slate-800/30 rounded-r-lg mb-2 last:mb-0">
      <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">
        {displayName}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] font-bold text-slate-500">
          {Number(sub.berat) || 0} kg × {formatRupiah(sub.harga_deal || sub.harga_per_kg)}
        </span>
        {sub.tipe_setoran && (
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border ${
            sub.tipe_setoran === "COMMUNITY" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
              : "bg-blue-50 border-blue-200 text-blue-600"
          }`}>
            {sub.tipe_setoran === "COMMUNITY" ? " COMMUNITY" : " OCEAN"}
          </span>
        )}
      </div>
    </div>
  );
};