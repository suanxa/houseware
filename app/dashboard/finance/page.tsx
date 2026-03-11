"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Sidebar from "@/components/sidebar";
import { 
  Wallet, 
  CheckCircle2, 
  Clock, 
  FileText, 
  TrendingUp,
  ArrowUpRight
} from "lucide-react";

export default function FinanceDashboard() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar otomatis menampilkan menu Finance */}
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header Section */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Keuangan 💰</h1>
            <p className="text-slate-500">Pantau transaksi dan verifikasi pembayaran House Ware.</p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{session?.user?.name}</p>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">
                  {session?.user?.role}
                </span>
             </div>
             <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {session?.user?.name?.charAt(0) || "F"}
             </div>
          </div>
        </header>

        {/* 1. Ringkasan Keuangan (Stats Card) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><TrendingUp size={20} /></div>
              <span className="text-[10px] font-bold text-emerald-600">+12% Bln ini</span>
            </div>
            <p className="text-sm text-slate-500">Total Pendapatan</p>
            <h3 className="text-2xl font-bold text-slate-900">Rp 0</h3>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock size={20} /></div>
            </div>
            <p className="text-sm text-slate-500">Menunggu Verifikasi</p>
            <h3 className="text-2xl font-bold text-slate-900">0</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CheckCircle2 size={20} /></div>
            </div>
            <p className="text-sm text-slate-500">Pembayaran Berhasil</p>
            <h3 className="text-2xl font-bold text-slate-900">0</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Wallet size={20} /></div>
            </div>
            <p className="text-sm text-slate-500">Saldo Mitra</p>
            <h3 className="text-2xl font-bold text-slate-900">Rp 0</h3>
          </div>
        </div>

        {/* 2. Actions & Reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-emerald-700 p-8 rounded-3xl text-white flex justify-between items-center shadow-lg shadow-emerald-200">
            <div>
              <h3 className="text-xl font-bold mb-2">Verifikasi Pembayaran</h3>
              <p className="text-emerald-100 text-sm mb-4">Cek bukti transfer masuk dari pelanggan secara manual.</p>
              <Link href="/finance/verifikasi" className="inline-flex items-center space-x-2 bg-white text-emerald-700 px-6 py-2 rounded-xl font-bold hover:bg-emerald-50 transition-all">
                <span>Buka Antrean</span>
                <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="hidden lg:block opacity-20">
              <CheckCircle2 size={100} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Laporan Bulanan</h3>
              <p className="text-slate-500 text-sm mb-4">Unduh laporan transaksi lengkap dalam format PDF/Excel.</p>
              <Link href="/finance/laporan" className="inline-flex items-center space-x-2 bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all">
                <span>Unduh Laporan</span>
                <FileText size={18} />
              </Link>
            </div>
            <div className="hidden lg:block text-slate-100">
              <FileText size={100} />
            </div>
          </div>
        </div>

        {/* 3. Recent Transaction Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Transaksi Terakhir</h3>
            <button className="text-sm text-emerald-600 font-semibold hover:underline">Refresh Data</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">ID Transaksi</th>
                  <th className="p-4 font-semibold">Pelanggan</th>
                  <th className="p-4 font-semibold">Jumlah</th>
                  <th className="p-4 font-semibold">Metode</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <Wallet size={40} className="mb-2 opacity-20" />
                      <p>Tidak ada transaksi yang perlu diproses hari ini.</p>
                    </div>
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