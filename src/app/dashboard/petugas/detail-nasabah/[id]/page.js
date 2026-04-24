"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import ExportDetailNasabah from "@/components/petugas/nasabah/ExportDetailNasabah";
import DashboardLayout from "@/components/DashboardLayout";
import DetailTransaksiModal from "@/components/petugas/transaksi/DetailTransaksiModal";
import EditNasabahModal from "@/components/petugas/nasabah/EditNasabahModal";
import {
  DollarSign, RefreshCw, ChevronLeft, ChevronRight, Wallet, User, MapPin,
  FileSpreadsheet, FileText, ArrowLeft, TrendingUp, TrendingDown, Inbox,
  Loader2, Plus, MinusCircle, Edit,
} from "lucide-react";

export default function DetailNasabahPage() {
  const params = useParams();
  const router = useRouter();
  const exportRef = useRef();
  const nasabahId = params.id;

  const [loading, setLoading] = useState(true);
  const [nasabah, setNasabah] = useState(null);
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("SEMUA");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [summary, setSummary] = useState({
    totalSetorCount: 0,
    totalTarikCount: 0,
    totalNilaiSetor: 0,
    totalNilaiTarik: 0,
    totalBeratSampah: 0,
    beratPerKategori: {},
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bs_token");
      if (!token) {
        toast.error("Token tidak ditemukan");
        router.push("/login");
        return;
      }

      const res = await fetch(
        `/api/users/petugas/detail-nasabah/${nasabahId}?type=${filter}&page=${page}&limit=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Sesi berakhir");
          localStorage.clear();
          router.push("/login");
          return;
        }
        throw new Error("Gagal mengambil data");
      }

      const json = await res.json();
      setNasabah(json.nasabah);
      setData(json.data || []);
      setSummary(
        json.summary || {
          totalSetorCount: 0,
          totalTarikCount: 0,
          totalNilaiSetor: 0,
          totalNilaiTarik: 0,
          totalBeratSampah: 0,
          beratPerKategori: {},
        },
      ); // TAMBAH INI
      setPagination(
        json.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
      );
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    fetchDetail();
  }, [filter, page, nasabahId]);

  const formatRupiah = (num) => {
    const value = Number(num) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const totalSetor = summary.totalSetorCount || 0;
  const totalTarik = summary.totalTarikCount || 0;

  const totalNilaiSetor = summary.totalNilaiSetor || 0;
  const totalBeratSampah = summary.totalBeratSampah || 0;
  const totalNilaiTarik = summary.totalNilaiTarik || 0;

  const openDetailModal = (item) => {
    setSelectedTransaction(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const openEditModal = () => {
    setShowEditModal(true);
  };

  const closeEditModal = (refresh) => {
    setShowEditModal(false);
    if (refresh === true) fetchDetail();
  };



  const finalDisplayData = data.map((item) => ({
    ...item,
    subItems: item.jenis === "SETOR" ? item.detail_items || [] : [],
    totalGroupRp:
      item.jenis === "SETOR"
        ? Number(item.total_rp)
        : Number(item.jumlah_tarik),
  }));

  // Badge components
  const JenisBadge = ({ jenis }) =>
    jenis === "SETOR" ? (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400">
        <TrendingUp className="w-3 h-3" /> Setor
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-orange-50 text-orange-500 ring-1 ring-orange-100 dark:bg-orange-900/20 dark:text-orange-400">
        <TrendingDown className="w-3 h-3" /> Tarik
      </span>
    );

  const MetodeBadge = ({ metode }) => {
    if (!metode) return <span className="text-[10px] text-slate-300">—</span>;
    return metode === "TABUNG" ? (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-900/20 dark:text-blue-400">
        <Wallet className="w-3 h-3" /> Tabung
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-amber-50 text-amber-600 ring-1 ring-amber-100 dark:bg-amber-900/20 dark:text-amber-400">
        <DollarSign className="w-3 h-3" /> Jual Langsung
      </span>
    );
  };

  return (
    <DashboardLayout>
      <ExportDetailNasabah
        ref={exportRef}
        nasabah={nasabah}
        data={data}
        filter={filter}
      />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-10">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">

          {/* Header dengan tombol back dan actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-500 hover:text-emerald-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  Detail Nasabah
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Informasi dan riwayat transaksi
                </p>
              </div>
            </div>

            {/* Tombol Setor, Tarik & Edit */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/dashboard/petugas/daftar-nasabah/${nasabahId}/setor`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[13px] font-semibold transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                Setor
              </button>
              <button
                onClick={() => router.push(`/dashboard/petugas/daftar-nasabah/${nasabahId}/tarik`)}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[13px] font-semibold transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98]"
              >
                <MinusCircle className="w-4 h-4" />
                Tarik
              </button>
              <button
                onClick={openEditModal}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-[13px] font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>
          </div>

          {/* Info Nasabah Card */}
          {nasabah && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
              {/* Green strip top */}
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-400" />

              <div className="p-5">
                {/* Profile Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/40 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <User className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                      {nasabah.nama_lengkap}
                    </h2>
                    <p className="text-[12px] text-slate-500 font-mono mt-0.5">
                      {nasabah.nik || "-"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{nasabah.desa || "-"} • {nasabah.alamat || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 items-start">
                  {/* Total Setor dengan rincian kategori */}
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Setor</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">{totalSetor}x transaksi</p>
                    <div className="space-y-1 text-[11px]">
                      {(() => {
                        const kategoriList = ['PLASTIK', 'LOGAM', 'KERTAS', 'LAINNYA', 'CAMPURAN'];
                        const kategoriLabels = {
                          PLASTIK: 'Plastik',
                          LOGAM: 'Logam',
                          KERTAS: 'Kertas',
                          LAINNYA: 'Lainnya',
                          CAMPURAN: 'Campuran',
                        };
                        return kategoriList.map(kat => {
                          const berat = summary.beratPerKategori?.[kat] || 0;
                          return (
                            <div key={kat} className="flex justify-between items-center">
                              <span className="text-slate-500">{kategoriLabels[kat]}</span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {Number(berat).toLocaleString('id-ID')} kg
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                  {/* Total Tarik */}
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Tarik</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{totalTarik}x transaksi</p>
                  </div>
                  {/* Saldo */}
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800">
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Saldo Saat Ini</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{formatRupiah(nasabah.total_saldo)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter & Export Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              {["SEMUA", "SETOR", "TARIK"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                    filter === type
                      ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportRef.current.generateExcel()}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-[12px] font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden sm:inline">Excel</span>
              </button>
              <button
                onClick={() => exportRef.current.generatePDF()}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[12px] font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button
                onClick={fetchDetail}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 rounded-xl text-[12px] font-semibold transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Tabel Riwayat */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-[12px]">Memuat riwayat...</p>
              </div>
            ) : data.length === 0 ? (
              <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Inbox className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-[12px] font-medium">Belum ada transaksi</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                      {["No", "Tanggal", "Jenis", "Metode", "Detail", "Catatan", "Jumlah"].map((h, i) => (
                        <th key={h} className={`px-4 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap ${i >= 6 ? "text-right" : ""}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {finalDisplayData.map((item, index) => (
                    <tr
                      key={`${item.group_id || item.id_setor || item.id_tarik}-${index}`}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3.5 text-center">
                        <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{(page - 1) * 20 + index + 1}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-[11px] text-slate-500 whitespace-nowrap">{formatDate(item.waktu)}</p>
                      </td>

                      <td className="px-4 py-3.5"><JenisBadge jenis={item.jenis} /></td>

                      <td className="px-4 py-3.5">
                        <MetodeBadge metode={item.jenis === "SETOR" ? item.metode_bayar : null} />
                      </td>

                      <td className="px-4 py-3.5">
                        {item.jenis === "SETOR" ? (
                          <div>
                            <p className="text-[12px] font-medium text-slate-700 dark:text-slate-200 truncate max-w-[160px]">
                              {item.subItems[0]?.nama_barang_snapshot || item.subItems[0]?.barang?.nama_barang || "Sampah"}
                              {item.subItems.length > 1 && (
                                <span className="text-slate-400 ml-1">+{item.subItems.length - 1}</span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-500">
                                {Number(item.subItems[0]?.berat) || 0} kg × {formatRupiah(item.subItems[0]?.harga_deal || item.subItems[0]?.harga_per_kg)}
                              </span>
                              {item.subItems[0]?.tipe_setoran && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                                  item.subItems[0]?.tipe_setoran === "COMMUNITY"
                                    ? "bg-emerald-100 text-emerald-600"
                                    : "bg-blue-100 text-blue-600"
                                }`}>
                                  {item.subItems[0]?.tipe_setoran === "COMMUNITY" ? "COMM" : "OCEAN"}
                                </span>
                              )}
                              {item.subItems.length > 1 && (
                                <button
                                  onClick={() => openDetailModal(item)}
                                  className="text-[9px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline font-medium"
                                >
                                  Lihat detail
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Wallet className="w-3 h-3" />
                            <span className="text-[11px]">Penarikan Tunai</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        {(() => {
                          const catatan = item.jenis === "TARIK" ? item.catatan_tarik : item.catatan_petugas;
                          return catatan ? (
                            <span className="inline-flex items-center gap-1.5 max-w-[140px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                              <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate" title={catatan}>
                                {catatan}
                              </span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-300 dark:text-slate-600">—</span>
                          );
                        })()}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <p className={`text-[13px] font-bold ${
                          item.jenis === "TARIK" ? "text-red-500" :
                          item.metode_bayar === "TABUNG" ? "text-emerald-600" : "text-slate-600"
                        }`}>
                          {item.jenis === "SETOR" ? "+" : "−"}{formatRupiah(item.totalGroupRp)}
                        </p>
                        {item.subItems.length > 1 && (
                          <p className="text-[9px] text-slate-400 mt-0.5">{item.subItems.length} jenis sampah</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

          {/* Pagination */}
          {!loading && data.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between rounded-b-2xl">
              <p className="text-[11px] text-slate-400">
                Halaman <span className="font-semibold text-slate-600 dark:text-slate-300">{pagination.page}</span> dari{" "}
                <span className="font-semibold text-slate-600 dark:text-slate-300">{pagination.totalPages}</span>
                <span className="ml-1.5 text-slate-300">·</span>
                <span className="ml-1.5">{pagination.total} transaksi</span>
              </p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage(page - 1)} disabled={page === 1}
                  className="p-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all">
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                </button>
                <button onClick={() => setPage(page + 1)} disabled={page >= pagination.totalPages}
                  className="p-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-all">
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail Transaksi */}
      <DetailTransaksiModal
        isOpen={isModalOpen}
        onClose={closeModal}
        transaction={selectedTransaction}
        formatRupiah={formatRupiah}
      />

      {/* Modal Edit Nasabah */}
      <EditNasabahModal
        isOpen={showEditModal}
        onClose={closeEditModal}
        nasabah={nasabah}
        onSuccess={() => fetchDetail()}
      />
    </DashboardLayout>
  );
}
