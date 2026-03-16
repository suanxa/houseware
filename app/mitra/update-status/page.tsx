"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { Loader2, CheckCircle, Package, Truck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UpdateStatusMitra() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  async function fetchActiveOrders() {
    setLoading(true);
    // Ambil semua pesanan yang statusnya 'active'
    const { data: p } = await supabase.from("penitipan_barang").select("*, users(name)").eq("status", "active");
    const { data: a } = await supabase.from("angkutan_barang").select("*, users(name)").eq("status", "active");

    const combined = [
      ...(p?.map(item => ({ ...item, tipe: 'Penitipan' })) || []),
      ...(a?.map(item => ({ ...item, tipe: 'Angkutan' })) || [])
    ];
    setOrders(combined);
    setLoading(false);
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
          <h1 className="text-2xl font-bold text-slate-900">Update Status Layanan 🛠️</h1>
          <p className="text-slate-500 text-sm font-medium">Selesaikan tugas layanan yang telah Anda kerjakan.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-20"><Loader2 className="animate-spin mx-auto text-amber-500" /></div>
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${order.tipe === 'Penitipan' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                    {order.tipe === 'Penitipan' ? <Package size={24} /> : <Truck size={24} />}
                  </div>
                  <span className="text-[10px] font-black uppercase bg-green-100 text-green-700 px-2 py-1 rounded tracking-widest">SIAP DIKERJAKAN</span>
                </div>
                
                <h4 className="font-bold text-slate-900 text-lg mb-1">{order.users?.name}</h4>
                <p className="text-xs text-slate-500 font-medium mb-4 italic">Layanan {order.tipe} - #{order.id.slice(0,8)}</p>
                
                <div className="space-y-2 mb-6 text-sm text-slate-600">
                  {order.tipe === 'Penitipan' ? (
                    <p>📦 Jumlah: <span className="font-bold">{order.jumlah} Unit</span></p>
                  ) : (
                    <p>📍 Ke: <span className="font-bold truncate inline-block w-40 align-bottom">{order.alamat_tujuan}</span></p>
                  )}
                </div>

                <button 
                  disabled={updating === order.id}
                  onClick={() => handleComplete(order.id, order.tipe)}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:bg-slate-300"
                >
                  {updating === order.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                  Selesaikan Tugas
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white p-20 rounded-3xl border border-dashed border-slate-300 text-center">
               <p className="text-slate-400 font-bold">Tidak ada tugas layanan aktif saat ini.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}