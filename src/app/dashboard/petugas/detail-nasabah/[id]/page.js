"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import ExportDetailNasabah from "@/components/ExportDetailNasabah";
import DashboardLayout from "@/components/DashboardLayout";
import {
  History,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Package,
  DollarSign,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Banknote,
  User,
  MapPin,
  FileSpreadsheet,
  FileText,
  ArrowLeft,
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
  });

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

  const totalSetor = data.filter((d) => d.jenis === "SETOR").length;
  const totalTarik = data.filter((d) => d.jenis === "TARIK").length;

  const totalNilaiSetor = data
    .filter((d) => d.jenis === "SETOR" && d.metode_bayar === "TABUNG")
    .reduce((sum, d) => sum + (Number(d.total_rp) || 0), 0);

  const totalNilaiTarik = data
    .filter((d) => d.jenis === "TARIK")
    .reduce((sum, d) => sum + (Number(d.jumlah) || 0), 0);

  // Letakkan di atas return JSX
  const groupedData = data.reduce((acc, item) => {
    // Jika tidak ada group_id, gunakan ID setor/tarik agar tidak digabung jadi satu
    const key =
      item.group_id ||
      (item.jenis === "SETOR" ? item.id_setor : item.id_tarik) ||
      `old-${Math.random()}`;

    if (!acc[key]) {
      acc[key] = {
        ...item,
        subItems: [],
        totalGroupRp: 0,
      };
    }

    acc[key].subItems.push(item);
    acc[key].totalGroupRp += Number(
      item.total_rp ||
        item.jumlah ||
        Number(item.berat) * Number(item.harga_per_kg) ||
        0,
    );

    return acc;
  }, {});

  const finalDisplayData = Object.values(groupedData);

  return (
    <DashboardLayout>
      <ExportDetailNasabah
        ref={exportRef}
        nasabah={nasabah}
        data={data}
        filter={filter}
      />
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Header dengan tombol back */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
              <User className="w-8 h-8 text-green-600 dark:text-green-400" />
              Detail Nasabah
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Informasi dan riwayat transaksi nasabah
            </p>
          </div>
        </div>

        {/* Info Nasabah & Statistik Terpadu */}
        {nasabah && (
          <div className="p-6 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Data Pribadi */}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Nama Lengkap
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  {nasabah.nama_lengkap}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Nickname
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  {nasabah.nickname}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  NIK
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  {nasabah.nik || "-"}
                </p>
              </div>

              {/* Baris Baru: Alamat & Desa */}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Desa
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  {nasabah.desa || "-"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Alamat
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  {nasabah.alamat || "-"}
                </p>
              </div>

              {/* Baris Statistik (Tampilan Tulisan Biasa) */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Package className="w-3 h-3 text-green-600" /> Total Setor
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  {totalSetor} Transaksi
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 text-orange-600" /> Total Tarik
                </p>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  {totalTarik} Tarik
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-blue-600" /> Total Nilai
                  Tarik
                </p>
                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  {formatRupiah(totalNilaiTarik)}
                </p>
              </div>

              {/* Saldo di bagian paling bawah dan dibuat menonjol */}
              <div className="md:col-span-2 lg:col-span-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> Saldo Saat Ini
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatRupiah(nasabah.total_saldo)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Refresh */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            {["SEMUA", "SETOR", "TARIK"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    filter === type
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700"
                  }
                `}
              >
                {type}
              </button>
            ))}
          </div>
          {/* Tombol Excel */}
          <button
            onClick={() => exportRef.current.generateExcel()}
            className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all flex items-center gap-2 text-sm font-bold"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden md:inline">Excel</span>
          </button>

          {/* Tombol PDF */}
          <button
            onClick={() => exportRef.current.generatePDF()}
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-2 text-sm font-bold"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden md:inline">PDF</span>
          </button>

          <button
            onClick={fetchDetail}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Tabel Riwayat */}
        <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-green-600 dark:text-green-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Memuat riwayat...
              </p>
            </div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Belum ada transaksi</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Jenis
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Detail
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Catatan Petugas
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Jumlah
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {finalDisplayData.map((item, index) => (
                    <tr
                      key={`${item.group_id || item.id_setor || item.id_tarik}-${index}`}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {formatDate(item.waktu)}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit ${
                            item.jenis === "SETOR"
                              ? "bg-green-50 text-green-700"
                              : "bg-orange-50 text-orange-700"
                          }`}
                        >
                          {item.jenis === "SETOR" ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                          <span className="text-sm font-semibold">
                            {item.jenis}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {item.jenis === "SETOR" ? (
                          <div className="space-y-2">
                            {item.subItems.map((sub, i) => (
                              <div
                                key={i}
                                className="border-l-2 border-emerald-500 pl-2"
                              >
                                <p className="text-sm font-bold text-gray-800 dark:text-white uppercase">
                                  {sub.nama_barang_snapshot ||
                                    sub.barang?.nama_barang ||
                                    "Sampah"}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-gray-500 font-bold">
                                    {Number(sub.berat) || 0} kg ×{" "}
                                    {formatRupiah(
                                      sub.harga_deal || sub.harga_per_kg,
                                    )}
                                  </span>
                                  {sub.tipe_setoran && (
                                    <span
                                      className={`text-[9px] px-1.5 rounded font-black ${
                                        sub.tipe_setoran === "COMMUNITY"
                                          ? "bg-emerald-100 text-emerald-600"
                                          : "bg-blue-100 text-blue-600"
                                      }`}
                                    >
                                      {sub.tipe_setoran === "COMMUNITY"
                                        ? "COMM"
                                        : "OCEAN"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 font-medium">
                            Penarikan Saldo
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-500">
                        {item.catatan_petugas || item.catatan_tarik || "-"}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <p
                          className={`text-base font-black ${item.jenis === "SETOR" ? "text-emerald-600" : "text-orange-600"}`}
                        >
                          {formatRupiah(item.totalGroupRp)}
                        </p>
                        {item.subItems.length > 1 && (
                          <p className="text-[9px] text-gray-400 font-bold uppercase">
                            {item.subItems.length} Jenis Sampah
                          </p>
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Halaman {pagination.page} dari {pagination.totalPages} (
              {pagination.total} transaksi)
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
