"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { 
  Truck, Plus, Trash2, 
  Loader2, X, Banknote 
} from "lucide-react";

export default function KelolaArmadaMitra() {
  const { data: session } = useSession();
  const [armada, setArmada] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [form, setForm] = useState({
    jenis_kendaraan: "",
    plat_nomor: "",
    kapasitas: "",
    harga_sewa: "" // Kolom baru
  });

  useEffect(() => {
    if (session?.user?.id) fetchArmada();
  }, [session]);

  async function fetchArmada() {
    setLoading(true);
    try {
      // 1. Ambil ID Mitra
      const { data: mitra } = await supabase
        .from("mitra")
        .select("id")
        .eq("user_id", session?.user?.id)
        .single();
      
      if (mitra) {
        // Ambil data, jika created_at belum ada, hapus bagian .order()
        const { data, error } = await supabase
          .from("armada")
          .select("*")
          .eq("mitra_id", mitra.id)
          .order("id", { ascending: false }); // Gunakan ID sebagai urutan aman
        
        if (!error) setArmada(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddArmada(e: React.FormEvent) {
    e.preventDefault();
    
    const { data: mitra } = await supabase
      .from("mitra")
      .select("id")
      .eq("user_id", session?.user?.id)
      .single();
      
    if (!mitra) return alert("Data mitra tidak ditemukan.");

    const { error } = await supabase.from("armada").insert([{
      mitra_id: mitra.id,
      jenis_kendaraan: form.jenis_kendaraan,
      plat_nomor: form.plat_nomor,
      kapasitas: parseInt(form.kapasitas),
      harga_sewa: parseInt(form.harga_sewa || "0"), // Insert harga sewa
      status: "tersedia"
    }]);

    if (error) {
      alert("Gagal: " + error.message);
    } else {
      setShowModal(false);
      setForm({ jenis_kendaraan: "", plat_nomor: "", kapasitas: "", harga_sewa: "" });
      fetchArmada();
      alert("Armada berhasil ditambahkan!");
    }
  }

  async function deleteArmada(id: string) {
    if (confirm("Hapus armada ini?")) {
      await supabase.from("armada").delete().eq("id", id);
      fetchArmada();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manajemen Armada 🚚</h1>
            <p className="text-slate-500 text-sm">Kelola kendaraan dan tentukan harga sewa Anda.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-all"
          >
            <Plus size={18} /> Tambah Armada
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" /></div>
          ) : armada.length > 0 ? (
            armada.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative group">
                <button onClick={() => deleteArmada(item.id)} className="absolute top-4 right-4 text-slate-200 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
                    <Truck size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 uppercase">{item.jenis_kendaraan}</h3>
                    <p className="text-[10px] font-mono text-slate-400 tracking-widest">{item.plat_nomor}</p>
                  </div>
                </div>

                {/* Tampilan Harga Sewa */}
                <div className="mb-4 p-3 bg-emerald-50 rounded-xl flex items-center justify-between border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Harga Sewa</span>
                  <span className="text-sm font-black text-emerald-700">
                    Rp {Number(item.harga_sewa || 0).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                  <span className="text-xs font-medium text-slate-500">Cap: <span className="text-slate-900">{item.kapasitas} Kg</span></span>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.status === 'tersedia' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white p-20 rounded-3xl border-2 border-dashed border-slate-200 text-center">
              <p className="text-slate-400 font-medium italic">Belum ada armada terdaftar.</p>
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-900 text-sm">Tambah Unit Armada</h3>
                <button onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddArmada} className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Jenis Kendaraan</label>
                  <input required className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900" placeholder="Contoh: Mitsubishi L300" onChange={(e) => setForm({...form, jenis_kendaraan: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Plat Nomor</label>
                    <input required className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900" placeholder="B 1234 ABC" onChange={(e) => setForm({...form, plat_nomor: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Kapasitas (Kg)</label>
                    <input required type="number" className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900" placeholder="1000" onChange={(e) => setForm({...form, kapasitas: e.target.value})} />
                  </div>
                </div>
                {/* Input Harga Sewa Baru */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Harga Sewa (Per Jasa)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">Rp</span>
                    <input required type="number" className="w-full p-3 pl-10 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900" placeholder="150000" onChange={(e) => setForm({...form, harga_sewa: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold mt-4 hover:bg-slate-800 transition-all">Simpan Armada</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}