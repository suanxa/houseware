"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { 
  Wallet, 
  CheckCircle2, 
  Clock, 
  FileText, 
  TrendingUp,
  ArrowUpRight,
  Loader2,
  History as HistoryIcon 
} from "lucide-react";

export default function FinanceDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  // Menambahkan hutangMitra ke dalam state stats
  const [stats, setStats] = useState({ totalRevenue: 0, pending: 0, success: 0, hutangMitra: 0 });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  async function fetchFinanceData() {
    setLoading(true);
    try {
      // 1. Ambil Data Pembayaran
      const { data: payments, error: payError } = await supabase
        .from("pembayaran")
        .select(`*, users ( name )`) 
        .order("tanggal_bayar", { ascending: false });

      if (payError) throw payError;

      // 2. Ambil data pendukung untuk hitung bagi hasil
      const { data: penitipan } = await supabase.from("penitipan_barang")
        .select("id, tanggal_mulai, tanggal_selesai, lokasi_penitipan(harga_per_hari)") as any;

      const getDurasi = (m: string, s: string) => {
        const d1 = new Date(m);
        const d2 = new Date(s);
        return Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) || 1;
      };

      let netAdminRevenue = 0; 
      let toMitra = 0;
      let pendingCount = 0;
      let successCount = 0;

      payments?.forEach((p) => {
        const status = p.status?.toLowerCase();
        const nominalBayar = Number(p.total_bayar) || 0;

        if (status === "lunas" || status === "berhasil") {
          successCount++;
          
          if (p.jenis_layanan?.toLowerCase() === 'penitipan') {
            const detail = penitipan?.find((d: any) => d.id === p.transaksi_id);
            if (detail) {
              const durasi = getDurasi(detail.tanggal_mulai, detail.tanggal_selesai);
              const hargaGudang = detail.lokasi_penitipan?.harga_per_hari || 0;
              const biayaGudangMitra = Number(hargaGudang) * durasi;
              
              if (nominalBayar > biayaGudangMitra) {
                toMitra += biayaGudangMitra;
                netAdminRevenue += (nominalBayar - biayaGudangMitra);
              } else {
                netAdminRevenue += nominalBayar;
              }
            }
          } else {
            // Logika Angkutan: 80% Mitra, 20% Admin
            toMitra += (nominalBayar * 0.8);
            netAdminRevenue += (nominalBayar * 0.2);
          }
        } else if (status === "menunggu_verifikasi") {
          pendingCount++;
        }
      });

      setStats({
        totalRevenue: netAdminRevenue,
        pending: pendingCount,
        success: successCount,
        hutangMitra: toMitra
      });
      setRecentPayments(payments?.slice(0, 5) || []);

    } catch (error: any) {
      console.error("Finance Error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Keuangan 💰</h1>
            <p className="text-slate-500 font-medium text-sm">Monitor laba bersih dan verifikasi pembayaran masuk.</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{session?.user?.name}</p>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {session?.user?.role}
                </span>
             </div>
             <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {session?.user?.name?.charAt(0) || "F"}
             </div>
          </div>
        </header>

        {/* 1. Ringkasan Keuangan */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <FinanceCard 
            icon={<TrendingUp size={20} />} 
            label="Laba Bersih Perusahaan" 
            value={`Rp ${stats.totalRevenue.toLocaleString('id-ID')}`} 
            color="emerald" 
            trend="+12% Bln ini"
          />
          <FinanceCard 
            icon={<Clock size={20} />} 
            label="Menunggu Verifikasi" 
            value={stats.pending.toString()} 
            color="amber" 
          />
          <FinanceCard 
            icon={<CheckCircle2 size={20} />} 
            label="Pembayaran Berhasil" 
            value={stats.success.toString()} 
            color="blue" 
          />
          <FinanceCard 
            icon={<Wallet size={20} />} 
            label="Hak Mitra" 
            value={`Rp ${stats.hutangMitra.toLocaleString('id-ID')}`} 
            color="purple" 
          />
        </div>

        {/* 2. Actions & Reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-emerald-700 p-8 rounded-3xl text-white flex justify-between items-center shadow-lg shadow-emerald-200 group relative overflow-hidden">
            <div className="z-10">
              <h3 className="text-xl font-bold mb-2">Verifikasi Pembayaran</h3>
              <p className="text-emerald-100 text-sm mb-6 max-w-xs">Terdapat {stats.pending} pembayaran baru yang perlu Anda tinjau sekarang.</p>
              <Link href="/finance/verifikasi" className="inline-flex items-center space-x-2 bg-white text-emerald-700 px-6 py-2.5 rounded-xl font-bold hover:scale-105 transition-all">
                <span>Buka Antrean</span>
                <ArrowUpRight size={18} />
              </Link>
            </div>
            <CheckCircle2 size={120} className="absolute right-4 bottom-[-20px] text-white opacity-10 group-hover:rotate-12 transition-transform" />
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center relative overflow-hidden group">
            <div className="z-10">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Laporan Bulanan</h3>
              <p className="text-slate-500 text-sm mb-6">Rekapitulasi seluruh transaksi dalam format PDF/Excel.</p>
              <button className="inline-flex items-center space-x-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all">
                <span>Unduh Laporan</span>
                <FileText size={18} />
              </button>
            </div>
            <FileText size={120} className="absolute right-4 bottom-[-20px] text-slate-100 group-hover:-rotate-12 transition-transform" />
          </div>
        </div>

        {/* 3. Recent Transaction Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Transaksi Terakhir</h3>
            <button onClick={fetchFinanceData} className="text-xs text-emerald-600 font-bold hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2">
              <HistoryIcon size={14} /> Refresh Data
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="p-4 font-bold">ID Transaksi</th>
                  <th className="p-4 font-bold">Pelanggan</th>
                  <th className="p-4 font-bold">Layanan</th>
                  <th className="p-4 font-bold">Total Bayar</th>
                  <th className="p-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {loading ? (
                  <tr><td colSpan={5} className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-emerald-600" /></td></tr>
                ) : recentPayments.length > 0 ? (
                  recentPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono text-xs text-slate-400">#{p.id.slice(0, 8)}</td>
                      <td className="p-4 font-bold text-slate-900">{p.users?.name || "User"}</td>
                      <td className="p-4 capitalize">{p.jenis_layanan}</td>
                      <td className="p-4 font-bold">Rp {Number(p.total_bayar).toLocaleString('id-ID')}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                          ['lunas', 'berhasil'].includes(p.status?.toLowerCase()) ? 'bg-emerald-100 text-emerald-700' : 
                          p.status === 'menunggu_verifikasi' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {p.status?.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="p-12 text-center text-slate-400">Belum ada transaksi.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function FinanceCard({ icon, label, value, color, trend }: any) {
  const colors: any = {
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
        {trend && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{trend}</span>}
      </div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  );
}