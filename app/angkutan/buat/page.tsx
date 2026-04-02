"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { Truck, MapPin, Calendar, ArrowRight, Loader2, Info, ReceiptText, Store } from "lucide-react";

export default function BuatAngkutan() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mitras, setMitras] = useState<any[]>([]);
  const [allArmada, setAllArmada] = useState<any[]>([]);
  const [filteredArmada, setFilteredArmada] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    alamat_jemput: "",
    alamat_tujuan: "",
    jenis_barang: "",
    jadwal: "",
    zona_jarak: "0",
    mitra_id: "",
    armada_id: "", // Properti ini sekarang resmi terdaftar
  });

  // --- AMBIL DATA MITRA & ARMADA ---
  useEffect(() => {
    const fetchData = async () => {
      const { data: m } = await supabase.from("mitra").select("*");
      const { data: a } = await supabase.from("armada").select("*"); 
      setMitras(m || []);
      setAllArmada(a || []);
    };
    fetchData();
  }, []);

  // --- FILTER ARMADA BERDASARKAN MITRA ---
  useEffect(() => {
    if (formData.mitra_id) {
      const matched = allArmada.filter(a => a.mitra_id === formData.mitra_id);
      setFilteredArmada(matched);
      setFormData(prev => ({ ...prev, armada_id: "" })); // Reset pilihan kendaraan jika ganti mitra
    } else {
      setFilteredArmada([]);
    }
  }, [formData.mitra_id, allArmada]);

  // --- LOGIKA HITUNG HARGA (ARMADA + JARAK) ---
  const hitungBiaya = useMemo(() => {
    // 1. Ambil harga dasar armada
    const armadaTerpilih = allArmada.find(a => a.id === formData.armada_id);
    const hargaArmada = armadaTerpilih ? Number(armadaTerpilih.harga_sewa) : 0;

    // 2. Ambil biaya berdasarkan jarak
    const jarak = parseInt(formData.zona_jarak);
    let hargaJarak = 0;

    if (jarak === 5) hargaJarak = 50000;
    else if (jarak === 10) hargaJarak = 85000; 
    else if (jarak === 15) hargaJarak = 120000; 
    else if (jarak === 20) hargaJarak = 150000; 
    else if (jarak === 21) hargaJarak = 250000; 

    // 3. Total hanya valid jika armada sudah dipilih
    return formData.armada_id ? (hargaArmada + hargaJarak) : 0;
  }, [formData.zona_jarak, formData.armada_id, allArmada]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return alert("Silakan login terlebih dahulu");
    if (formData.zona_jarak === "0") return alert("Pilih estimasi jarak terlebih dahulu");
    if (!formData.mitra_id) return alert("Pilih mitra pengangkut terlebih dahulu");
    if (!formData.armada_id) return alert("Pilih armada kendaraan terlebih dahulu");

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
        mitra: formData.mitra_id,
        armada_id: formData.armada_id,
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Pesan Angkutan Barang 🚛</h1>
            <p className="text-slate-500 font-medium text-sm">Pilih unit armada terbaik untuk pengiriman barang Anda.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-6">
              
              {/* --- DROPDOWN GANDA: MITRA & ARMADA --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2 tracking-widest">
                    <Store size={14} className="text-blue-600" /> 1. Pilih Mitra
                  </label>
                  <select 
                    required
                    value={formData.mitra_id}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-bold bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => setFormData({...formData, mitra_id: e.target.value})}
                  >
                    <option value="">-- Pilih Partner --</option>
                    {mitras.map((m) => (
                      <option key={m.id} value={m.id}>{m.nama_mitra}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2 tracking-widest">
                    <Truck size={14} className="text-blue-600" /> 2. Pilih Armada
                  </label>
                  <select 
                    required
                    disabled={!formData.mitra_id}
                    value={formData.armada_id}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-bold bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                    onChange={(e) => setFormData({...formData, armada_id: e.target.value})}
                  >
                    <option value="">{formData.mitra_id ? "-- Pilih Kendaraan --" : "Pilih Mitra Dahulu"}</option>
                    {filteredArmada.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.jenis_kendaraan} - {a.plat_nomor} (Base: Rp {Number(a.harga_sewa).toLocaleString('id-ID')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* --- ALAMAT JEMPUT & TUJUAN --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 flex items-center gap-2 tracking-widest">
                    <MapPin size={14} className="text-red-500" /> Penjemputan
                  </label>
                  <textarea 
                    required
                    placeholder="Alamat lengkap..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 min-h-[100px]"
                    onChange={(e) => setFormData({...formData, alamat_jemput: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 flex items-center gap-2 tracking-widest">
                    <MapPin size={14} className="text-emerald-500" /> Tujuan
                  </label>
                  <textarea 
                    required
                    placeholder="Alamat lengkap..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 min-h-[100px]"
                    onChange={(e) => setFormData({...formData, alamat_tujuan: e.target.value})}
                  />
                </div>
              </div>

              {/* --- DESKRIPSI & JADWAL --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Deskripsi Barang</label>
                  <input 
                    type="text"
                    required
                    placeholder="Contoh: Kulkas, 5 Box"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    onChange={(e) => setFormData({...formData, jenis_barang: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 flex items-center gap-2 tracking-widest">
                    <Calendar size={14} /> Jadwal Jemput
                  </label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-bold bg-slate-50"
                    onChange={(e) => setFormData({...formData, jadwal: e.target.value})}
                  />
                </div>
              </div>

              {/* --- JARAK --- */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Estimasi Jarak Pengiriman (BBM)</label>
                <select 
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 font-black bg-blue-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={(e) => setFormData({...formData, zona_jarak: e.target.value})}
                >
                  <option value="0">-- Pilih Estimasi Jarak --</option>
                  <option value="5">Sangat Dekat (0 - 5 KM) - +Rp 50.000</option>
                  <option value="10">Dekat (5 - 10 KM) - +Rp 85.000</option>
                  <option value="15">Sedang (10 - 15 KM) - +Rp 120.000</option>
                  <option value="20">Jauh (15 - 20 KM) - +Rp 150.000</option>
                  <option value="21">Luar Kota ( 20+ KM) - +Rp 250.000</option>
                </select>
              </div>
            </div>

            {/* --- RINGKASAN BIAYA --- */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl flex justify-between items-center relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] text-blue-400 uppercase font-black tracking-[0.2em] mb-1">Total Biaya (Sewa Unit + BBM)</p>
                <h2 className="text-4xl font-black text-white tracking-tighter">Rp {hitungBiaya.toLocaleString('id-ID')}</h2>
              </div>
              <ReceiptText className="text-white/10 absolute right-[-10px] top-[-10px]" size={120} />
            </div>

            <button 
              type="submit" 
              disabled={loading || hitungBiaya === 0}
              className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-blue-700 disabled:bg-slate-200 transition-all shadow-xl active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Konfirmasi Pemesanan <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}