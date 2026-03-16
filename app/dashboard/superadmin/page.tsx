"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { 
  ShieldCheck, Users, Store, Receipt, BarChart3, 
  Settings, UserPlus, Eye, Activity, MapPin, Loader2
} from "lucide-react";
import Link from "next/link";

export default function SuperAdminDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, mitra: 0, transaksi: 0 });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  async function fetchSuperAdminData() {
    setLoading(true);
    try {
      // 1. Hitung Jumlah Pengguna (Selain Superadmin)
      const { count: userCount } = await supabase
        .from("users")
        .select("*", { count: 'exact', head: true })
        .neq("role", "superadmin");

      // 2. Hitung Jumlah Mitra
      const { count: mitraCount } = await supabase
        .from("mitra")
        .select("*", { count: 'exact', head: true });

      // 3. Hitung Total Transaksi Lunas (Dari tabel pembayaran)
      const { count: transCount } = await supabase
        .from("pembayaran")
        .select("*", { count: 'exact', head: true })
        .eq("status", "lunas");

      setStats({
        users: userCount || 0,
        mitra: mitraCount || 0,
        transaksi: transCount || 0
      });

      // 4. Ambil Aktivitas Terkini (Mengambil data pendaftaran user terbaru)
      const { data: logs } = await supabase
        .from("users")
        .select("name, role, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      
      setRecentLogs(logs || []);
    } catch (error) {
      console.error("Superadmin Error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Super Admin Dashboard 🛡️</h1>
            <p className="text-slate-500">Pusat kendali tertinggi sistem House Ware.</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{session?.user?.name}</p>
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-red-200">
                  {session?.user?.role}
                </span>
             </div>
             <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {session?.user?.name?.charAt(0) || "S"}
             </div>
          </div>
        </header>

        {/* 1. Ringkasan Data Utama (Live Stats) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<Users size={20} />} label="Jumlah Pengguna" value={stats.users} color="blue" />
          <StatCard icon={<Store size={20} />} label="Jumlah Mitra" value={stats.mitra} color="amber" />
          <StatCard icon={<Receipt size={20} />} label="Transaksi Lunas" value={stats.transaksi} color="emerald" />
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg w-fit mb-4"><BarChart3 size={20} /></div>
            <p className="text-sm text-slate-500 font-medium">Laporan Sistem</p>
            <button className="text-xs font-bold text-red-600 hover:underline mt-2">Export Data (PDF/Excel)</button>
          </div>
        </div>

        {/* 2. Fitur Utama (Sesuai Catatan) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Manajemen Staff */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-red-600" />
              Manajemen Staff
            </h3>
            <div className="space-y-3">
              <Link href="/superadmin/users" className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200 group">
                <span className="text-sm font-medium">Kelola Admin & Finance</span>
                <UserPlus size={16} className="text-slate-400 group-hover:text-red-600" />
              </Link>
              <Link href="/superadmin/mitra" className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200 group">
                <span className="text-sm font-medium">Kelola Data Mitra</span>
                <Store size={16} className="text-slate-400 group-hover:text-red-600" />
              </Link>
            </div>
          </div>

          {/* Monitoring & Transaksi */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-blue-600" />
              Monitoring Layanan
            </h3>
            <div className="space-y-3">
              <Link href="/superadmin/transaksi" className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200 group">
                <span className="text-sm font-medium">Monitoring Transaksi</span>
                <Eye size={16} className="text-slate-400 group-hover:text-blue-600" />
              </Link>
              <Link href="/superadmin/lokasi" className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200 group">
                <span className="text-sm font-medium">Pantau Lokasi Gudang</span>
                <MapPin size={16} className="text-slate-400 group-hover:text-blue-600" />
              </Link>
            </div>
          </div>

          {/* Pengaturan Sistem */}
          <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-amber-400">
                <Settings size={20} />
                Pengaturan Sistem
              </h3>
              <p className="text-xs text-slate-400 mb-6">Konfigurasi biaya layanan, maintenance mode, dan pengaturan keamanan.</p>
              <Link href="/superadmin/settings" className="block w-full text-center bg-white text-slate-900 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-all">
                Buka Pengaturan
              </Link>
            </div>
            <Settings size={100} className="absolute -right-8 -bottom-8 text-white/5 group-hover:rotate-45 transition-transform duration-700" />
          </div>
        </div>

        {/* 3. Live Audit / User Logs (Sesuai Catatan) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Pendaftaran Pengguna Terkini</h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold uppercase tracking-tighter">Live Audit</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" /></td></tr>
                ) : recentLogs.length > 0 ? (
                  recentLogs.map((log, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-4 text-sm font-medium text-slate-700">
                        <span className="font-bold">{log.name}</span> baru saja mendaftar sebagai <span className="text-red-600 uppercase font-bold text-[10px]">{log.role}</span>
                      </td>
                      <td className="p-4 text-right text-xs text-slate-400 italic">
                        {new Date(log.created_at).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="p-10 text-center text-slate-400 italic">Belum ada aktivitas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub Component StatCard
function StatCard({ icon, label, value, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className={`p-2 ${colors[color]} rounded-lg w-fit mb-4`}>{icon}</div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  );
}