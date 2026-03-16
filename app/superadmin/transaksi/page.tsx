"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { 
  Wallet, ArrowUpRight, ArrowDownRight, 
  Loader2, CheckCircle2, Clock, 
  History, TrendingUp
} from "lucide-react";

export default function TransaksiGlobal() {
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, penitipan: 0, angkutan: 0 });

  useEffect(() => {
    fetchTransaksi();
  }, []);

  async function fetchTransaksi() {
    setLoading(true);
    try {
      // 1. Ambil data Penitipan
      const { data: pen } = await supabase
        .from("penitipan_barang")
        .select(`
          *, 
          users:user_id(name),
          jenis_barang:jenis_barang_id (harga_per_hari),
          lokasi_penitipan ( mitra_id )
        `);

      // 2. Ambil data Angkutan (Ambil kolom 'mitra' sebagai ID)
      const { data: ang } = await supabase
        .from("angkutan_barang")
        .select("*, users:user_id(name)");

      // 3. Ambil Master Data Mitra & Lokasi untuk mapping manual
      const { data: mitras } = await supabase.from("mitra").select("id, nama_mitra");
      const { data: lokasis } = await supabase.from("lokasi_penitipan").select("id, mitra_id");

      const getDurasi = (m: string, s: string) => {
        const d1 = new Date(m);
        const d2 = new Date(s);
        return Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) || 1;
      };

      // 4. Mapping Penitipan
      const penMapped = (pen || []).map((p) => {
        const durasi = getDurasi(p.tanggal_mulai, p.tanggal_selesai);
        const biayaSewa = (p.jenis_barang?.harga_per_hari || 0) * (p.jumlah || 1) * durasi;
        const totalFinal = biayaSewa + (Number(p.ongkir_final) || 0);
        
        // Cari mitra lewat lokasi_penitipan
        const lok = lokasis?.find(l => l.id === p.lokasi_id);
        const mtr = mitras?.find(m => m.id === lok?.mitra_id);

        return {
          id: p.id,
          created_at: p.created_at,
          customer: p.users?.name || 'Guest',
          nama_mitra: mtr?.nama_mitra || 'Internal',
          tipe: 'penitipan',
          nominal: totalFinal,
          status: p.status
        };
      });

      // 5. Mapping Angkutan (PASTIKAN BAGIAN INI)
      const angMapped = (ang || []).map((a) => {
        // Cari mitra berdasarkan kolom 'mitra' di tabel angkutan_barang
        const mtr = mitras?.find((m) => m.id === a.mitra); 
        
        return {
          id: a.id,
          created_at: a.created_at,
          customer: a.users?.name || 'Guest',
          nama_mitra: mtr?.nama_mitra || 'Internal', // Jika null, tampilkan 'Internal'
          tipe: 'angkutan',
          nominal: Number(a.total_biaya) || 0,
          status: a.status
        };
      });

      const combined = [...penMapped, ...angMapped].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // 6. Update Stats
      const totalPen = penMapped.reduce((sum, item) => sum + item.nominal, 0);
      const totalAng = angMapped.reduce((sum, item) => sum + item.nominal, 0);

      setStats({
        total: totalPen + totalAng,
        penitipan: totalPen,
        angkutan: totalAng
      });
      setTransaksi(combined);

    } catch (error) {
      console.error("Critical Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const formatIDR = (val: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header Section */}
        <header className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-red-600 rounded-lg text-white"><TrendingUp size={16} /></div>
              <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">Financial Audit</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Laporan Transaksi Global</h1>
            <p className="text-slate-500 text-sm">Monitoring arus kas dari seluruh layanan House Ware.</p>
          </div>
          <button 
            onClick={fetchTransaksi}
            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <History size={14} /> Refresh Laporan
          </button>
        </header>

        {/* Statistik Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-300 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md"><Wallet size={24} /></div>
                <span className="text-[10px] font-black bg-emerald-500 text-white px-3 py-1 rounded-full uppercase">Live Update</span>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Omzet Keseluruhan</p>
              <h2 className="text-3xl font-black">{formatIDR(stats.total)}</h2>
            </div>
            <div className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform duration-700">
               <Wallet size={160} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative group overflow-hidden">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl w-fit mb-6"><ArrowUpRight size={24} /></div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Pendapatan Gudang</p>
            <h2 className="text-2xl font-black text-slate-900">{formatIDR(stats.penitipan)}</h2>
            <div className="absolute right-0 bottom-0 w-2 h-24 bg-amber-400 opacity-0 group-hover:opacity-100 transition-all" />
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative group overflow-hidden">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-6"><ArrowDownRight size={24} /></div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Pendapatan Angkutan</p>
            <h2 className="text-2xl font-black text-slate-900">{formatIDR(stats.angkutan)}</h2>
            <div className="absolute right-0 bottom-0 w-2 h-24 bg-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
          </div>
        </div>

        {/* Activity Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-slate-900 uppercase tracking-tight">Log Transaksi Terintegrasi</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                Total {transaksi.length} Data
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Ref ID / Tanggal</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Pihak Terlibat</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Layanan</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Nominal Pembayaran</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">Status Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-32 text-center">
                      <Loader2 className="animate-spin mx-auto text-red-600 mb-4" size={40} />
                      <p className="text-sm text-slate-400 font-bold animate-pulse">MENGUMPULKAN DATA KEUANGAN...</p>
                    </td>
                  </tr>
                ) : transaksi.length > 0 ? (
                  transaksi.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="p-6">
                        <p className="font-black text-slate-900 text-xs uppercase italic tracking-tighter">#{item.id.slice(0, 8)}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      </td>
                      <td className="p-6">
                        <p className="text-sm font-black text-slate-800 capitalize">{item.customer}</p>
                        <p className="text-[10px] text-red-600 font-black uppercase tracking-widest mt-0.5">Mitra: {item.nama_mitra}</p>
                      </td>
                      <td className="p-6">
                        <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl shadow-sm border ${
                          item.tipe === 'penitipan' 
                            ? 'bg-amber-50 text-amber-700 border-amber-100' 
                            : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {item.tipe.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-6 font-black text-slate-900 text-sm italic">{formatIDR(item.nominal)}</td>
                      <td className="p-6 text-center">
                        <div className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl border font-black text-[9px] tracking-widest shadow-sm ${
                          ['Selesai', 'active', 'lunas'].includes(item.status?.toLowerCase())
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                          {['Selesai', 'active', 'lunas'].includes(item.status?.toLowerCase()) ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                          {item.status?.toUpperCase() || 'PROCESS'}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-32 text-center text-slate-300">
                      <History size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="italic text-sm">Belum ada rekaman transaksi yang divalidasi hari ini.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}