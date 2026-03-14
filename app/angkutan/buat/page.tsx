"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { Truck, MapPin, Calendar, ArrowRight, Loader2, Info, ReceiptText } from "lucide-react";

export default function BuatAngkutan() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    alamat_jemput: "",
    alamat_tujuan: "",
    jenis_barang: "",
    jadwal: "",
    zona_jarak: "0", // Default 0
  });

  // --- LOGIKA HITUNG HARGA BERDASARKAN JARAK ---
  const hitungBiaya = useMemo(() => {
    const jarak = parseInt(formData.zona_jarak);
    let harga = 0;

    if (jarak === 5) harga = 50000;      // 0-5 km
    else if (jarak === 10) harga = 85000; // 5-10 km
    else if (jarak === 15) harga = 120000; // 10-15 km
    else if (jarak === 20) harga = 150000; // 15-20 km
    else if (jarak === 21) harga = 250000; // > 20 km (Luar Kota)

    return harga;
  }, [formData.zona_jarak]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return alert("Silakan login terlebih dahulu");
    if (formData.zona_jarak === "0") return alert("Pilih estimasi jarak terlebih dahulu");

    setLoading(true);

    const { error } = await supabase.from("angkutan_barang").insert([
      {
        user_id: session.user.id,
        alamat_jemput: formData.alamat_jemput,
        alamat_tujuan: formData.alamat_tujuan,
        jenis_barang: formData.jenis_barang,
        jadwal: formData.jadwal,
        estimasi_jarak_km: parseInt(formData.zona_jarak),
        total_biaya: hitungBiaya,
        status: "pending",
      },
    ]);

    if (error) {
      alert("Gagal mengirim pesanan: " + error.message);
    } else {
      alert("Pesanan angkutan berhasil dibuat!");
      router.push("/dashboard/pelanggan");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Pesan Angkutan Barang 🚛</h1>
            <p className="text-slate-600 font-medium">Layanan angkut barang aman dan terpercaya.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="grid grid-cols-1 gap-6">
                
                {/* Alamat Jemput */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-red-500" /> Alamat Penjemputan
                  </label>
                  <textarea 
                    required
                    placeholder="Masukkan alamat lengkap penjemputan..."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => setFormData({...formData, alamat_jemput: e.target.value})}
                  />
                </div>

                {/* Alamat Tujuan */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-green-500" /> Alamat Tujuan
                  </label>
                  <textarea 
                    required
                    placeholder="Masukkan alamat lengkap tujuan..."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => setFormData({...formData, alamat_tujuan: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Jenis Barang */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Deskripsi Barang</label>
                    <input 
                      type="text"
                      required
                      placeholder="Contoh: Sofa, Kulkas, 10 Box"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setFormData({...formData, jenis_barang: e.target.value})}
                    />
                  </div>

                  {/* Jadwal */}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                      <Calendar size={16} /> Jadwal Jemput
                    </label>
                    <input 
                      type="date" 
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium"
                      onChange={(e) => setFormData({...formData, jadwal: e.target.value})}
                    />
                  </div>
                </div>

                {/* PILIHAN JARAK (ZONA) */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Estimasi Jarak Pengiriman</label>
                  <select 
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 font-bold bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => setFormData({...formData, zona_jarak: e.target.value})}
                  >
                    <option value="0">-- Pilih Estimasi Jarak --</option>
                    <option value="5">Sangat Dekat (0 - 5 KM) - Rp 50.000</option>
                    <option value="10">Dekat (5 - 10 KM) - Rp 85.000</option>
                    <option value="15">Sedang (10 - 15 KM) - Rp 120.000</option>
                    <option value="20">Jauh (15 - 20 KM) - Rp 150.000</option>
                    <option value="21">Luar Kota ( 20+ KM) - Rp 250.000</option>
                  </select>
                </div>
              </div>
            </div>

            {/* RINGKASAN BIAYA */}
            <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl flex justify-between items-center">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Total Biaya Angkutan</p>
                <h2 className="text-3xl font-bold text-blue-400">Rp {hitungBiaya.toLocaleString('id-ID')}</h2>
              </div>
              <div className="p-3 bg-white/10 rounded-xl">
                <ReceiptText className="text-blue-400" size={28} />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
              <Info className="text-blue-600 mt-0.5" size={18} />
              <p className="text-xs text-blue-700 leading-relaxed">
                Harga sudah termasuk jasa driver dan bahan bakar. Jika membutuhkan <strong>Tenaga Angkut Tambahan (Kuli)</strong>, silakan konfirmasi kepada admin setelah pesanan dibuat.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading || hitungBiaya === 0}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-slate-300 transition-all shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Konfirmasi Pemesanan Angkutan <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}