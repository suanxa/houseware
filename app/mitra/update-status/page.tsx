"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // Tambahkan ini
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { Loader2, CheckCircle, Package, Truck, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function UpdateStatusMitra() {
  const { data: session } = useSession(); // Ambil session
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchActiveOrders();
    }
  }, [session]);

  async function fetchActiveOrders() {
    setLoading(true);
    try {
      // 1. Ambil ID Mitra terlebih dahulu
      const { data: mitra } = await supabase
        .from("mitra")
        .select("id")
        .eq("user_id", session?.user?.id)
        .single();

      if (mitra) {
        // 2. Ambil Penitipan yang tujuannya ke lokasi milik mitra ini
        const { data: p } = await supabase
          .from("penitipan_barang")
          .select("*, users(name), lokasi_penitipan!inner(mitra_id)")
          .eq("status", "active")
          .eq("lokasi_penitipan.mitra_id", mitra.id);

        // 3. Ambil Angkutan yang ditugaskan ke mitra ini
        const { data: a } = await supabase
          .from("angkutan_barang")
          .select("*, users(name)")
          .eq("status", "active")
          .eq("mitra", mitra.id); // Pastikan nama kolom di DB adalah 'mitra' (sesuai dashboard Anda sebelumnya)

        const combined = [
          ...(p?.map(item => ({ ...item, tipe: 'Penitipan' })) || []),
          ...(a?.map(item => ({ ...item, tipe: 'Angkutan' })) || [])
        ];
        
        setOrders(combined);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleComplete = async (id: string, tipe: string) => {
    const confirm = window.confirm("Konfirmasi bahwa layanan ini telah selesai?");
    if (!confirm) return;

    setUpdating(id);
    const table = tipe === 'Penitipan' ? 'penitipan_barang' : 'angkutan_barang';
    
    const { error } = await supabase
      .from(table)
      .update({ status: 'completed' })
      .eq("id", id);

    if (!error) {
      alert("Status diperbarui ke Selesai!");
      fetchActiveOrders();
    } else {
      alert("Gagal memperbarui status: " + error.message);
    }
    setUpdating(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-8">
          <Link href="/dashboard/mitra" className="text-amber-600 flex items-center gap-2 text-sm font-bold mb-4 hover:underline">
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Update Status Layanan 🛠️</h1>
          <p className="text-slate-500 text-sm font-medium">Hanya menampilkan tugas yang ditugaskan kepada Anda.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-20 flex flex-col items-center">
              <Loader2 className="animate-spin text-amber-500 mb-2" size={32} />
              <p className="text-slate-400 text-sm font-bold italic">Mensinkronisasi tugas...</p>
            </div>
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${order.tipe === 'Penitipan' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                    {order.tipe === 'Penitipan' ? <Package size={28} /> : <Truck size={28} />}
                  </div>
                  <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full tracking-widest">AKTIF</span>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-black text-slate-900 text-xl tracking-tight uppercase italic">{order.users?.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {order.id.slice(0,8)}</p>
                </div>
                
                <div className="space-y-3 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-medium text-slate-600">
                  {order.tipe === 'Penitipan' ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Barang Disimpan</span>
                      <p className="text-slate-900 font-bold">{order.jumlah} Unit</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Tujuan Pengantaran</span>
                      <p className="text-slate-900 font-bold truncate leading-relaxed">{order.alamat_tujuan}</p>
                    </div>
                  )}
                </div>

                <button 
                  disabled={updating === order.id}
                  onClick={() => handleComplete(order.id, order.tipe)}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-lg active:scale-95 disabled:bg-slate-200"
                >
                  {updating === order.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                  Selesaikan Tugas
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-slate-300" size={40} />
              </div>
              <p className="text-slate-500 font-black uppercase tracking-tighter italic">Bagus! Tidak ada antrean tugas.</p>
              <p className="text-slate-400 text-sm mt-1">Semua pesanan Anda telah diproses atau belum ada pesanan baru.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}