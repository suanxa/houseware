"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Sidebar from "@/components/sidebar"; // Pastikan path import benar

export default function PelangganDashboard() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 1. Gunakan Component Sidebar yang baru */}
      <Sidebar />

      {/* 2. Main Content tetap di sini */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Halo, {session?.user?.name || "Pelanggan"}! 👋</h1>
            <p className="text-slate-500">Pantau status barang dan pengiriman Anda di sini.</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{session?.user?.email}</p>
                <p className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase inline-block">
                  {session?.user?.role}
                </p>
             </div>
             <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {session?.user?.name?.charAt(0) || "U"}
             </div>
          </div>
        </header>

        {/* --- Statistik Cepat --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500 mb-1">Total Penitipan</p>
            <h3 className="text-2xl font-bold text-slate-900">0 Pesanan</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500 mb-1">Total Pengiriman</p>
            <h3 className="text-2xl font-bold text-slate-900">0 Pesanan</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-sm text-slate-500 mb-1">Tagihan Aktif</p>
            <h3 className="text-2xl font-bold text-red-600">Rp 0</h3>
          </div>
        </div>

        {/* --- Shortcut Layanan --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-600 p-8 rounded-2xl text-white relative overflow-hidden group shadow-lg shadow-blue-200">
            <h3 className="text-xl font-bold mb-2">Butuh Tempat Menyimpan?</h3>
            <p className="text-blue-100 mb-4 text-sm">Cari lokasi penitipan terdekat yang aman untuk barang Anda.</p>
            <Link href="/penitipan/buat" className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition-all">
              Pesan Penitipan
            </Link>
          </div>
          <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-lg shadow-slate-200">
            <h3 className="text-xl font-bold mb-2">Mau Pindahan Rumah?</h3>
            <p className="text-slate-400 mb-4 text-sm">Pesan armada angkutan barang besar dengan jadwal fleksibel.</p>
            <Link href="/angkutan/buat" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all">
              Pesan Angkutan
            </Link>
          </div>
        </div>

        {/* --- Tabel Riwayat Pesanan --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Pesanan Terbaru</h3>
            <Link href="/riwayat" className="text-sm text-blue-600 font-medium hover:underline">Lihat Semua</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Layanan</th>
                  <th className="p-4 font-semibold">Jenis Barang</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Tgl Transaksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400">
                    <p className="mb-2">Belum ada riwayat transaksi.</p>
                    <Link href="/penitipan/buat" className="text-blue-600 font-bold hover:underline">
                      Mulai pesan layanan pertama Anda
                    </Link>
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