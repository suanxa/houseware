"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { 
  Warehouse, Plus, Trash2, 
  MapPin, Box, Loader2, X 
} from "lucide-react";

export default function KelolaLokasiMitra() {
  const { data: session } = useSession();
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [form, setForm] = useState({
    nama_lokasi: "",
    alamat: "",
    kapasitas: "",
    harga_per_hari: ""
  });

  useEffect(() => {
    if (session?.user?.id) fetchLocations();
  }, [session]);

  async function fetchLocations() {
    setLoading(true);
    // 1. Ambil ID Mitra berdasarkan user yang login
    const { data: mitra } = await supabase
      .from("mitra")
      .select("id")
      .eq("user_id", session?.user?.id)
      .single();
    
    if (mitra) {
      // 2. Ambil semua lokasi milik mitra tersebut
      const { data } = await supabase
        .from("lokasi_penitipan")
        .select("*")
        .eq("mitra_id", mitra.id);
      setLocations(data || []);
    }
    setLoading(false);
  }

  async function handleAddLocation(e: React.FormEvent) {
    e.preventDefault();
    
    // 1. Ambil data mitra dengan proteksi error
    const { data: mitra, error: mitraError } = await supabase
      .from("mitra")
      .select("id")
      .eq("user_id", session?.user?.id)
      .single();

    // Proteksi: Jika data mitra tidak ditemukan, jangan lanjut ke proses insert
    if (mitraError || !mitra) {
      alert("Gagal mengambil data Mitra. Silakan pastikan akun Anda sudah terdaftar sebagai Mitra.");
      return;
    }

    // 2. Proses Insert 
    const { error } = await supabase.from("lokasi_penitipan").insert([{
      mitra_id: mitra.id, 
      nama_lokasi: form.nama_lokasi,
      alamat: form.alamat,
      kapasitas_maksimal: parseInt(form.kapasitas) || 0,
      kapasitas_tersisa: parseInt(form.kapasitas) || 0,
      harga_per_hari: parseInt(form.harga_per_hari) || 0,
      status: "tersedia"
    }]);

    if (!error) {
      setShowModal(false);
      setForm({ nama_lokasi: "", alamat: "", kapasitas: "", harga_per_hari: "" });
      fetchLocations();
    } else {
      alert("Gagal menambahkan lokasi: " + error.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Lokasi Penitipan 🏠</h1>
            <p className="text-slate-500 text-sm">Kelola gedung dan kapasitas penyimpanan barang pelanggan.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <Plus size={18} /> Tambah Lokasi
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></div>
          ) : locations.length > 0 ? (
            locations.map((loc) => (
              <div key={loc.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex gap-6 items-start">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                  <Warehouse size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-lg">{loc.nama_lokasi}</h3>
                  <p className="text-sm text-slate-400 flex items-center gap-1 mb-4">
                    <MapPin size={14} /> {loc.alamat}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Ganti bagian tampilan kapasitas dengan progress bar ini */}
                    <div className="bg-slate-50 p-4 rounded-2xl w-full">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Okupansi Gudang</p>
                        <p className="text-[10px] font-bold text-slate-900">
                          {loc.kapasitas_maksimal - loc.kapasitas_tersisa} / {loc.kapasitas_maksimal} Slot Terpakai
                        </p>
                      </div>
                      
                      {/* Progress Bar Sederhana */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            (loc.kapasitas_tersisa / loc.kapasitas_maksimal) < 0.2 ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ 
                            width: `${((loc.kapasitas_maksimal - loc.kapasitas_tersisa) / loc.kapasitas_maksimal) * 100}%` 
                          }}
                        />
                        </div> 
                        <p className="text-[10px] text-slate-500 mt-2 italic">
                          *Tersisa {loc.kapasitas_tersisa} slot kosong
                        </p>
                      </div>
                    <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Harga / Hari</p>
                    <p className="text-sm font-bold text-emerald-600">
                        {/* Tambahkan pengecekan loc.harga_per_hari sebelum toLocaleString */}
                        Rp {loc.harga_per_hari ? Number(loc.harga_per_hari).toLocaleString('id-ID') : '0'}
                    </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white p-20 rounded-3xl border-2 border-dashed border-slate-200 text-center text-slate-400 italic">
              Belum ada lokasi penitipan terdaftar.
            </div>
          )}
        </div>

        {/* --- MODAL TAMBAH LOKASI --- */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-200">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Daftarkan Lokasi Baru</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddLocation} className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Nama Lokasi/Gudang</label>
                    <input required placeholder="Gudang Sentosa Jaya" className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setForm({...form, nama_lokasi: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Alamat Lengkap</label>
                    <textarea required placeholder="Jl. Raya No. 123, Jakarta" className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24" onChange={(e) => setForm({...form, alamat: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Total Kapasitas (Slot)</label>
                      <input required type="number" placeholder="100" className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setForm({...form, kapasitas: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Harga Sewa / Hari</label>
                      <input required type="number" placeholder="50000" className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" onChange={(e) => setForm({...form, harga_per_hari: e.target.value})} />
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold mt-4 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Daftarkan Lokasi</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}