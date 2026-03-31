"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/sidebar"; // Pastikan Sidebar di-import
import { 
  Save, Building2, Phone, MapPin, 
  Loader2, BadgeCheck, AlertTriangle, 
  Mail, UserCircle 
} from "lucide-react";

export default function ProfilMitra() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isNewProfile, setIsNewProfile] = useState(true);

  const [form, setForm] = useState({
    nama_mitra: "",
    alamat: "",
    telepon: ""
  });

  useEffect(() => {
    if (session?.user?.id) fetchProfile();
  }, [session]);

  async function fetchProfile() {
    try {
      setFetching(true);
      const { data, error } = await supabase
        .from("mitra")
        .select("*")
        .eq("user_id", session?.user?.id)
        .single();
      
      if (data) {
        setForm(data);
        setIsNewProfile(false);
      }
    } catch (error) {
      console.log("Profil baru sedang disiapkan.");
    } finally {
      setFetching(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("mitra")
      .upsert({
        user_id: session?.user?.id,
        nama_mitra: form.nama_mitra,
        alamat: form.alamat,
        telepon: form.telepon
      }, { onConflict: 'user_id' });

    if (!error) {
      alert("✅ Profil Bisnis Berhasil Disimpan!");
      setIsNewProfile(false);
      fetchProfile();
    } else {
      alert("❌ Gagal menyimpan: " + error.message);
    }
    setLoading(false);
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-400" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex font-sans text-slate-100">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto z-10">
        <div className="max-w-5xl mx-auto">
          
          {/* Header Section */}
          <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tighter italic uppercase text-white">Pengaturan Profil ⚙️</h1>
              <p className="text-slate-400 font-medium mt-1">Kelola identitas bisnis dan kontak operasional Mitra HouseWare.</p>
            </div>
            
            {/* Status Verifikasi */}
            <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${
              isNewProfile 
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            }`}>
              {isNewProfile ? <AlertTriangle size={20}/> : <BadgeCheck size={20}/>}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Status Profil</p>
                <p className="text-sm font-bold">{isNewProfile ? "Belum Lengkap" : "Terverifikasi"}</p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* KARTU INFO AKUN (Read Only) */}
            <div className="space-y-6">
              <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700/50 shadow-xl relative overflow-hidden group">
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-inner mb-4">
                    {session?.user?.name?.charAt(0) || "M"}
                  </div>
                  <h3 className="font-bold text-white text-lg">{session?.user?.name}</h3>
                  <p className="text-[10px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-black uppercase mt-1 mb-6 tracking-widest">
                    {session?.user?.role}
                  </p>
                  
                  <div className="w-full space-y-2 border-t border-slate-700 pt-5">
                    <InfoItem icon={<Mail size={14}/>} label="Email Login" value={session?.user?.email || "-"} />
                    <InfoItem icon={<UserCircle size={14}/>} label="User ID" value={session?.user?.id?.slice(0,10) + "..."} />
                  </div>
                </div>
                <UserCircle size={150} className="absolute -left-10 -bottom-10 text-slate-700/30 group-hover:scale-110 transition-transform duration-700" />
              </div>

              {isNewProfile && (
                <div className="bg-rose-950 p-6 rounded-3xl border border-rose-800 flex items-start gap-4">
                  <AlertTriangle className="text-rose-400 mt-1 shrink-0" size={20} />
                  <div>
                    <h5 className="font-bold text-rose-200 text-sm mb-1">Aksi Diperlukan!</h5>
                    <p className="text-xs text-rose-300 leading-relaxed">Silakan lengkapi nama usaha, alamat kantor, dan nomor telepon bisnis Anda agar dapat mulai mendaftarkan Gudang atau Armada.</p>
                  </div>
                </div>
              )}
            </div>

            {/* FORM PENGATURAN PROFIL MITRA */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSave} className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl space-y-6 text-slate-900 border border-slate-100 relative">
                
                <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-950">Identitas Bisnis Mitra</h2>
                    <p className="text-sm text-slate-500 font-medium">Data ini akan digunakan untuk kontrak dan tampilan di aplikasi pelanggan.</p>
                  </div>
                </div>

                {/* Input Nama Mitra */}
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">Nama Usaha / Brand Mitra</label>
                  <div className="relative mt-1.5">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800"
                      value={form.nama_mitra}
                      onChange={(e) => setForm({...form, nama_mitra: e.target.value})}
                      placeholder="Contoh: PT. Logistik Maju Jaya / Toko Budi Gudang"
                    />
                  </div>
                </div>

                {/* Input Telepon */}
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">Nomor Telepon Operasional</label>
                  <div className="relative mt-1.5">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      required type="tel"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800"
                      value={form.telepon}
                      onChange={(e) => setForm({...form, telepon: e.target.value})}
                      placeholder="Contoh: 081234567890 (WhatsApp Aktif)"
                    />
                  </div>
                </div>

                {/* Input Alamat */}
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">Alamat Kantor Pusat / Operasional</label>
                  <div className="relative mt-1.5">
                    <MapPin className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <textarea 
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800 min-h-[120px] leading-relaxed"
                      value={form.alamat}
                      onChange={(e) => setForm({...form, alamat: e.target.value})}
                      placeholder="Alamat lengkap beserta kota dan kode pos..."
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2.5 hover:gap-3 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {isNewProfile ? "Daftarkan Profil Bisnis" : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Decorative Footer */}
          <footer className="mt-16 text-center text-slate-700 text-[10px] font-medium tracking-widest uppercase pb-4">
            HouseWare Mitra Platform © 2026
          </footer>
        </div>
      </main>
    </div>
  );
}

// Komponen Kecil untuk Tampilan Info Akun
function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3 bg-slate-700/40 p-3 rounded-xl border border-slate-700">
      <div className="text-amber-400 shrink-0">{icon}</div>
      <div className="text-left overflow-hidden">
        <p className="text-[9px] font-bold uppercase text-slate-400 leading-none mb-0.5">{label}</p>
        <p className="text-xs font-semibold text-white truncate">{value}</p>
      </div>
    </div>
  );
}