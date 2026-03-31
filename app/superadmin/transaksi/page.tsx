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
  
  const [selectedMitra, setSelectedMitra] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [displayStats, setDisplayStats] = useState({ labaBersih: 0, hakMitra: 0, grossTotal: 0 });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const filtered = currentFilteredData();
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
    // 1. Ambil data mitra untuk identifikasi nama
    const { data: mData } = await supabase.from("mitra").select("id, nama_mitra");
    setMitras(mData || []);

    // 2. AMBIL DARI TABEL PEMBAYARAN (Sama dengan Finance)
    const { data: payments } = await supabase
      .from("pembayaran")
      .select(`*, users ( name )`)
      .in("status", ["lunas", "berhasil", "Lunas", "Berhasil"]) // Filter yang uangnya sudah masuk
      .order("tanggal_bayar", { ascending: false });

    // 3. Ambil data pendukung untuk mencari Mitra ID
    const { data: penitipan } = await supabase.from("penitipan_barang")
      .select(`id, lokasi_penitipan ( mitra_id )`) as any;
    const { data: angkutan } = await supabase.from("angkutan_barang")
      .select("id, mitra") as any;

    // 4. Mapping data agar formatnya sesuai dengan tabel Superadmin
    const mappedData = (payments || []).map(p => {
      let mitraId = null;
      const nominal = Number(p.total_bayar) || 0;

      // Cari siapa Mitranya berdasarkan transaksi_id
      if (p.jenis_layanan?.toLowerCase() === 'penitipan') {
        const detail = penitipan?.find((d: any) => d.id === p.transaksi_id);
        mitraId = detail?.lokasi_penitipan?.mitra_id;
      } else {
        const detailAng = angkutan?.find((d: any) => d.id === p.transaksi_id);
        mitraId = detailAng?.mitra;
      }

      const mitraObj = mData?.find(m => m.id === mitraId);

      return { 
        id: p.id,
        created_at: p.tanggal_bayar, // Pakai tanggal bayar agar sinkron
        customer: p.users?.name || 'Guest',
        mitra_id: mitraId, // Agar filter mitra berfungsi
        nama_mitra: mitraObj?.nama_mitra || 'Internal/Sistem',
        tipe: p.jenis_layanan,
        nominal: nominal,
        labaAdmin: nominal * 0.2, // Langsung 20%
        bagianMitra: nominal * 0.8, // Langsung 80%
        status: p.status,
        skema: "Flat 80% Mitra" // Keterangan untuk ikon "!"
      };
    });

    setTransaksi(mappedData);
  } catch (error) {
    console.error("Error Superadmin Sync:", error);
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
        
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 no-print">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Financial Audit 💰</h1>
            <p className="text-slate-500 text-sm font-medium">Monitoring laba bersih (20%) dan hak mitra (80%) secara transparan.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
            >
              <Printer size={16} /> Cetak Laporan
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

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-red-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-red-100">
             <div className="flex justify-between items-start mb-2">
               <p className="text-red-100 text-[10px] font-bold uppercase tracking-widest">Net Admin Profit (20%)</p>
               <CheckCircle2 size={14} className="text-red-300" />
             </div>
             <h2 className="text-3xl font-black">{formatIDR(displayStats.labaBersih)}</h2>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Hak Mitra (80%)</p>
             <h2 className="text-3xl font-black text-slate-900">{formatIDR(displayStats.hakMitra)}</h2>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Gross Omzet</p>
             <h2 className="text-3xl font-black text-slate-900">{formatIDR(displayStats.grossTotal)}</h2>
          </div>
        </div>

        {/* MAIN TABLE */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase tracking-widest font-black text-slate-400">
                <tr>
                  <th className="p-6">Detail Transaksi</th>
                  <th className="p-6 text-center">Layanan</th>
                  <th className="p-6 text-center text-blue-600">Bagian Mitra</th>
                  <th className="p-6 text-center text-red-600">Net Admin</th>
                  <th className="p-6 text-center italic">Status & Skema</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {loading ? (
                  <tr><td colSpan={5} className="p-32 text-center font-bold text-slate-400">MEMUAT DATA...</td></tr>
                ) : currentFilteredData().length > 0 ? (
                  currentFilteredData().map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="p-6">
                        <p className="font-black text-slate-900 italic tracking-tighter capitalize">{item.customer}</p>
                        <p className="text-[10px] text-blue-500 font-bold uppercase mt-0.5">Partner: {item.nama_mitra}</p>
                        <p className="text-[9px] text-slate-300 font-mono mt-1 italic uppercase tracking-tighter">REF: {item.id.slice(0,8)}</p>
                      </td>
                      <td className="p-6 text-center">
                         <div className="flex flex-col items-center gap-1">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border shadow-sm ${
                              item.tipe === 'penitipan' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                              {item.tipe}
                            </span>
                            <p className="text-[10px] font-black text-slate-900 italic leading-none mt-1">
                              {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                            </p>
                         </div>
                      </td>
                      <td className="p-6 text-center font-black text-blue-600">{formatIDR(item.bagianMitra)}</td>
                      <td className="p-6 text-center bg-red-50/20 font-black text-red-600 italic">{formatIDR(item.labaAdmin)}</td>
                      <td className="p-6 text-center">
                         <div className="flex flex-col items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border shadow-sm ${
                              ['completed', 'selesai', 'lunas'].includes(item.status?.toLowerCase())
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : 'bg-slate-50 text-slate-400 border-slate-200'
                            }`}>
                              {item.status || 'PROCESS'}
                            </span>
                            <span className="text-[9px] font-medium italic text-slate-400 leading-tight flex items-center gap-1">
                               <Info size={10} /> {item.skema}
                            </span>
                         </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="p-20 text-center text-slate-400 italic font-bold">Data kosong.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <style jsx global>{`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; }
            main { padding: 0 !important; }
            .printable-content { width: 100% !important; }
            @page { size: A4 landscape; margin: 10mm; }
            .bg-red-700 { background-color: #b91c1c !important; -webkit-print-color-adjust: exact; color: white !important; }
            .bg-red-50\/20 { background-color: rgba(254, 242, 242, 0.5) !important; -webkit-print-color-adjust: exact; }
          }
        `}</style>
      </main>
    </div>
  );
}