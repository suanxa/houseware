"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { 
  Loader2, CheckCircle, XCircle, Eye, 
  ArrowLeft, Receipt, ImageIcon, ExternalLink, X 
} from "lucide-react";
import Link from "next/link";

export default function VerifikasiPembayaranFinance() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  async function fetchPendingPayments() {
    setLoading(true);
    const { data } = await supabase
      .from("pembayaran")
      .select("*, users(name)")
      .eq("status", "menunggu_verifikasi")
      .order("tanggal_bayar", { ascending: false });
    
    setPayments(data || []);
    setLoading(false);
  }

  const handleKonfirmasiLunas = async (payment: any) => {
    const konfirm = confirm("Apakah Anda sudah cek mutasi bank dan yakin pembayaran ini sah?");
    if (!konfirm) return;

    setVerifying(payment.id);
    try {
      // 1. Update status di tabel PEMBAYARAN
      const { error: payError } = await supabase
        .from("pembayaran")
        .update({ status: "lunas" })
        .eq("id", payment.id);

      if (payError) throw payError;

      // 2. Update status di tabel Layanan terkait (Penitipan atau Angkutan)
      const tableLayanan = payment.jenis_layanan === 'penitipan' ? 'penitipan_barang' : 'angkutan_barang';
      const { error: serviceError } = await supabase
        .from(tableLayanan)
        .update({ status: "active" })
        .eq("id", payment.transaksi_id);

      if (serviceError) throw serviceError;

      alert("Pembayaran Berhasil Dikonfirmasi!");
      fetchPendingPayments();
    } catch (error: any) {
      alert("Gagal: " + error.message);
    } finally {
      setVerifying(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="mb-8">
          <Link href="/dashboard/finance" className="flex items-center text-emerald-600 font-bold text-sm mb-4 hover:gap-2 transition-all">
            <ArrowLeft size={16} className="mr-2" /> Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Antrean Verifikasi Bayar 🧾</h1>
          <p className="text-slate-500 text-sm">Cek keaslian bukti transfer sebelum mengaktifkan layanan pelanggan.</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-400 tracking-widest">
              <tr>
                <th className="p-4">Pelanggan</th>
                <th className="p-4">Layanan</th>
                <th className="p-4">Total</th>
                <th className="p-4">Bukti</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-emerald-600" /></td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-slate-400 italic">Tidak ada pembayaran yang perlu diverifikasi saat ini.</td></tr>
              ) : payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{p.users?.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {p.id.slice(0,8)}</p>
                  </td>
                  <td className="p-4">
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded font-bold uppercase text-slate-600">{p.jenis_layanan}</span>
                  </td>
                  <td className="p-4 font-bold text-emerald-600 text-sm">
                    Rp {Number(p.total_bayar).toLocaleString('id-ID')}
                  </td>
                  <td className="p-4 text-center">
                    {p.bukti_transfer ? (
                      <button 
                        onClick={() => setSelectedImage(p.bukti_transfer)}
                        className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline"
                      >
                        <ImageIcon size={14} /> LIHAT BUKTI
                      </button>
                    ) : (
                      <span className="text-red-400 text-[10px]">Tanpa File</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        disabled={verifying === p.id}
                        onClick={() => handleKonfirmasiLunas(p)}
                        className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      >
                        {verifying === p.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                      </button>
                      <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm">
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- MODAL PREVIEW GAMBAR --- */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
            <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-slate-800 italic">Pratinjau Bukti Transfer</h3>
                <button onClick={() => setSelectedImage(null)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <div className="p-4 flex justify-center bg-slate-100">
                <img 
                  src={selectedImage} 
                  alt="Bukti Transfer" 
                  className="max-h-[70vh] object-contain rounded-xl shadow-lg"
                />
              </div>
              <div className="p-4 text-center">
                <a 
                  href={selectedImage} 
                  target="_blank" 
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:underline"
                >
                  <ExternalLink size={14} /> Buka di Tab Baru
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}