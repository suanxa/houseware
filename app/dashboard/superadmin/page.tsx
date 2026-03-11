"use client";

import { useSession } from "next-auth/react";
import Sidebar from "@/components/sidebar";
import { 
  ShieldCheck, 
  Activity, 
  UserCog, 
  Database, 
  PieChart, 
  AlertTriangle,
  ArrowRight
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
            <h1 className="text-2xl font-bold text-slate-900">System Control Center 🛡️</h1>
            <p className="text-slate-500">Akses penuh ke seluruh data dan konfigurasi House Ware.</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{session?.user?.name}</p>
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-red-200">
                  {session?.user?.role}
                </span>
             </div>
             <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-red-200">
                {session?.user?.name?.charAt(0) || "S"}
             </div>
          </div>
        </header>

        {/* 1. System Health & Critical Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Activity size={20} /></div>
              <span className="flex h-2 w-2 rounded-full bg-green-500 ring-4 ring-green-50"></span>
            </div>
            <p className="text-sm text-slate-500">Status Sistem</p>
            <h3 className="text-2xl font-bold text-slate-900">Normal</h3>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-slate-50 text-slate-600 rounded-lg"><UserCog size={20} /></div>
            </div>
            <p className="text-sm text-slate-500">Total Admin/Finance</p>
            <h3 className="text-2xl font-bold text-slate-900">0</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-slate-50 text-slate-600 rounded-lg"><Database size={20} /></div>
            </div>
            <p className="text-sm text-slate-500">Database Uptime</p>
            <h3 className="text-2xl font-bold text-slate-900">99.9%</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-slate-50 text-slate-600 rounded-lg"><PieChart size={20} /></div>
            </div>
            <p className="text-sm text-slate-500">Total Transaksi</p>
            <h3 className="text-2xl font-bold text-slate-900">0</h3>
          </div>
        </div>

        {/* 2. Critical Actions for Superadmin */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-red-500 transition-all group">
            <ShieldCheck size={40} className="text-red-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Manajemen Role & Staff</h3>
            <p className="text-slate-500 text-sm mb-6">Tambah, edit, atau hapus akses untuk Admin, Finance, dan Mitra di dalam sistem.</p>
            <Link href="/superadmin/users" className="flex items-center space-x-2 text-red-600 font-bold">
              <span>Kelola Pengguna</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl text-white">
            <AlertTriangle size={40} className="text-amber-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Audit Log & System Activity</h3>
            <p className="text-slate-400 text-sm mb-6">Pantau setiap perubahan data dan aktivitas mencurigakan oleh pengguna internal.</p>
            <Link href="/superadmin/logs" className="flex items-center space-x-2 text-amber-400 font-bold">
              <span>Lihat Log Aktivitas</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* 3. Recent Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Pendaftaran Staff Terbaru</h3>
          </div>
          <div className="p-12 text-center text-slate-400">
            <UserCog size={48} className="mx-auto mb-4 opacity-10" />
            <p>Belum ada staf baru yang terdaftar.</p>
          </div>
        </div>
      </main>
    </div>
  );
}