"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { 
  PackageSearch, Warehouse, Truck, AlertCircle, Loader2, Wallet, TrendingUp 
} from "lucide-react";
import Link from "next/link";

export default function MitraDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(true); // State baru untuk kontrol banner
  const [stats, setStats] = useState({ baru: 0, lokasi: 0, armada: 0, alert: 0, pendapatan: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (session?.user?.id) fetchMitraData();
  }, [session]);

  const formatIDR = (val: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

  async function fetchMitraData() {
    setLoading(true);
    try {
      // 1. Ambil data mitra
      const { data: mitra, error: mitraError } = await supabase
        .from("mitra")
        .select("id")
        .eq("user_id", session?.user?.id)
        .single();

      // LOGIKA BARU: Jika mitra tidak ditemukan (Error single() atau data null)
      if (mitraError || !mitra) {
        setIsProfileComplete(false); // Sembunyikan fitur lain, tampilkan banner
        setStats(prev => ({ ...prev, alert: 1 }));
        setLoading(false);
        return; 
      }

      // Jika ada data mitra, pastikan banner tidak muncul
      setIsProfileComplete(true);

      // 2. Jika mitra ditemukan, lanjutkan ambil data seperti biasa (Logika Asli Anda)
      const { count: cLokasi } = await supabase.from("lokasi_penitipan").select("*", { count: 'exact', head: true }).eq("mitra_id", mitra.id);
      const { count: cArmada } = await supabase.from("armada").select("*", { count: 'exact', head: true }).eq("mitra_id", mitra.id);
      
      const { data: penitipan } = await supabase
        .from("penitipan_barang")
        .select("*, users(name), jenis_barang:jenis_barang_id(harga_per_hari), lokasi_penitipan!inner(harga_per_hari)")
        .eq("lokasi_penitipan.mitra_id", mitra.id);

      const { data: angkutan } = await supabase
        .from("angkutan_barang")
        .select("*, users(name)")
        .eq("mitra", mitra.id);

      const getDurasi = (m: string, s: string) => {
              const d1 = new Date(m);
              const d2 = new Date(s);
              return Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) || 1;
            };

            // --- PERBAIKAN LOGIKA HAK MITRA (FLAT 80%) ---
            const hitungHak = (item: any, tipe: 'pen' | 'ang') => {
              if (tipe === 'pen') {
                const durasi = getDurasi(item.tanggal_mulai, item.tanggal_selesai);
                
                // Hitung total bayar pelanggan (Sewa + Ongkir)
                const totalTagihan = 
                  ((item.jenis_barang?.harga_per_hari || 0) * (item.jumlah || 1) * durasi) + 
                  (Number(item.ongkir_final) || 0);
                
                // Mitra langsung dapat 80% dari total tagihan tanpa syarat harga gudang
                return totalTagihan * 0.8;
              } else {
                // Angkutan juga tetap 80%
                return (Number(item.total_biaya) || 0) * 0.8;
              }
            };

      const lunasPen = (penitipan || []).filter(p => ['completed', 'selesai'].includes(p.status?.toLowerCase()));
      const lunasAng = (angkutan || []).filter(a => ['completed', 'selesai'].includes(a.status?.toLowerCase()));

      const totalPendapatan = 
        lunasPen.reduce((sum, p) => sum + hitungHak(p, 'pen'), 0) +
        lunasAng.reduce((sum, a) => sum + hitungHak(a, 'ang'), 0);

      const combined = [
        ...(penitipan?.map(p => ({ ...p, tipe: 'Penitipan', hak: hitungHak(p, 'pen') })) || []),
        ...(angkutan?.map(a => ({ ...a, tipe: 'Angkutan', hak: hitungHak(a, 'ang') })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setStats({
        baru: combined.filter(o => o.status === 'active').length,
        lokasi: cLokasi || 0,
        armada: cArmada || 0,
        alert: 0,
        pendapatan: totalPendapatan
      });
      setRecentOrders(combined.slice(0, 5));
      
    } catch (error) {
      console.error("Dashboard Error:", error);
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

        {/* LOGIKA PERBAIKAN BANNER: Hanya muncul jika profil benar-benar tidak ada di DB */}
        {!loading && !isProfileComplete && (
          <div className="mb-8 bg-amber-50 border-l-4 border-amber-500 p-6 rounded-2xl flex items-center justify-between shadow-sm animate-pulse">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500 text-white rounded-xl">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-amber-900">Profil Bisnis Belum Lengkap!</h4>
                <p className="text-amber-700 text-sm">Silakan lengkapi identitas mitra Anda untuk mulai menggunakan layanan House Ware.</p>
              </div>
            </div>
            <Link href="/mitra/settings" className="bg-amber-500 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-amber-600 transition-all">
              Lengkapi Profil
            </Link>
          </div>
        )}

        {/* --- HERO CARD PENDAPATAN --- */}
        <div className="w-full mb-8">
           <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                       <Wallet className="text-amber-400" size={20} />
                       <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Saldo Masuk (Selesai)</span>
                    </div>
                    <h2 className="text-4xl font-black">{formatIDR(stats.pendapatan)}</h2>
                    <p className="text-slate-400 text-[10px] mt-2 font-medium italic">*Hanya menjumlahkan layanan yang sudah berstatus 'Selesai'</p>
                 </div>
                 <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl backdrop-blur-md">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-emerald-500 rounded-lg text-white">
                          <TrendingUp size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-emerald-400 uppercase">Status Dompet</p>
                          <p className="text-xs font-bold text-white">Siap Dicairkan</p>
                       </div>
                    </div>
                 </div>
              </div>
              <Wallet size={180} className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700" />
           </div>
        </div>

        {/* Statistik Cepat */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<PackageSearch size={20} />} label="Tugas Aktif" value={stats.baru} color="blue" badge="ACTIVE" />
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

        {/* Tabel Layanan */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Tugas Layanan & Estimasi Hak</h3>
            <Link href="/mitra/update-status" className="text-xs bg-amber-500 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-amber-600 transition-colors">Update Status</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                <tr>
                  <th className="p-4">Pelanggan</th>
                  <th className="p-4">Layanan</th>
                  <th className="p-4">Estimasi Hak</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {loading ? (
                  <tr><td colSpan={5} className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-amber-500" /></td></tr>
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold">{order.users?.name}</td>
                      <td className="p-4">
                         <p className="font-semibold text-xs">{order.tipe}</p>
                         <p className="text-[10px] text-slate-400 italic">ID: {order.id.slice(0,8)}</p>
                      </td>
                      <td className="p-4 font-black text-slate-900">
                        {formatIDR(order.hak)}
                        {!['completed', 'selesai'].includes(order.status?.toLowerCase()) && (
                          <p className="text-[8px] text-amber-500 font-bold uppercase">Pending Saldo</p>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                          ['completed', 'selesai'].includes(order.status?.toLowerCase()) 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link href="/mitra/update-status" className="text-amber-600 hover:underline font-bold text-xs">Update</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 italic">Belum ada pesanan aktif.</td>
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