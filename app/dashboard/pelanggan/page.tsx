"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { Loader2, Truck, Package, AlertCircle } from "lucide-react";

export default function PelangganDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ penitipan: 0, angkutan: 0, tagihan: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session]);

  const hitungDurasiHari = (mulai: string, selesai: string) => {
    const d1 = new Date(mulai);
    const d2 = new Date(selesai);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // 1. Ambil Data Penitipan
      const { data: penitipan, count: countPenitipan } = await supabase
        .from("penitipan_barang")
        .select(`
          id, status, created_at, tanggal_mulai, tanggal_selesai, jumlah, ongkir_final, 
          jenis_barang:jenis_barang_id (nama_jenis, harga_per_hari)
        `, { count: 'exact' })
        .eq("user_id", session?.user?.id);

      // 2. Ambil Data Angkutan
      const { data: angkutan, count: countAngkutan } = await supabase
        .from("angkutan_barang")
        .select("*", { count: 'exact' })
        .eq("user_id", session?.user?.id);

      // 3. LOGIKA HITUNG TOTAL TAGIHAN GABUNGAN (Filter Status)
      let totalTagihan = 0;
      const statusTagihanAktif = ['waiting_payment', 'waiting_confirmation', 'active'];

      // Hitung dari Penitipan
      penitipan?.forEach((order: any) => {
        if (statusTagihanAktif.includes(order.status) && order.jenis_barang) {
          const durasi = hitungDurasiHari(order.tanggal_mulai, order.tanggal_selesai);
          const biayaSewa = (order.jenis_barang.harga_per_hari || 0) * (order.jumlah || 1) * durasi;
          const biayaOngkir = Number(order.ongkir_final) || 0;
          totalTagihan += (biayaSewa + biayaOngkir);
        }
      });

      // Hitung dari Angkutan
      angkutan?.forEach((order: any) => {
        if (statusTagihanAktif.includes(order.status)) {
          totalTagihan += (Number(order.total_biaya) || 0);
        }
      });

      // 4. Gabungkan untuk Tabel Riwayat
      const combinedOrders = [
        ...(penitipan?.map(p => ({ ...p, tipe: 'Penitipan' })) || []),
        ...(angkutan?.map(a => ({ ...a, tipe: 'Angkutan' })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setStats({
        penitipan: countPenitipan || 0,
        angkutan: countAngkutan || 0,
        tagihan: totalTagihan,
      });
      setRecentOrders(combinedOrders.slice(0, 5));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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
            <h1 className="text-2xl font-bold text-slate-900">Halo, {session?.user?.name || "Pelanggan"}! 👋</h1>
            <p className="text-slate-500 font-medium text-sm">Monitor seluruh aktivitas House Ware Anda.</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{session?.user?.email}</p>
                <p className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase inline-block">
                  {session?.user?.role}
                </p>
             </div>
             <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {session?.user?.name?.charAt(0) || "U"}
             </div>
          </div>
        </header>

        {/* --- Statistik Cepat --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">Total Penitipan</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.penitipan} <span className="text-sm font-normal text-slate-400">Item</span></h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">Total Angkutan</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.angkutan} <span className="text-sm font-normal text-slate-400">Ritase</span></h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-red-500">
            <div className="flex justify-between items-center mb-1">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tagihan Perlu Dibayar</p>
              <AlertCircle size={14} className="text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-red-600">
              Rp {stats.tagihan.toLocaleString('id-ID')}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 italic">*Hanya menampilkan pesanan yang disetujui admin</p>
          </div>
        </div>

        {/* --- Shortcut Layanan --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-600 p-8 rounded-2xl text-white shadow-lg shadow-blue-100 relative overflow-hidden group">
            <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Pesan Penitipan</h3>
                <p className="text-blue-100 text-sm mb-4">Simpan barang berharga Anda di gudang kami.</p>
                <Link href="/penitipan/buat" className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition-all text-sm">
                  Buat Pesanan Baru
                </Link>
            </div>
            <Package className="absolute right-[-10px] bottom-[-10px] w-32 h-32 text-white/10 group-hover:rotate-12 transition-transform duration-500" />
          </div>

          <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-lg shadow-slate-200 relative overflow-hidden group">
            <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Sewa Angkutan</h3>
                <p className="text-slate-400 text-sm mb-4">Layanan jemput dan antar barang profesional.</p>
                <Link href="/angkutan/buat" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all text-sm">
                  Pesan Armada
                </Link>
            </div>
            <Truck className="absolute right-[-10px] bottom-[-10px] w-32 h-32 text-white/5 group-hover:rotate-12 transition-transform duration-500" />
          </div>
        </div>

        {/* --- Tabel Riwayat --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Aktivitas Terakhir</h3>
            <Link href="/riwayat" className="text-sm text-blue-600 font-medium hover:underline">Lihat Semua</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest">
                <tr>
                  <th className="p-4 font-bold">Layanan</th>
                  <th className="p-4 font-bold">Detail Barang / Rute</th>
                  <th className="p-4 font-bold text-center">Status</th>
                  <th className="p-4 font-bold text-right">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td>
                  </tr>
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <span className={`font-bold ${order.tipe === 'Penitipan' ? 'text-blue-600' : 'text-orange-600'}`}>
                          {order.tipe}
                        </span>
                      </td>
                      <td className="p-4">
                        {order.tipe === 'Penitipan' ? (
                          <div className="flex flex-col">
                            <span className="font-semibold">{order.jenis_barang?.nama_jenis || "Tanpa Kategori"}</span>
                            <span className="text-xs text-slate-400">{order.jumlah} Unit</span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-semibold line-clamp-1">{typeof order.jenis_barang === 'string' ? order.jenis_barang : 'Detail Angkutan'}</span>
                            <span className="text-xs text-slate-400 line-clamp-1 truncate max-w-[200px]">{order.alamat_jemput} → {order.alamat_tujuan}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                          order.status === 'pending' ? 'bg-slate-100 text-slate-500' : 
                          order.status === 'waiting_payment' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right text-xs text-slate-400 font-medium">
                        {new Date(order.created_at).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-slate-400">Belum ada aktivitas.</td>
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