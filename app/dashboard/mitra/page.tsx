"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { 
  PackageSearch, 
  Warehouse, 
  Truck, 
  AlertCircle 
} from "lucide-react";

export default function MitraDashboard() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar otomatis mendeteksi role mitra */}
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Mitra 🏢</h1>
            <p className="text-slate-500">Kelola operasional penitipan dan armada Anda.</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{session?.user?.name}</p>
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase">
                  {session?.user?.role}
                </span>
             </div>
             <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {session?.user?.name?.charAt(0) || "M"}
             </div>
          </div>
        </header>

        {/* 1. Quick Stats (Operasional) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><PackageSearch size={20} /></div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">BARU</span>
            </div>
            <p className="text-sm text-slate-500">Pesanan Masuk</p>
            <h3 className="text-2xl font-bold text-slate-900">0</h3>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Warehouse size={20} /></div>
            </div>
            <p className="text-sm text-slate-500">Lokasi Aktif</p>
            <h3 className="text-2xl font-bold text-slate-900">0</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Truck size={20} /></div>
            </div>
            <p className="text-sm text-slate-500">Total Armada</p>
            <h3 className="text-2xl font-bold text-slate-900">0</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertCircle size={20} /></div>
            </div>
            <p className="text-sm text-slate-500">Butuh Tindakan</p>
            <h3 className="text-2xl font-bold text-red-600">0</h3>
          </div>
        </div>

        {/* 2. Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-6">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Manajemen Lokasi</h3>
              <p className="text-sm text-slate-500 mb-4">Atur kapasitas dan data gudang penitipan barang.</p>
              <Link href="/mitra/lokasi" className="text-blue-600 text-sm font-bold hover:underline">Kelola Sekarang →</Link>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl text-slate-400">
              <Warehouse size={40} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-6">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Manajemen Armada</h3>
              <p className="text-sm text-slate-500 mb-4">Daftarkan kendaraan dan cek status pengiriman.</p>
              <Link href="/mitra/armada" className="text-blue-600 text-sm font-bold hover:underline">Kelola Sekarang →</Link>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl text-slate-400">
              <Truck size={40} />
            </div>
          </div>
        </div>

        {/* 3. Recent Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Pesanan Masuk Terbaru</h3>
            <span className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-medium">Real-time update</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Pelanggan</th>
                  <th className="p-4 font-semibold">Layanan</th>
                  <th className="p-4 font-semibold">Lokasi/Armada</th>
                  <th className="p-4 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400">
                    <p className="mb-2 italic">Belum ada pesanan masuk saat ini.</p>
                    <p className="text-xs">Pastikan status lokasi & armada Anda dalam keadaan "Tersedia".</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}