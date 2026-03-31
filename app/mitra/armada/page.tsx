"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { 
  Truck, Plus, Trash2, 
  Loader2, X 
} from "lucide-react";

export default function KelolaArmadaMitra() {
  const { data: session } = useSession();
  const [armada, setArmada] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // State untuk Form Input
  const [form, setForm] = useState({
    jenis_kendaraan: "",
    plat_nomor: "",
    kapasitas: ""
  });

  useEffect(() => {
    if (session?.user?.id) fetchArmada();
  }, [session]);

  async function fetchArmada() {
    setLoading(true);
    // 1. Ambil ID Mitra
    const { data: mitra } = await supabase.from("mitra").select("id").eq("user_id", session?.user?.id).single();
    
    if (mitra) {
      const { data } = await supabase.from("armada").select("*").eq("mitra_id", mitra.id);
      setArmada(data || []);
    }
    setLoading(false);
  }

  async function handleAddArmada(e: React.FormEvent) {
    e.preventDefault();
    
    // 1. Ambil data mitra
    const { data: mitra, error: mitraError } = await supabase
      .from("mitra")
      .select("id")
      .eq("user_id", session?.user?.id)
      .single();
      
    // 2. Cek apakah mitra ditemukan 
    if (mitraError || !mitra) {
      alert("Data mitra tidak ditemukan. Silahkan hubungi admin.");
      return;
    }

    // 3. Insert armada 
    const { error } = await supabase.from("armada").insert([{
      mitra_id: mitra.id,
      jenis_kendaraan: form.jenis_kendaraan,
      plat_nomor: form.plat_nomor,
      kapasitas: parseInt(form.kapasitas),
      status: "tersedia"
    }]);

    if (error) {
      alert("Gagal menambah armada: " + error.message);
    } else {
      // --- PERBAIKAN DI SINI ---
      setShowModal(false); // Menutup modal otomatis setelah berhasil
      setForm({ jenis_kendaraan: "", plat_nomor: "", kapasitas: "" }); // Reset form agar bersih kembali
      fetchArmada(); // Refresh daftar data di layar
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
            <p className="text-slate-500 text-sm">Daftarkan dan pantau status kendaraan angkut Anda.</p>
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
                <button 
                  onClick={() => deleteArmada(item.id)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                >
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

                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                  <span className="text-xs font-medium text-slate-500">Kapasitas: <span className="text-slate-900">{item.kapasitas} Kg</span></span>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    item.status === 'tersedia' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
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

        {/* --- MODAL TAMBAH ARMADA --- */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-900">Tambah Unit Armada</h3>
                <button onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleAddArmada} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Jenis Kendaraan</label>
                  <input 
                    required 
                    placeholder="Contoh: Mitsubishi L300 / Truk Engkel"
                    className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                    value={form.jenis_kendaraan}
                    onChange={(e) => setForm({...form, jenis_kendaraan: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Plat Nomor</label>
                    <input 
                      required 
                      placeholder="B 1234 ABC"
                      className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                      value={form.plat_nomor}
                      onChange={(e) => setForm({...form, plat_nomor: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Kapasitas (Kg)</label>
                    <input 
                      required 
                      type="number"
                      placeholder="1000"
                      className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                      value={form.kapasitas}
                      onChange={(e) => setForm({...form, kapasitas: e.target.value})}
                    />
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