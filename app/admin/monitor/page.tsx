"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import Link from "next/link";
import { 
  Activity, Truck, Package, Clock, 
  CheckCircle2, AlertCircle, BarChart3, 
  MapPin, ArrowUpRight, Loader2, Search
} from "lucide-react";

export default function MonitorLayananAdmin() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    penitipan: [] as any[],
    angkutan: [] as any[]
  });
  const [activeTab, setActiveTab] = useState<"semua" | "penitipan" | "angkutan">("semua");

  useEffect(() => {
    fetchMonitorData();
    
    // SETUP REALTIME: Supaya Admin tahu jika ada pesanan masuk tanpa refresh
    const channel = supabase
      .channel("monitor-operasional")
      .on("postgres_changes", { event: "*", schema: "public", table: "penitipan_barang" }, () => fetchMonitorData())
      .on("postgres_changes", { event: "*", schema: "public", table: "angkutan_barang" }, () => fetchMonitorData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchMonitorData() {
    setLoading(true);
    try {
      const { data: p } = await supabase
        .from("penitipan_barang")
        .select("*, users(name), jenis_barang:jenis_barang_id(nama_jenis)")
        .order("created_at", { ascending: false });
      
      const { data: a } = await supabase
        .from("angkutan_barang")
        .select("*, users(name), armada:armada_id(jenis_kendaraan)")
        .order("created_at", { ascending: false });

      setData({ penitipan: p || [], angkutan: a || [] });
    } finally {
      setLoading(false);
    }
  }

  const allActivities = [
    ...data.penitipan.map(item => ({ ...item, tipe: "Penitipan" })),
    ...data.angkutan.map(item => ({ ...item, tipe: "Angkutan" }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* HEADER & ANALYTICS */}
        <header className="mb-8 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
               </span>
               <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Live Service Monitor 🛰️</h1>
            </div>
            <p className="text-slate-500 text-sm font-medium italic">Pemantauan arus layanan House Ware secara real-time.</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button onClick={() => setActiveTab("semua")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'semua' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>SEMUA</button>
            <button onClick={() => setActiveTab("penitipan")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'penitipan' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>PENITIPAN</button>
            <button onClick={() => setActiveTab("angkutan")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'angkutan' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>ANGKUTAN</button>
          </div>
        </header>

        {/* QUICK STATUS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatusCard label="Total Aktivitas" value={data.penitipan.length + data.angkutan.length} icon={<Activity size={18}/>} color="indigo" />
          <StatusCard label="Perlu Review" value={allActivities.filter(x => x.status === 'pending').length} icon={<Clock size={18}/>} color="amber" />
          <StatusCard label="Dalam Gudang" value={data.penitipan.filter(x => x.status === 'active').length} icon={<Package size={18}/>} color="blue" />
          <StatusCard label="Ritase Jalan" value={data.angkutan.filter(x => x.status === 'active').length} icon={<Truck size={18}/>} color="orange" />
        </div>

        {/* MONITORING LIST */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Arus Aktivitas Terkini</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="p-6">Waktu</th>
                  <th className="p-6">Layanan</th>
                  <th className="p-6">Pelanggan</th>
                  <th className="p-6">Detail Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading && allActivities.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
                ) : allActivities.filter(x => activeTab === 'semua' || x.tipe.toLowerCase() === activeTab).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6">
                      <p className="text-xs font-bold text-slate-900">{new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${item.tipe === 'Penitipan' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                          {item.tipe === 'Penitipan' ? <Package size={16}/> : <Truck size={16}/>}
                        </div>
                        <span className="text-xs font-black uppercase text-slate-400 tracking-tighter">{item.tipe}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-bold text-slate-800">{item.users?.name || "User"}</p>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {item.id.slice(0,8)}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-slate-600 italic">
                          {item.tipe === 'Penitipan' ? item.jenis_barang?.nama_jenis : `Rute: ${item.alamat_jemput?.slice(0,20)}...`}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${item.status === 'pending' ? 'bg-amber-400' : item.status === 'active' ? 'bg-emerald-400' : 'bg-blue-400'}`}></div>
                          <span className="text-[10px] font-black uppercase text-slate-400">{item.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusCard({ label, value, icon, color }: any) {
  const colors: any = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };
  return (
    <div className={`bg-white p-6 rounded-[2rem] border shadow-sm transition-all hover:shadow-md ${colors[color]}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-xl bg-white shadow-sm border border-inherit`}>{icon}</div>
        <BarChart3 size={16} className="opacity-20" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.1em] opacity-60 mb-1">{label}</p>
      <h3 className="text-3xl font-black tracking-tighter text-slate-900">{value}</h3>
    </div>
  );
}