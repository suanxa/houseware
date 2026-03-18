"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { 
  Users, ClipboardCheck, MapPin, Truck, Search,
  CheckCircle, XCircle, MoreVertical, Loader2, Package
} from "lucide-react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pelanggan: 0, pending: 0, lokasi: 0, armada: 0 });
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const { count: countUser } = await supabase.from("users").select("*", { count: 'exact', head: true }).eq("role", "pelanggan");
      const { count: countLokasi } = await supabase.from("lokasi_penitipan").select("*", { count: 'exact', head: true });
      const { count: countArmada } = await supabase.from("armada").select("*", { count: 'exact', head: true });

      // 2. Fetch Pending Orders (Gabungan Penitipan & Angkutan)
      const { data: pPenitipan } = await supabase.from("penitipan_barang").select("*, users(name)").eq("status", "pending");
      const { data: pAngkutan } = await supabase.from("angkutan_barang").select("*, users(name)").eq("status", "pending");

      const combinedPending = [
        ...(pPenitipan?.map(p => ({ ...p, tipe: 'Penitipan' })) || []),
        ...(pAngkutan?.map(a => ({ ...a, tipe: 'Angkutan' })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setStats({
        pelanggan: countUser || 0,
        pending: combinedPending.length,
        lokasi: countLokasi || 0,
        armada: countArmada || 0
      });
      setPendingOrders(combinedPending);
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (id: string, tipe: string) => {
    const table = tipe === 'Penitipan' ? 'penitipan_barang' : 'angkutan_barang';
    const { error } = await supabase.from(table).update({ status: "waiting_payment" }).eq("id", id);
    if (!error) {
      alert("Pesanan disetujui! Menunggu pembayaran pelanggan.");
      fetchAdminData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Operasional Admin 🛠️</h1>
            <p className="text-slate-500">Kelola pesanan, pelanggan, dan verifikasi layanan.</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{session?.user?.name}</p>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {session?.user?.role}
                </span>
             </div>
             <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {session?.user?.name?.charAt(0) || "A"}
             </div>
          </div>
        </header>

        {/* 1. Statistics Cards (Live Data) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<Users size={20} />} label="Total Pelanggan" value={stats.pelanggan} color="indigo" />
          <StatCard icon={<ClipboardCheck size={20} />} label="Perlu Verifikasi" value={stats.pending} color="amber" badge="PENDING" />
          <StatCard icon={<MapPin size={20} />} label="Lokasi Penitipan" value={stats.lokasi} color="blue" />
          <StatCard icon={<Truck size={20} />} label="Total Armada" value={stats.armada} color="slate" />
        </div>

        {/* 2. Management Table Area */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-bold text-slate-900">Antrean Verifikasi Pesanan</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Cari pesanan..." className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-full md:w-64 outline-none" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="p-4 font-bold">Layanan & Pelanggan</th>
                  <th className="p-4 font-bold">Detail Barang</th>
                  <th className="p-4 font-bold">Tgl Pesan</th>
                  <th className="p-4 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {loading ? (
                  <tr><td colSpan={4} className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" /></td></tr>
                ) : pendingOrders.length > 0 ? (
                  pendingOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${order.tipe === 'Penitipan' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                            {order.tipe === 'Penitipan' ? <Package size={16} /> : <Truck size={16} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{order.users?.name || "Pelanggan"}</p>
                            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">ID: {order.id.slice(0,8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{order.tipe === 'Penitipan' ? `Jumlah: ${order.jumlah} Unit` : `Tujuan: ${order.alamat_tujuan.substring(0,25)}...`}</p>
                        <p className="text-[10px] text-slate-400">{order.tipe} Barang</p>
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-500">
                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleApprove(order.id, order.tipe)} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm">
                            <CheckCircle size={18} />
                          </button>
                          <button className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm">
                            <XCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-400 italic">Antrean kosong. Semua pesanan sudah diverifikasi!</td>
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
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    slate: "bg-slate-50 text-slate-600",
  };
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
        {badge && <span className={`text-[10px] font-bold ${colors[color]} px-2 py-1 rounded`}>{badge}</span>}
      </div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  );
}