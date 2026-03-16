"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { 
  PackageSearch, Warehouse, Truck, AlertCircle, Loader2 
} from "lucide-react";
import Link from "next/link";

export default function MitraDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ baru: 0, lokasi: 0, armada: 0, alert: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (session?.user?.id) fetchMitraData();
  }, [session]);

  async function fetchMitraData() {
    setLoading(true);
    try {
      // 1. Dapatkan ID Mitra dari user yang login
      const { data: mitra } = await supabase
        .from("mitra")
        .select("id")
        .eq("user_id", session?.user?.id)
        .single();

      if (mitra) {
        // 2. Ambil Stats (Lokasi & Armada milik Mitra ini)
        const { count: cLokasi } = await supabase.from("lokasi_penitipan").select("*", { count: 'exact', head: true }).eq("mitra_id", mitra.id);
        const { count: cArmada } = await supabase.from("armada").select("*", { count: 'exact', head: true }).eq("mitra_id", mitra.id);
        
        // 3. Ambil Pesanan Masuk (Status 'active' yang berarti sudah dibayar)
        // Note: Idealnya ada kolom mitra_id di tabel transaksi, atau join lewat lokasi/armada
        const { data: penitipan } = await supabase.from("penitipan_barang").select("*, users(name), lokasi_penitipan!inner(*)").eq("lokasi_penitipan.mitra_id", mitra.id).eq("status", "active");
        const { data: angkutan } = await supabase.from("angkutan_barang").select("*, users(name)").eq("status", "active"); // Sederhanakan untuk contoh

        const combined = [
          ...(penitipan?.map(p => ({ ...p, tipe: 'Penitipan' })) || []),
          ...(angkutan?.map(a => ({ ...a, tipe: 'Angkutan' })) || [])
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setStats({
          baru: combined.length,
          lokasi: cLokasi || 0,
          armada: cArmada || 0,
          alert: combined.filter(o => o.status === 'active').length
        });
        setRecentOrders(combined.slice(0, 5));
      }
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
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Mitra 🏢</h1>
            <p className="text-slate-500 text-sm">Kelola operasional penitipan dan armada Anda.</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{session?.user?.name}</p>
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase">
                  {session?.user?.role}
                </span>
             </div>
             <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {session?.user?.name?.charAt(0) || "M"}
             </div>
          </div>
        </header>

        {/* Statistik Cepat */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<PackageSearch size={20} />} label="Pesanan Siap" value={stats.baru} color="blue" badge="READY" />
          <StatCard icon={<Warehouse size={20} />} label="Lokasi Aktif" value={stats.lokasi} color="green" />
          <StatCard icon={<Truck size={20} />} label="Total Armada" value={stats.armada} color="purple" />
          <StatCard icon={<AlertCircle size={20} />} label="Perlu Update" value={stats.alert} color="red" />
        </div>

        {/* Management Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-6 hover:border-amber-500 transition-colors">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Manajemen Lokasi</h3>
              <p className="text-sm text-slate-500 mb-4">Atur kapasitas dan data gudang penitipan barang.</p>
              <Link href="/mitra/lokasi" className="text-amber-600 text-sm font-bold hover:underline">Kelola Sekarang →</Link>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl text-slate-400"><Warehouse size={40} /></div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-6 hover:border-amber-500 transition-colors">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Manajemen Armada</h3>
              <p className="text-sm text-slate-500 mb-4">Daftarkan kendaraan dan cek status pengiriman.</p>
              <Link href="/mitra/armada" className="text-amber-600 text-sm font-bold hover:underline">Kelola Sekarang →</Link>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl text-slate-400"><Truck size={40} /></div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Tugas Layanan Aktif</h3>
            <Link href="/mitra/update-status" className="text-xs bg-amber-500 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-amber-600 transition-colors">Update Status</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                <tr>
                  <th className="p-4">Pelanggan</th>
                  <th className="p-4">Layanan</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {loading ? (
                  <tr><td colSpan={4} className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-amber-500" /></td></tr>
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold">{order.users?.name}</td>
                      <td className="p-4">
                         <p className="font-semibold text-xs">{order.tipe}</p>
                         <p className="text-[10px] text-slate-400 italic">ID: {order.id.slice(0,8)}</p>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-green-100 text-green-700 uppercase">{order.status}</span>
                      </td>
                      <td className="p-4">
                        <Link href="/mitra/update-status" className="text-amber-600 hover:underline font-bold text-xs">Update</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-400 italic">Belum ada pesanan aktif.</td>
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

function StatCard({ icon, label, value, color, badge }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
        {badge && <span className={`text-[10px] font-bold ${colors[color]} px-2 py-1 rounded`}>{badge}</span>}
      </div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  );
}