"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { 
  Package, Plus, Search, Edit3, 
  Trash2, Loader2, X, Save, 
  AlertCircle, Banknote, Truck 
} from "lucide-react";

// Update Interface sesuai kolom baru
interface JenisBarang {
  id: string;
  nama_jenis: string;
  harga_per_hari: number;
  ongkir_dasar: number;
  created_at: string;
}

export default function CRUDJenisBarang() {
  const [data, setData] = useState<JenisBarang[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // State Form disesuaikan (Hapus deskripsi/catatan, tambah harga & ongkir)
  const [formData, setFormData] = useState({ 
    nama_jenis: "", 
    harga_per_hari: 0, 
    ongkir_dasar: 0 
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJenisBarang();
  }, []);

  async function fetchJenisBarang() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("jenis_barang")
        .select("*")
        .order("nama_jenis", { ascending: true });

      if (error) throw error;
      setData(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (item?: JenisBarang) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ 
        nama_jenis: item.nama_jenis, 
        harga_per_hari: item.harga_per_hari, 
        ongkir_dasar: item.ongkir_dasar 
      });
    } else {
      setEditingId(null);
      setFormData({ nama_jenis: "", harga_per_hari: 0, ongkir_dasar: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        const { error } = await supabase
          .from("jenis_barang")
          .update(formData)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("jenis_barang")
          .insert([formData]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchJenisBarang();
    } catch (error) {
      alert("Gagal menyimpan data. Pastikan format angka benar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus jenis barang ini?")) return;
    try {
      const { error } = await supabase.from("jenis_barang").delete().eq("id", id);
      if (error) throw error;
      fetchJenisBarang();
    } catch (error) {
      alert("Gagal menghapus data.");
    }
  };

  const filteredData = data.filter(item => 
    item.nama_jenis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-black flex items-center gap-3">
                <Package className="text-blue-600" /> Manajemen Jenis
              </h1>
              <p className="text-slate-500 text-sm font-medium">Kelola tarif sewa dan biaya pengiriman dasar.</p>
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari jenis..."
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 transition-all"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => handleOpenModal()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-100"
              >
                <Plus size={18} /> Tambah
              </button>
            </div>
          </header>

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-blue-600 mb-2" />
                <p className="text-slate-400 text-sm font-medium">Sinkronisasi data...</p>
              </div>
            ) : filteredData.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Jenis</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Harga / Hari</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ongkir Dasar</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-800">{item.nama_jenis}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-semibold text-center">
                        Rp {item.harga_per_hari.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-semibold text-center">
                        Rp {item.ongkir_dasar.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
  {/* Menghapus opacity-0 dan group-hover agar selalu terlihat */}
  <div className="flex justify-end gap-1 transition-opacity">
    <button 
      onClick={() => handleOpenModal(item)} 
      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      title="Edit Data"
    >
      <Edit3 size={18} />
    </button>
    <button 
      onClick={() => handleDelete(item.id)} 
      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
      title="Hapus Data"
    >
      <Trash2 size={18} />
    </button>
  </div>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-20 text-center">
                <AlertCircle className="mx-auto text-slate-200 mb-2" size={40} />
                <p className="text-slate-400 font-medium">Data tidak ditemukan.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase tracking-tight">
                  {editingId ? "Edit Jenis" : "Tambah Jenis"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Jenis</label>
                  <input 
                    type="text"
                    required
                    value={formData.nama_jenis}
                    onChange={(e) => setFormData({...formData, nama_jenis: e.target.value})}
                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    placeholder="E.g. Elektronik Besar"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harga / Hari</label>
                    <div className="relative mt-1">
                      <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                     <input 
                      type="number"
                        required
                        placeholder="0"
                        // --- PERBAIKAN DI SINI ---
                        // Jika harga_per_hari adalah 0, tampilkan string kosong agar placeholder muncul
                        value={formData.harga_per_hari === 0 ? "" : formData.harga_per_hari}
                        onChange={(e) => {
                          // Jika input dikosongkan, kembalikan ke nilai 0 agar tidak error di database
                          const val = e.target.value === "" ? 0 : Number(e.target.value);
                          setFormData({ ...formData, harga_per_hari: val });
                        }}
                        // -------------------------
                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ongkir Dasar</label>
                    <div className="relative mt-1">
                      <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input 
                        type="number"
                        required
                        placeholder="0"
                        // Jika ongkir_dasar adalah 0, tampilkan string kosong agar tidak ada angka '0' yang mengganggu
                        value={formData.ongkir_dasar === 0 ? "" : formData.ongkir_dasar}
                        onChange={(e) => {
                          // Jika input dihapus semua (kosong), kembalikan ke nilai 0 untuk database
                          const val = e.target.value === "" ? 0 : Number(e.target.value);
                          setFormData({ ...formData, ongkir_dasar: val });
                        }}
                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">
                    Batal
                  </button>
                  <button 
                    disabled={submitting}
                    type="submit"
                    className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {editingId ? "Simpan" : "Tambah"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}