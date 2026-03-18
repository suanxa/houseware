"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { 
  MapPin, 
  Store, 
  User, 
  Search, 
  Loader2, 
  ArrowLeft,
  ChevronRight,
  Building2,
  PackageCheck,
  Filter
} from "lucide-react";
import Link from "next/link";

// --- 1. DEFINISI INTERFACE (Agar tidak ada error merah) ---
interface Mitra {
  id: string;
  user_id: string;
  nama_mitra: string;
  users: {
    name: string;
    email: string;
  } | null;
}

interface LokasiGudang {
  id: string;
  nama_lokasi: string;
  alamat: string;
  kapasitas_tersisa: number;
  mitra: Mitra | null;
}

export default function PantauLokasiGudang() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMitra, setSelectedMitra] = useState("all");
  
  // Menggunakan tipe data yang sudah didefinisikan
  const [lokasiData, setLokasiData] = useState<LokasiGudang[]>([]);
  const [daftarMitra, setDaftarMitra] = useState<Mitra[]>([]);

  useEffect(() => {
    fetchLokasiGudang();
  }, []);

  async function fetchLokasiGudang() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lokasi_penitipan")
        .select(`
          id,
          nama_lokasi,
          alamat,
          kapasitas_tersisa,
          mitra (
            id,
            user_id,
            nama_mitra,
            users (
              name,
              email
            )
          )
        `)
        .order("nama_lokasi", { ascending: true });

      if (error) throw error;
      
      // Casting data ke interface LokasiGudang
      const hasilData = (data as unknown as LokasiGudang[]) || [];
      setLokasiData(hasilData);

      // Ambil daftar unik mitra untuk dropdown filter
      const uniqueMitra = Array.from(
        new Set(hasilData.filter((i) => i.mitra).map((item) => item.mitra!.id))
      )
        .map((id) => hasilData.find((item) => item.mitra?.id === id)?.mitra)
        .filter((m): m is Mitra => !!m); // Memastikan hasil bukan null/undefined
      
      setDaftarMitra(uniqueMitra);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  }

  // Filter gabungan
  const filteredData = lokasiData.filter((item) => {
    const matchesSearch = 
      item.nama_lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mitra?.nama_mitra?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMitra = selectedMitra === "all" || item.mitra?.id === selectedMitra;

    return matchesSearch && matchesMitra;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          
          {/* Header & Navigasi */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <Link href="/dashboard/superadmin" className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-2 transition-colors">
                <ArrowLeft size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Kembali ke Dashboard</span>
              </Link>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <MapPin className="text-blue-600" /> Pantau Lokasi Gudang
              </h1>
              <p className="text-slate-500 text-sm mt-1 font-medium">Monitoring seluruh titik distribusi dan mitra pengelola.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Filter Dropdown Mitra */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer min-w-[180px] text-slate-700"
                  value={selectedMitra}
                  onChange={(e) => setSelectedMitra(e.target.value)}
                >
                  <option value="all">Semua Mitra</option>
                  {daftarMitra.map((mitra) => (
                    <option key={mitra.id} value={mitra.id}>{mitra.nama_mitra}</option>
                  ))}
                </select>
                <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
              </div>

              {/* Pencarian Teks */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Cari gudang..."
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-full md:w-64 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Grid Statistik */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hasil Filter</p>
              <h3 className="text-3xl font-black text-slate-900">{filteredData.length} <span className="text-sm font-medium text-slate-400">Gudang</span></h3>
            </div>
            <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-200 text-white">
              <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mb-1">Total Mitra Terdaftar</p>
              <h3 className="text-3xl font-black">{new Set(lokasiData.map(l => l.mitra?.id)).size}</h3>
            </div>
          </div>

          {/* Daftar Gudang */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20">
              <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
              <p className="text-slate-400 font-medium animate-pulse">Menghubungkan ke satelit...</p>
            </div>
          ) : filteredData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredData.map((lokasi) => (
                <div key={lokasi.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group overflow-hidden flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-slate-50 text-slate-900 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <Building2 size={24} />
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-black uppercase tracking-tighter">
                        Aktif
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 mb-1">{lokasi.nama_lokasi}</h2>
                    <p className="text-sm text-slate-500 mb-6 flex items-start gap-2 italic leading-relaxed">
                      <MapPin size={14} className="mt-1 flex-shrink-0 text-slate-400" />
                      {lokasi.alamat}
                    </p>

                    <div className="space-y-3 pt-4 border-t border-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Store size={16} className="text-blue-500" />
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">Mitra</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{lokasi.mitra?.nama_mitra || "Tidak Terikat"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-slate-400" />
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-tight">PIC</span>
                        </div>
                        <span className="text-sm font-medium text-slate-900">{lokasi.mitra?.users?.name || "-"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center group-hover:bg-blue-50/50 transition-colors">
                    <div className="flex items-center gap-2">
                       <PackageCheck size={16} className="text-slate-400" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Kapasitas Pantauan</span>
                    </div>
                    <Link href={`/superadmin/lokasi/${lokasi.id}`} className="text-xs font-black text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
                      Detail Gudang <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-slate-200" size={40} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Gudang Tidak Ditemukan</h3>
              <p className="text-slate-400 text-sm">Coba sesuaikan filter mitra atau kata kunci pencarian Anda.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}