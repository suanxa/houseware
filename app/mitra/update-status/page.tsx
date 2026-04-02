"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { Loader2, CheckCircle, Package, Truck, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function UpdateStatusMitra() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) fetchActiveOrders();
  }, [session]);

  async function fetchActiveOrders() {
    setLoading(true);
    try {
      const { data: mitra } = await supabase
        .from("mitra")
        .select("id")
        .eq("user_id", session?.user?.id)
        .single();

      if (mitra) {
        const { data: p } = await supabase
          .from("penitipan_barang")
          .select("*, users(name), lokasi_penitipan!inner(mitra_id)")
          .eq("status", "active")
          .eq("lokasi_penitipan.mitra_id", mitra.id);

        const { data: a } = await supabase
          .from("angkutan_barang")
          .select("*, users(name)")
          .eq("status", "active")
          .eq("mitra", mitra.id);

        setOrders([
          ...(p?.map(item => ({ ...item, tipe: 'Penitipan' })) || []),
          ...(a?.map(item => ({ ...item, tipe: 'Angkutan' })) || [])
        ]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

const handleComplete = async (id: string, tipe: string) => {
  // Kita hapus window.confirm agar tidak ada lagi "pembatalan otomatis"
  setUpdating(id);
  const table = tipe === 'Penitipan' ? 'penitipan_barang' : 'angkutan_barang';
  
  // Gunakan toast loading agar user tahu proses sedang berjalan
  const toastId = toast.loading(`Sedang menyelesaikan tugas ${tipe}...`);
  
  try {
    const { error } = await supabase
      .from(table)
      .update({ status: 'completed' })
      .eq("id", id);

    if (error) throw error;

    // Berhasil!
    toast.success("Tugas Berhasil Diselesaikan! ✅", { id: toastId });
    
    // Refresh data agar kartu hilang
    await fetchActiveOrders();
    
  } catch (error: any) {
    console.error("Update Error:", error);
    toast.error("Gagal: " + error.message, { id: toastId });
  } finally {
    setUpdating(null);
  }
};

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      {/* Tambahkan relative z-0 agar tidak tertutup elemen fixed lainnya */}
      <main className="flex-1 p-8 overflow-y-auto relative z-0">
        <header className="mb-8">
          <Link href="/dashboard/mitra" className="text-amber-600 flex items-center gap-2 text-sm font-bold mb-4">
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl font-black text-slate-900 uppercase italic">Update Status 🛠️</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {loading ? (
            <div className="col-span-full text-center py-20"><Loader2 className="animate-spin mx-auto text-amber-500" /></div>
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative group overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${order.tipe === 'Penitipan' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                    {order.tipe === 'Penitipan' ? <Package size={28} /> : <Truck size={28} />}
                  </div>
                  <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">AKTIF</span>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-black text-slate-900 text-xl uppercase italic leading-none">{order.users?.name || "Pelanggan"}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">ID: {order.id.slice(0,8)}</p>
                </div>
                
                <div className="space-y-3 mb-8 p-5 bg-slate-50 rounded-3xl border border-slate-100 text-sm font-medium text-slate-600">
                  {order.tipe === 'Penitipan' ? (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black">Volume</span>
                      <p className="text-slate-900 font-bold">{order.jumlah} Unit</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-black">Tujuan</span>
                      <p className="text-slate-900 font-bold truncate">{order.alamat_tujuan}</p>
                    </div>
                  )}
                </div>

                {/* TOMBOL DENGAN PROTEKSI KLIK EKSTRIM */}
                <button 
                  type="button"
                  disabled={updating === order.id}
                  // Kita panggil langsung di onClick
                  onClick={(e) => {
                    e.preventDefault();
                    handleComplete(order.id, order.tipe);
                  }}
                  // Z-INDEX 50 dan POINTER EVENTS AUTO untuk memastikan klik sampai
                  className="relative z-50 pointer-events-auto w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all active:scale-95 disabled:bg-slate-200"
                >
                  {updating === order.id ? <Loader2 className="animate-spin" /> : <CheckCircle size={18} />}
                  Selesaikan Tugas
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center text-slate-400 italic">
              Tidak ada antrean tugas aktif.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}