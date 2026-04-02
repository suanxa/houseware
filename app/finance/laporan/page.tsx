"use client";

import { useState, useEffect, Suspense } from "react"; // Tambahkan Suspense
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { useSearchParams } from "next/navigation"; // Import ini
import { 
  FileText, Printer, Calendar as CalendarIcon, 
  Filter, Search, ArrowLeft, Download, Loader2,
  Users, Wallet, Landmark
} from "lucide-react";
import Link from "next/link";

// Bungkus dalam komponen Content agar useSearchParams bisa bekerja dengan baik di Next.js
function LaporanContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const action = searchParams.get("action"); // Ambil param ?action=...

  const [dataLaporan, setDataLaporan] = useState<any[]>([]);
  const [mitras, setMitras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedMitra, setSelectedMitra] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  // LOGIKA OTOMATIS PRINT
  useEffect(() => {
    if (!loading && dataLaporan.length > 0 && action === "print") {
      const timer = setTimeout(() => {
        window.print();
      }, 1000); // Beri waktu 1 detik agar browser selesai render tabel sebelum print
      return () => clearTimeout(timer);
    }
  }, [loading, dataLaporan, action]);

  async function fetchInitialData() {
    setLoading(true);
    try {
      const { data: mData } = await supabase.from("mitra").select("id, nama_mitra");
      setMitras(mData || []);

      const { data: payments } = await supabase
        .from("pembayaran")
        .select(`*, users ( name )`)
        .in("status", ["lunas", "berhasil", "Lunas", "Berhasil"])
        .order("tanggal_bayar", { ascending: false });

      const { data: penitipan } = await supabase.from("penitipan_barang")
        .select(`id, lokasi_penitipan ( mitra_id )`) as any;

      const { data: angkutan } = await supabase.from("angkutan_barang")
        .select("id, mitra") as any;

      const mappedData = (payments || []).map(p => {
        let mitraId = null;
        const nominal = Number(p.total_bayar) || 0;

        if (p.jenis_layanan?.toLowerCase() === 'penitipan') {
          const detail = penitipan?.find((d: any) => d.id === p.transaksi_id);
          mitraId = detail?.lokasi_penitipan?.mitra_id;
        } else {
          const detailAng = angkutan?.find((d: any) => d.id === p.transaksi_id);
          mitraId = detailAng?.mitra;
        }

        // PERHITUNGAN FLAT 80/20
        const toMitra = nominal * 0.8;
        const netAdmin = nominal * 0.2;
        const mitraObj = mData?.find(m => m.id === mitraId);

        return { 
          ...p, 
          netAdmin, 
          toMitra, 
          mitra_id: mitraId, 
          nama_mitra: mitraObj?.nama_mitra || 'Internal/Sistem' 
        };
      });

      setDataLaporan(mappedData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const filteredLaporan = dataLaporan.filter(item => {
    const matchSearch = item.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMitra = selectedMitra === "all" || item.mitra_id === selectedMitra;
    const matchStart = !startDate || new Date(item.tanggal_bayar) >= new Date(startDate);
    const endLimit = endDate ? new Date(endDate).setHours(23,59,59) : null;
    const matchEnd = !endLimit || new Date(item.tanggal_bayar) <= new Date(endLimit);
    return matchSearch && matchMitra && matchStart && matchEnd;
  });

  const totals = {
    gross: filteredLaporan.reduce((sum, i) => sum + Number(i.total_bayar), 0),
    net: filteredLaporan.reduce((sum, i) => sum + i.netAdmin, 0),
    mitra: filteredLaporan.reduce((sum, i) => sum + i.toMitra, 0)
  };

  const formatIDR = (val: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="no-print"><Sidebar /></div>
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 no-print">
          <div>
            <Link href="/finance" className="text-emerald-600 flex items-center gap-2 text-sm font-bold mb-2">
              <ArrowLeft size={16} /> Dashboard Keuangan
            </Link>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">FINANCIAL REPORT 📝</h1>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Audit & Profit Sharing Summary</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              <Printer size={18} /> Cetak Laporan
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 no-print">
          <div className="md:col-span-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900" size={16} />
            <input 
              type="text" 
              placeholder="Cari transaksi..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-4 flex items-center gap-3">
             <Users size={16} className="text-slate-400" />
             <select 
               className="w-full py-3 border-none focus:ring-0 text-sm font-bold text-slate-700 bg-transparent"
               value={selectedMitra}
               onChange={(e) => setSelectedMitra(e.target.value)}
             >
               <option value="all">Semua Mitra</option>
               {mitras.map(m => <option key={m.id} value={m.id}>{m.nama_mitra}</option>)}
             </select>
          </div>
          <div className="md:col-span-2 flex items-center gap-2 bg-white border border-slate-200 px-4 rounded-xl">
            <CalendarIcon size={16} className="text-slate-400" />
            <input type="date" className="border-none focus:ring-0 text-sm font-bold text-slate-700 bg-transparent w-full" onChange={(e) => setStartDate(e.target.value)} />
            <span className="text-slate-300 font-bold">sampai</span>
            <input type="date" className="border-none focus:ring-0 text-sm font-bold text-slate-700 bg-transparent w-full" onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="only-print text-center border-b-4 border-double border-slate-900 pb-8 mb-10">
           <h1 className="text-5xl font-black uppercase tracking-tighter italic">HOUSE WARE</h1>
           <p className="text-slate-500 font-black mt-2 text-sm uppercase tracking-[0.3em]">Official Financial Audit Report</p>
           <div className="mt-6 flex justify-center gap-10 text-[10px] font-bold uppercase border-t pt-4">
              <p>Periode: {startDate || 'Awal'} - {endDate || 'Sekarang'}</p>
              <p>Mitra: {selectedMitra === 'all' ? 'Seluruh Partner' : mitras.find(m => m.id === selectedMitra)?.nama_mitra}</p>
              <p>Dicetak: {new Date().toLocaleString('id-ID')}</p>
           </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Detail Transaksi</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Partner Mitra</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Gross Total</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-blue-600 text-right italic">Hak Mitra</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-emerald-600 text-right italic">Net Admin</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-600" /></td></tr>
              ) : filteredLaporan.length > 0 ? (
                filteredLaporan.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5">
                       <p className="font-black text-slate-900 leading-none mb-1">{item.users?.name}</p>
                       <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">#{item.id.slice(0,8)}</span>
                          <span className="text-[9px] font-black text-slate-300 uppercase px-1 border rounded">{item.jenis_layanan}</span>
                       </div>
                    </td>
                    <td className="p-5">
                       <p className="text-xs font-bold text-slate-600">{item.nama_mitra}</p>
                       <p className="text-[10px] text-slate-400 font-medium italic">{new Date(item.tanggal_bayar).toLocaleDateString('id-ID')}</p>
                    </td>
                    <td className="p-5 text-right font-bold text-slate-900">{formatIDR(item.total_bayar)}</td>
                    <td className="p-5 text-right font-black text-blue-600">{formatIDR(item.toMitra)}</td>
                    <td className="p-5 text-right font-black text-emerald-600">{formatIDR(item.netAdmin)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="p-20 text-center text-slate-300 italic font-bold">Data tidak ditemukan.</td></tr>
              )}
            </tbody>
            <tfoot className="bg-slate-900 text-white font-black">
              <tr>
                <td colSpan={2} className="p-8 text-right uppercase tracking-[0.2em] text-xs">Total Rekapitulasi:</td>
                <td className="p-8 text-right text-slate-400 text-base">{formatIDR(totals.gross)}</td>
                <td className="p-8 text-right text-blue-400 text-base italic">{formatIDR(totals.mitra)}</td>
                <td className="p-8 text-right text-emerald-400 text-xl italic">{formatIDR(totals.net)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="only-print mt-24 flex justify-end px-10">
           <div className="text-center w-72">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-20">Authorized Finance Officer</p>
              <div className="border-t-2 border-slate-900 pt-3">
                 <p className="text-sm font-black underline uppercase">{session?.user?.name || 'Admin Finance'}</p>
                 <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">Finance & Settlement Dept.</p>
              </div>
           </div>
        </div>

        <style jsx global>{`
          @media print {
            .no-print { display: none !important; }
            .only-print { display: block !important; }
            @page { size: A4 portrait; margin: 15mm; }
            body { background: white !important; -webkit-print-color-adjust: exact; }
            .bg-slate-900 { background-color: #0f172a !important; color: white !important; }
            .text-emerald-600 { color: #059669 !important; }
            .text-blue-600 { color: #2563eb !important; }
          }
          .only-print { display: none; }
        `}</style>
      </main>
    </div>
  );
}

// Komponen Utama dengan Suspense agar tidak error saat build/runtime Next.js
export default function LaporanFinance() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>}>
            <LaporanContent />
        </Suspense>
    );
}