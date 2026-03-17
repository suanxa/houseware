"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { 
  Wallet, ArrowUpRight, ArrowDownRight, 
  Loader2, CheckCircle2, Clock, 
  History, TrendingUp, HandCoins, BarChart3,
  Filter, Package, Truck, Calendar as CalendarIcon, Info, Printer
} from "lucide-react";

export default function TransaksiGlobal() {
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [mitras, setMitras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [selectedMitra, setSelectedMitra] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Stats dinamis berdasarkan filter (Hanya menghitung yang Completed)
  const [displayStats, setDisplayStats] = useState({ labaBersih: 0, hakMitra: 0, grossTotal: 0 });

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Re-kalkulasi statistik saat filter berubah
  useEffect(() => {
    const filtered = currentFilteredData();

    // LOGIKA KRUSIAL: Statistik hanya menghitung yang statusnya 'completed' atau 'selesai'
    const finalSettled = filtered.filter(t => 
      ['completed', 'selesai', 'lunas'].includes(t.status?.toLowerCase())
    );

    setDisplayStats({
      labaBersih: finalSettled.reduce((sum, item) => sum + item.labaAdmin, 0),
      hakMitra: finalSettled.reduce((sum, item) => sum + item.bagianMitra, 0),
      grossTotal: finalSettled.reduce((sum, item) => sum + item.nominal, 0)
    });
  }, [selectedMitra, startDate, endDate, transaksi]);

  async function fetchInitialData() {
    setLoading(true);
    try {
      const { data: mData } = await supabase.from("mitra").select("id, nama_mitra");
      setMitras(mData || []);

      const { data: pen } = await supabase.from("penitipan_barang").select(`
          *, 
          users:user_id(name),
          jenis_barang:jenis_barang_id (harga_per_hari),
          lokasi_penitipan ( mitra_id, harga_per_hari, mitra ( nama_mitra ) )
      `);

      const { data: ang } = await supabase.from("angkutan_barang").select("*, users:user_id(name)");

      const getDurasi = (m: string, s: string) => {
        const d1 = new Date(m);
        const d2 = new Date(s);
        return Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) || 1;
      };

      const penMapped = (pen || []).map((p) => {
        const durasi = getDurasi(p.tanggal_mulai, p.tanggal_selesai);
        const totalTagihan = ((p.jenis_barang?.harga_per_hari || 0) * (p.jumlah || 1) * durasi) + (Number(p.ongkir_final) || 0);
        const biayaGudangMitra = (p.lokasi_penitipan?.harga_per_hari || 0) * durasi;
        
        let bagianMitra = 0;
        let labaAdmin = totalTagihan;
        if (totalTagihan > biayaGudangMitra) {
          bagianMitra = biayaGudangMitra;
          labaAdmin = totalTagihan - biayaGudangMitra;
        }

        return {
          id: p.id,
          created_at: p.created_at,
          customer: p.users?.name || 'Guest',
          mitra_id: p.lokasi_penitipan?.mitra_id,
          nama_mitra: p.lokasi_penitipan?.mitra?.nama_mitra || 'Internal',
          tipe: 'penitipan',
          nominal: totalTagihan,
          labaAdmin,
          bagianMitra,
          status: p.status,
          skema: totalTagihan > biayaGudangMitra ? "Potong Sewa Gudang" : "Laba Penuh (Bawah Limit)"
        };
      });

      const angMapped = (ang || []).map((a) => {
        const totalBiaya = Number(a.total_biaya) || 0;
        const mtrObj = mData?.find((m) => m.id === a.mitra); 
        
        return {
          id: a.id,
          created_at: a.created_at,
          customer: a.users?.name || 'Guest',
          mitra_id: a.mitra,
          nama_mitra: mtrObj?.nama_mitra || 'Internal',
          tipe: 'angkutan',
          nominal: totalBiaya,
          labaAdmin: totalBiaya * 0.2,
          bagianMitra: totalBiaya * 0.8,
          status: a.status,
          skema: "Potongan Sistem 20%"
        };
      });

      const combined = [...penMapped, ...angMapped].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setTransaksi(combined);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const currentFilteredData = () => {
    return transaksi.filter(t => {
      const matchMitra = selectedMitra === "all" || t.mitra_id === selectedMitra;
      const matchStart = !startDate || new Date(t.created_at) >= new Date(startDate);
      const endLimit = endDate ? new Date(endDate).setHours(23,59,59) : null;
      const matchEnd = !endLimit || new Date(t.created_at) <= new Date(endLimit);
      return matchMitra && matchStart && matchEnd;
    });
  };

  const formatIDR = (val: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="no-print"><Sidebar /></div>
      <main className="flex-1 p-8 overflow-y-auto printable-content">
        
        {/* HEADER & FILTERS */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 no-print">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">FINANCIAL AUDIT 💰</h1>
            <p className="text-slate-500 text-sm">Monitoring laba bersih dan kewajiban mitra (Final Settled).</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
            >
              <Printer size={16} /> Cetak PDF
            </button>

            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
               <Filter size={16} className="text-slate-400" />
               <select 
                 className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 cursor-pointer"
                 value={selectedMitra}
                 onChange={(e) => setSelectedMitra(e.target.value)}
               >
                 <option value="all">Semua Mitra</option>
                 {mitras.map(m => <option key={m.id} value={m.id}>{m.nama_mitra}</option>)}
               </select>
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-xs font-bold text-slate-700">
               <CalendarIcon size={16} className="text-slate-400" />
               <input type="date" className="bg-transparent border-none focus:ring-0 p-0 text-[10px]" onChange={(e) => setStartDate(e.target.value)} />
               <span className="text-slate-300 mx-1">-</span>
               <input type="date" className="bg-transparent border-none focus:ring-0 p-0 text-[10px]" onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <button onClick={fetchInitialData} className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-700 transition-all">
              <History size={18} />
            </button>
          </div>
        </header>

        {/* KOP LAPORAN (Hanya saat cetak) */}
        <div className="only-print text-center border-b-4 border-double border-slate-900 pb-6 mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Laporan Keuangan House Ware</h1>
          <p className="text-sm font-bold text-slate-600 mt-2 text-center">
            Periode: {startDate || 'Awal'} s/d {endDate || 'Hari Ini'} | Mitra: {selectedMitra === 'all' ? 'Semua Mitra' : mitras.find(m => m.id === selectedMitra)?.nama_mitra}
          </p>
          <p className="text-[10px] mt-2 italic text-slate-400 text-center">Dicetak secara otomatis pada: {new Date().toLocaleString('id-ID')}</p>
        </div>

        {/* STATS CARDS - Hanya Menghitung yang Selesai */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-red-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-red-100 print:shadow-none print:border print:border-red-800">
             <div className="flex justify-between items-start mb-2">
               <p className="text-red-100 text-[10px] font-bold uppercase tracking-widest">Net Admin Profit</p>
               <CheckCircle2 size={14} className="text-red-300" />
             </div>
             <h2 className="text-3xl font-black">{formatIDR(displayStats.labaBersih)}</h2>
             <p className="text-[9px] text-red-200 italic mt-2 font-medium">*Hanya transaksi berstatus Selesai</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm print:shadow-none">
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Hak Mitra</p>
             <h2 className="text-3xl font-black text-slate-900">{formatIDR(displayStats.hakMitra)}</h2>
             <p className="text-[9px] text-slate-400 italic mt-2 font-medium">*Dana siap bayar ke mitra</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm print:shadow-none">
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Gross Merchandise Value</p>
             <h2 className="text-3xl font-black text-slate-900">{formatIDR(displayStats.grossTotal)}</h2>
             <p className="text-[9px] text-slate-400 italic mt-2 font-medium">*Total omzet final disetujui</p>
          </div>
        </div>

        {/* MAIN TABLE */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Transaksi</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Layanan & Tanggal</th>
                  <th className="p-6 text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">Bagi Mitra</th>
                  <th className="p-6 text-[10px] font-black text-red-600 uppercase tracking-widest text-center">Net Admin</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center italic">Status & Skema</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {loading ? (
                  <tr><td colSpan={5} className="p-32 text-center font-bold text-slate-400">SINKRONISASI DATA...</td></tr>
                ) : currentFilteredData().length > 0 ? (
                  currentFilteredData().map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="p-6">
                        <p className="font-black text-slate-900 text-sm italic tracking-tighter capitalize">{item.customer}</p>
                        <p className="text-[10px] text-blue-500 font-bold uppercase mt-0.5">Partner: {item.nama_mitra}</p>
                        <p className="text-[9px] text-slate-300 font-mono mt-1 italic uppercase tracking-tighter">REF: {item.id.slice(0,8)}</p>
                      </td>
                      <td className="p-6 text-center">
                         <div className="flex flex-col items-center gap-1">
                            <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase border shadow-sm ${
                              item.tipe === 'penitipan' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                              {item.tipe === 'penitipan' ? <Package size={10}/> : <Truck size={10}/>}
                              {item.tipe}
                            </span>
                            <p className="text-[10px] font-black text-slate-900 italic leading-none mt-1">
                              {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                            <p className="text-[9px] font-bold text-slate-400">{formatIDR(item.nominal)}</p>
                         </div>
                      </td>
                      <td className="p-6 text-center font-black text-blue-600">{formatIDR(item.bagianMitra)}</td>
                      <td className="p-6 text-center bg-red-50/20 font-black text-red-600 italic">{formatIDR(item.labaAdmin)}</td>
                      <td className="p-6">
                         <div className="flex flex-col items-center gap-2">
                            {/* Badge Status */}
                            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase border shadow-sm ${
                              ['completed', 'selesai', 'lunas'].includes(item.status?.toLowerCase())
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}>
                              {['completed', 'selesai', 'lunas'].includes(item.status?.toLowerCase()) ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                              {item.status || 'PROCESS'}
                            </span>
                            {/* Skema Teks */}
                            <div className="flex items-center gap-1.5 opacity-60">
                               <Info size={10} className="text-slate-400" />
                               <span className="text-[9px] font-medium italic text-slate-400 leading-tight">{item.skema}</span>
                            </div>
                         </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="p-20 text-center text-slate-400 italic font-bold">Tidak ada data untuk filter ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CSS UNTUK PRINT */}
        <style jsx global>{`
          @media print {
            .no-print { display: none !important; }
            .only-print { display: block !important; }
            body { background: white !important; }
            main { padding: 0 !important; margin: 0 !important; }
            .printable-content { width: 100% !important; }
            @page { size: A4 landscape; margin: 10mm; }
            .bg-red-700 { background-color: #b91c1c !important; -webkit-print-color-adjust: exact; color: white !important; }
            .bg-red-50\/20 { background-color: rgba(254, 242, 242, 0.5) !important; -webkit-print-color-adjust: exact; }
            .text-red-600 { color: #dc2626 !important; -webkit-print-color-adjust: exact; }
            .text-blue-600 { color: #2563eb !important; -webkit-print-color-adjust: exact; }
            .print-table { border: 1px solid #e2e8f0 !important; }
          }
          .only-print { display: none; }
        `}</style>
      </main>
    </div>
  );
}