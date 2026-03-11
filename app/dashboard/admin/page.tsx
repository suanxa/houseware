"use client";

import { useSession } from "next-auth/react";
import Sidebar from "@/components/sidebar";
import { 
  Users, 
  ClipboardCheck, 
  MapPin, 
  Truck, 
  Search,
  CheckCircle,
  XCircle,
  MoreVertical
} from "lucide-react";

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar otomatis mendeteksi role Admin */}
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Operasional Admin 🛠️</h1>
            <p className="text-slate-500">Kelola pesanan, pelanggan, dan verifikasi layanan.</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{session?.user?.name}</p>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {session?.user?.role}
                </span>
             </div>
             <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {session?.user?.name?.charAt(0) || "A"}
             </div>
          </div>
        </header>

        {/* 1. Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Users size={20} /></div>
            </div>
            <p className="text-sm text-slate-500">Total Pelanggan</p>
            <h3 className="text-2xl font-bold text-slate-900">0</h3>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><ClipboardCheck size={20} /></div>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">PENDING</span>
            </div>
            <p className="text-sm text-slate-500">Perlu Verifikasi</p>
            <h3 className="text-2xl font-bold text-slate-900">0</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><MapPin size={20} /></div>
            </div>
            <p className="text-sm text-slate-500">Lokasi Penitipan</p>
            <h3 className="text-2xl font-bold text-slate-900">0</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-slate-50 text-slate-600 rounded-lg"><Truck size={20} /></div>
            </div>
            <p className="text-sm text-slate-500">Total Armada</p>
            <h3 className="text-2xl font-bold text-slate-900">0</h3>
          </div>
        </div>

        {/* 2. Management Table Area */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-bold text-slate-900">Antrean Pesanan Layanan</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Cari ID atau Nama..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-full md:w-64 outline-none"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Pelanggan</th>
                  <th className="p-4 font-semibold">Layanan</th>
                  <th className="p-4 font-semibold">Tgl Pesan</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {/* Data Kosong Placeholder */}
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="flex flex-col items-center text-slate-400">
                      <ClipboardCheck size={48} className="mb-3 opacity-20" />
                      <p className="font-medium">Tidak ada pesanan yang menunggu verifikasi.</p>
                      <p className="text-xs">Semua tugas operasional telah selesai!</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Operational Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="p-6 bg-white rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-indigo-500 transition-all cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Kelola Data Pelanggan</h4>
                <p className="text-xs text-slate-500">Lihat profil dan riwayat pelanggan aktif.</p>
              </div>
            </div>
            <MoreVertical size={20} className="text-slate-300" />
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-indigo-500 transition-all cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Kelola Lokasi Penitipan</h4>
                <p className="text-xs text-slate-500">Verifikasi gudang/tempat penitipan baru mitra.</p>
              </div>
            </div>
            <MoreVertical size={20} className="text-slate-300" />
          </div>
        </div>
      </main>
    </div>
  );
}