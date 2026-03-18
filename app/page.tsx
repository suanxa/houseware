import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { 
  ArrowRight, Package, Truck, ShieldCheck, Globe, 
  MapPin, Star, TrendingUp, ChevronRight, Play, 
  Warehouse, Building2, CheckCircle2, Phone, Mail,
  Facebook, Instagram, Twitter, Zap, Shield, Clock
} from "lucide-react";

export const revalidate = 0; 

export default async function Home() {
  // --- Data listJenis tetap diambil untuk SEO/Informasi layanan ---
  const { data: listJenis } = await supabase
    .from("jenis_barang")
    .select("nama_jenis")
    .limit(4);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* --- Navbar --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <Warehouse className="text-white w-6 h-6" />
            </div>
            <span className="font-black text-slate-900 tracking-tighter text-2xl uppercase">
              HOUSE<span className="text-blue-600">WARE</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Masuk</Link>
            <Link href="/auth/register" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
<main className="relative min-h-[calc(100vh-80px)] flex items-center pt-28 pb-20 px-6 overflow-hidden">
  {/* Dekorasi Background - Ukuran dikurangi agar tidak terlalu mendominasi */}
  <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-100/30 rounded-full blur-[100px] -z-10" />

  <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center w-full">
    
    {/* Sisi Kiri: Teks (Ukuran diturunkan dari 8xl ke 6xl) */}
    <div className="space-y-6">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm border border-slate-200">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sistem Logistik Terpercaya</span>
      </div>
      
      <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter">
        Solusi Logistik <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600">Terbaik.</span>
      </h1>
      
      <p className="text-base lg:text-lg text-slate-500 leading-relaxed max-w-md font-medium">
        Kelola penyimpanan barang aman dan sewa angkutan handal dalam satu platform digital yang efisien.
      </p>

      <div className="flex flex-wrap gap-4 pt-2">
        <Link href="/auth/register" className="group flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl text-sm">
          Mulai Sekarang <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>

    {/* Sisi Kanan: Card (Ukuran padding dan ikon diperkecil) */}
    <div className="relative transition-all duration-500 hover:scale-[1.01] max-w-lg ml-auto w-full">
      <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-[2.5rem] blur-2xl opacity-10" />
      <div className="relative bg-white border border-slate-200/60 p-6 lg:p-8 rounded-[2rem] shadow-2xl backdrop-blur-sm">
         <div className="mb-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Keunggulan Utama</h2>
            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-0.5">Mengapa Memilih Platform Kami?</p>
         </div>

         <div className="space-y-4">
            {/* Item 1: Kecepatan */}
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-all">
              <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Zap size={22} fill="currentColor" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wide">Proses Kilat</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-snug">Pemesanan unit dan armada kurang dari 2 menit.</p>
              </div>
            </div>

            {/* Item 2: Keamanan */}
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-all">
              <div className="w-11 h-11 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Shield size={22} fill="currentColor" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wide">Proteksi Berlapis</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-snug">Keamanan gudang 24/7 dan asuransi terpercaya.</p>
              </div>
            </div>

            {/* Item 3: Transparansi */}
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-purple-200 transition-all">
              <div className="w-11 h-11 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Clock size={22} fill="currentColor" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wide">Monitoring Real-Time</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-snug">Pantau status barang langsung dari gadget Anda.</p>
              </div>
            </div>
         </div>
      </div>
    </div>
  </div>
</main>

      {/* --- Section Layanan Terintegrasi --- */}
      <section id="layanan" className="py-24 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter">
              Layanan <span className="text-blue-600">Terintegrasi</span>
            </h2>
            <p className="text-slate-500 font-medium">
              Tiga pilar utama layanan kami untuk mendukung efisiensi bisnis Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-blue-500 hover:bg-white hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                <Warehouse size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">Penitipan Barang</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Gudang penyimpanan modern dengan sistem keamanan 24/7. Cocok untuk inventaris bisnis.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
                  <CheckCircle2 size={14} className="text-green-500" /> Titip Barang Aman
                </li>
              </ul>
            </div>

            <div className="group p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-indigo-500 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                <Truck size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">Sewa Angkutan</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Armada lengkap siap melayani pengiriman dalam dan luar kota dengan GPS Tracking.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
                  <CheckCircle2 size={14} className="text-green-500" /> Driver Profesional
                </li>
              </ul>
            </div>

            <div className="group p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-purple-500 hover:bg-white hover:shadow-2xl hover:shadow-purple-100 transition-all duration-500">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                <Building2 size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tight">Kemitraan Gudang</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Hasilkan pendapatan pasif dengan mendaftarkan gudang Anda sebagai mitra kami.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
                  <CheckCircle2 size={14} className="text-green-500" /> Sistem Bagi Hasil
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer Section (Updated MapPin info) --- */}
      <footer className="bg-[#222222] text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Warehouse className="text-white w-5 h-5" />
                </div>
                <span className="font-black text-xl tracking-tighter uppercase">
                  HOUSE<span className="text-blue-500">WARE</span>
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Sistem manajemen pergudangan dan transportasi modern.
              </p>
            </div>

            {/* Kolom Link tetap sama... */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-6 pb-2 border-b border-white/10">Perusahaan</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="#" className="hover:text-blue-400">Tentang Kami</Link></li>
                <li><Link href="#" className="hover:text-blue-400">Karier</Link></li>
                <li><Link href="#" className="hover:text-blue-400">Testimonial</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-6 pb-2 border-b border-white/10">Layanan</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="#" className="hover:text-blue-400">Penitipan Barang</Link></li>
                <li><Link href="#" className="hover:text-blue-400">Sewa Angkutan</Link></li>
                <li><Link href="#" className="hover:text-blue-400">Gudang Mitra</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-6 pb-2 border-b border-white/10">Informasi</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><Link href="#" className="hover:text-blue-400">Panduan Pengguna</Link></li>
                <li><Link href="#" className="hover:text-blue-400">Legal & Privasi</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-6 pb-2 border-b border-white/10">Support</h4>
              <ul className="space-y-4 mb-8 text-sm text-slate-400">
                <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-blue-500" /><span>+62 812 3456 7890</span></li>
                <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-blue-500" /><span>cs@houseware.id</span></li>
                <li className="flex items-start gap-3"><MapPin className="w-4 h-4 text-blue-500 mt-1" /><span>Yogyakarta</span></li>
              </ul>
              <div className="flex gap-3">
                <Link href="#" className="p-2 bg-slate-800 rounded hover:bg-blue-600 transition-all"><Facebook size={16}/></Link>
                <Link href="#" className="p-2 bg-slate-800 rounded hover:bg-blue-600 transition-all"><Instagram size={16}/></Link>
                <Link href="#" className="p-2 bg-slate-800 rounded hover:bg-blue-600 transition-all"><Twitter size={16}/></Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} House Ware System • Politeknik Negeri Padang.</p>
            <div className="flex gap-6 font-bold uppercase tracking-widest">
              <span>Solusi Logistik Modern</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}