"use client";

import { useSession } from "next-auth/react";
import Sidebar from "@/components/sidebar";
import { 
  ShieldCheck, 
  Users, 
  Store, 
  Receipt, 
  BarChart3, 
  Settings,
  UserPlus,
  Eye,
  Activity,
  MapPin
} from "lucide-react";
import Link from "next/link";

export default function SuperAdminDashboard() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar otomatis untuk Superadmin */}
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Super Admin Dashboard 🛡️</h1>
            <p className="text-slate-500">Pusat kendali tertinggi sistem House Ware.</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{session?.user?.name}</p>
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-red-200">
                  {session?.user?.role}
                </span>
             </div>
             <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {session?.user?.name?.charAt(0) || "S"}
             </div>
          </div>
        </header>

        {/* 1. Ringkasan Data Utama (Sesuai Catatan) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg w-fit mb-4"><Users size={20} /></div>
            <p className="text-sm text-slate-500 font-medium">Jumlah Pengguna</p>
            <h3 className="text-2xl font-bold text-slate-900">0</h3>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg w-fit mb-4"><Store size={20} /></div>
            <p className="text-sm text-slate-500 font-medium">Jumlah Mitra</p>
            <h3 className="text-2xl font-bold text-slate-900">0</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg w-fit mb-4"><Receipt size={20} /></div>
            <p className="text-sm text-slate-500 font-medium">Jumlah Transaksi</p>
            <h3 className="text-2xl font-bold text-slate-900">0</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg w-fit mb-4"><BarChart3 size={20} /></div>
            <p className="text-sm text-slate-500 font-medium">Laporan Sistem</p>
            <h3 className="text-lg font-bold text-red-600 italic">Ready to Generate</h3>
          </div>
        </div>

        {/* 2. Fitur Utama (Sesuai Catatan) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Manajemen Staff */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-red-600" />
              Manajemen Staff
            </h3>
            <div className="space-y-3">
              <Link href="/superadmin/users" className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200">
                <span className="text-sm font-medium">Kelola Admin & Finance</span>
                <UserPlus size={16} className="text-slate-400" />
              </Link>
              <Link href="/superadmin/mitra" className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200">
                <span className="text-sm font-medium">Kelola Data Mitra</span>
                <Store size={16} className="text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Monitoring & Transaksi */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-blue-600" />
              Monitoring Layanan
            </h3>
            <div className="space-y-3">
              <Link href="/superadmin/transaksi" className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200">
                <span className="text-sm font-medium">Semua Transaksi</span>
                <Eye size={16} className="text-slate-400" />
              </Link>
              <Link href="/superadmin/lokasi" className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200">
                <span className="text-sm font-medium">Kelola Lokasi Penitipan</span>
                <MapPin size={16} className="text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Pengaturan Sistem */}
          <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-lg">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Settings size={20} className="text-amber-400" />
              Pengaturan Sistem
            </h3>
            <p className="text-xs text-slate-400 mb-6">Konfigurasi biaya layanan, maintenance mode, dan pengaturan keamanan.</p>
            <Link href="/superadmin/settings" className="block w-full text-center bg-white text-slate-900 py-2 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all">
              Buka Pengaturan
            </Link>
          </div>
        </div>

        {/* 3. Monitoring Aktivitas Pengguna (Sesuai Catatan) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Aktivitas Pengguna Terkini</h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold uppercase tracking-tighter">Live Audit</span>
          </div>
          <div className="p-12 text-center text-slate-400 italic text-sm">
            <p>Belum ada aktivitas sistem yang tercatat hari ini.</p>
          </div>
        </div>
      </main>
    </div>
  );
}