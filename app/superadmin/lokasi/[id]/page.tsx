"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { 
  ArrowLeft, 
  Building2, 
  Package, 
  User, 
  MapPin, 
  Loader2,
  Inbox,
  Calendar
} from "lucide-react";
import Link from "next/link";

export default function DetailGudangSuperAdmin() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [gudang, setGudang] = useState<any>(null);
  const [daftarBarang, setDaftarBarang] = useState<any[]>([]);

  useEffect(() => {
    if (id) fetchDetailGudang();
  }, [id]);

  async function fetchDetailGudang() {
    setLoading(true);
    try {
      // 1. Ambil Info Gudang & Mitra
      const { data: infoGudang, error: errGudang } = await supabase
        .from("lokasi_penitipan")
        .select(`
          *,
          mitra (
            nama_mitra,
            alamat,
            users ( name, email, phone )
          )
        `)
        .eq("id", id)
        .single();

      if (errGudang) throw errGudang;
      setGudang(infoGudang);

      // 2. Ambil Daftar Barang yang ada di gudang ini (Status aktif/proses)
      const { data: barang, error: errBarang } = await supabase
        .from("penitipan_barang")
        .select(`
          id,
          deskripsi_barang,
          jumlah,
          status,
          tanggal_mulai,
          tanggal_selesai,
          users ( name )
        `)
        .eq("lokasi_id", id)
        .neq("status", "completed") // Hanya tampilkan yang masih dititipkan
        .order("created_at", { ascending: false });

      if (errBarang) throw errBarang;
      setDaftarBarang(barang || []);

    } catch (error) {
      console.error("Error detail gudang:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Navigasi */}
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-6 transition-all group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Kembali</span>
          </button>

          {/* Header Kartu Gudang */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex gap-5">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Building2 size={32} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900">{gudang?.nama_lokasi}</h1>
                  <p className="text-slate-500 flex items-center gap-1 text-sm mt-1">
                    <MapPin size={14} /> {gudang?.alamat}
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[200px]">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Mitra Pengelola</p>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-blue-600" />
                  <span className="font-bold text-slate-800">{gudang?.mitra?.nama_toko}</span>
                </div>
                <p className="text-xs text-slate-500 ml-6">{gudang?.mitra?.users?.name}</p>
              </div>
            </div>
          </div>

          {/* Tabel Barang di Gudang */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center gap-3">
              <Package className="text-blue-600" size={20} />
              <h3 className="font-bold text-slate-900">Isi Gudang Saat Ini</h3>
              <span className="ml-auto text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black uppercase">
                {daftarBarang.length} Item Terdeteksi
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase">Pemilik</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase">Deskripsi Barang</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase">Jumlah</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase">Masa Sewa</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {daftarBarang.length > 0 ? (
                    daftarBarang.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <p className="text-sm font-bold text-slate-800">{item.users?.name}</p>
                        </td>
                        <td className="p-4 text-sm text-slate-600 font-medium">{item.deskripsi_barang}</td>
                        <td className="p-4">
                          <span className="text-sm font-black text-slate-900">{item.jumlah} Unit</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                            <Calendar size={12} />
                            {new Date(item.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(item.tanggal_selesai).toLocaleDateString('id-ID')}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                            item.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                            item.status === 'aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-20 text-center">
                        <Inbox size={40} className="mx-auto text-slate-200 mb-3" />
                        <p className="text-slate-400 text-sm font-medium">Gudang ini masih kosong.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}