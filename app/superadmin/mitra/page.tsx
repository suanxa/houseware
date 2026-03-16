"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { 
  Store, Trash2, MapPin, 
  Truck, Loader2, Search, 
  ExternalLink, ChevronRight
} from "lucide-react";

export default function KelolaMitraSuper() {
  const [mitraList, setMitraList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMitraData();
  }, []);

  async function fetchMitraData() {
    setLoading(true);
    try {
      // Kita tambahkan lokasi_penitipan dan armada ke dalam select
      const { data, error } = await supabase
        .from("mitra")
        .select(`
          id,
          nama_mitra,
          alamat,
          telepon,
          user_id,
          users ( name, email ),
          lokasi_penitipan ( id ),
          armada ( id )
        `);

      if (error) {
        console.error("Kesalahan Query:", error.message);
        return;
      }

      console.log("Data Mitra Lengkap:", data);
      setMitraList(data || []);
    } catch (err) {
      console.error("Kesalahan Sistem:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredMitra = mitraList.filter(m => 
    m.nama_mitra?.toLowerCase().includes(searchTerm.toLowerCase()) || // Ubah ini
    m.users?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Direktori Mitra Bisnis 🤝</h1>
            <p className="text-slate-500 text-sm">Pantau dan kelola seluruh partner penyedia jasa.</p>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari mitra atau pemilik..."
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-full md:w-64 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-sm text-slate-400">Memuat data mitra...</p>
            </div>
          ) : filteredMitra.length > 0 ? (
            filteredMitra.map((mitra) => (
  <div key={mitra.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 group">
    <div className="flex items-start gap-5">
      {/* Icon Mitra */}
      <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
        <Store size={28} />
      </div>

      {/* Info Utama Mitra */}
      <div>
        {/* Perbaikan: Menggunakan nama_mitra */}
        <h3 className="font-bold text-slate-900 text-lg uppercase tracking-tight">
          {mitra.nama_mitra || "Mitra Tanpa Nama"}
        </h3>
        
        <div className="flex flex-col gap-1 mt-1">
          {/* Info Owner */}
          <p className="text-sm text-slate-600 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
            Owner: {mitra.users?.name || 'Tidak Terdeteksi'}
          </p>
          
          {/* Info Kontak & Alamat */}
          <div className="flex flex-col gap-0.5 mt-1">
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <span className="font-bold text-slate-400">TELP:</span> {mitra.telepon || '-'}
            </p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <span className="font-bold text-slate-400">ALAMAT:</span> {mitra.alamat || '-'}
            </p>
            <p className="text-[10px] text-blue-500 italic lowercase">{mitra.users?.email}</p>
          </div>
        </div>
      </div>
    </div>

    {/* Statistik & Aksi */}
    <div className="flex flex-wrap items-center gap-3">
      {/* Badge Gudang */}
      <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 flex items-center gap-3">
        <div className="p-1.5 bg-white rounded-lg shadow-sm text-amber-600"><MapPin size={16} /></div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Gudang</p>
          <p className="text-sm font-bold text-slate-900">{mitra.lokasi_penitipan?.length || 0} Titik</p>
        </div>
      </div>

      {/* Badge Armada */}
      <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 flex items-center gap-3">
        <div className="p-1.5 bg-white rounded-lg shadow-sm text-blue-600"><Truck size={16} /></div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Armada</p>
          <p className="text-sm font-bold text-slate-900">{mitra.armada?.length || 0} Unit</p>
        </div>
      </div>
      
      {/* Tombol Detail */}
      <button className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 active:scale-95">
        <ChevronRight size={20} />
      </button>
    </div>
  </div>
))
          ) : (
            <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <p className="text-slate-400 italic">Tidak ada mitra yang ditemukan.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}