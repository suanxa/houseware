"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { 
  Loader2, Receipt, Clock, CheckCircle2, AlertCircle, X, 
  CreditCard, QrCode, Upload, Image as ImageIcon, Truck, Package 
} from "lucide-react";

// --- Komponen Badge Status (Updated with new flow) ---
function BadgeStatus({ status }: { status: string }) {
  const config: any = {
    pending: { color: "bg-slate-100 text-slate-600", icon: <Clock size={12} />, label: "Menunggu Review" },
    waiting_payment: { color: "bg-yellow-100 text-yellow-700", icon: <AlertCircle size={12} />, label: "Siap Dibayar" },
    waiting_confirmation: { color: "bg-blue-100 text-blue-700", icon: <Clock size={12} />, label: "Verifikasi Bayar" },
    active: { color: "bg-green-100 text-green-700", icon: <CheckCircle2 size={12} />, label: "Aktif" },
    completed: { color: "bg-slate-200 text-slate-800", icon: <Receipt size={12} />, label: "Selesai" },
    rejected: { color: "bg-red-100 text-red-700", icon: <X size={12} />, label: "Ditolak" },
  };
  const item = config[status] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${item.color}`}>
      {item.icon} {item.label}
    </span>
  );
}

export default function RiwayatPesanan() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "bank" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (session?.user?.id) fetchAllOrders();
  }, [session]);

  async function fetchAllOrders() {
    setLoading(true);
    try {
      const { data: penitipan } = await supabase
        .from("penitipan_barang")
        .select(`*, jenis_barang:jenis_barang_id (nama_jenis, harga_per_hari)`)
        .eq("user_id", session?.user?.id);

      const { data: angkutan } = await supabase
        .from("angkutan_barang")
        .select(`*`)
        .eq("user_id", session?.user?.id);

      const combined = [
        ...(penitipan?.map(p => ({ ...p, tipe: 'Penitipan' })) || []),
        ...(angkutan?.map(a => ({ ...a, tipe: 'Angkutan' })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setAllOrders(combined);
    } finally {
      setLoading(false);
    }
  }

  const hitungDurasi = (mulai: string, selesai: string) => {
    const d1 = new Date(mulai);
    const d2 = new Date(selesai);
    return Math.ceil(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) || 1;
  };

  const getDetailBiaya = (order: any) => {
    if (order.tipe === 'Penitipan') {
      const durasi = hitungDurasi(order.tanggal_mulai, order.tanggal_selesai);
      const sewa = (order.jenis_barang?.harga_per_hari || 0) * (order.jumlah || 1) * durasi;
      const ongkir = Number(order.ongkir_final) || 0;
      return { total: sewa + ongkir, rincian: `Sewa ${durasi} Hari + Jemput` };
    } else {
      const total = Number(order.total_biaya) || 0;
      return { total, rincian: `Layanan Angkut (${order.estimasi_jarak_km} KM)` };
    }
  };

  const handleKonfirmasiBayar = async () => {
    if (!selectedOrder || !file) return alert("Lengkapi data!");
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${session?.user?.id}_${Date.now()}.${fileExt}`;
      const filePath = `bukti-transfer/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("pembayaran").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("pembayaran").getPublicUrl(filePath);

      const { total } = getDetailBiaya(selectedOrder);
      const { error: dbError } = await supabase.from("pembayaran").insert([{
        user_id: session?.user?.id,
        transaksi_id: selectedOrder.id,
        jenis_layanan: selectedOrder.tipe.toLowerCase(),
        total_bayar: total,
        status: "menunggu_verifikasi",
        tanggal_bayar: new Date().toISOString(),
        bukti_transfer: publicUrl
      }]);

      if (dbError) throw dbError;

      const table = selectedOrder.tipe === 'Penitipan' ? 'penitipan_barang' : 'angkutan_barang';
      await supabase.from(table).update({ status: "waiting_confirmation" }).eq("id", selectedOrder.id);

      alert("Bukti pembayaran dikirim!");
      setSelectedOrder(null);
      setFile(null);
      fetchAllOrders();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Riwayat Pesanan 📑</h1>
          <p className="text-slate-500 font-medium text-sm">Review pesanan dan proses pembayaran.</p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500 text-[10px] uppercase tracking-widest">
                <th className="p-4 font-bold">Layanan</th>
                <th className="p-4 font-bold">Detail Pesanan</th>
                <th className="p-4 font-bold">Total Biaya</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
              ) : allOrders.map((order) => {
                const { total, rincian } = getDetailBiaya(order);
                return (
                  <tr key={order.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {order.tipe === 'Penitipan' ? <Package size={14} className="text-blue-500"/> : <Truck size={14} className="text-orange-500"/>}
                        <span className="font-bold text-slate-700">{order.tipe}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-900">{order.tipe === 'Penitipan' ? order.jenis_barang?.nama_jenis : order.jenis_barang}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{rincian}</p>
                    </td>
                    <td className="p-4 font-bold text-slate-900">Rp {total.toLocaleString("id-ID")}</td>
                    <td className="p-4"><BadgeStatus status={order.status} /></td>
                    <td className="p-4 text-center">
                      {/* Logika Tombol Bayar Berdasarkan Alur Verifikasi Admin */}
                      {order.status === "waiting_payment" ? (
                        <button 
                          onClick={() => setSelectedOrder(order)} 
                          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                        >
                          Bayar Sekarang
                        </button>
                      ) : order.status === "pending" ? (
                        <div className="flex flex-col items-center">
                           <span className="text-[9px] text-slate-400 font-bold uppercase">Verifikasi</span>
                           <span className="text-[9px] text-slate-400 font-bold uppercase">Admin</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300 italic">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* MODAL PEMBAYARAN */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
               <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-900">Pembayaran {selectedOrder.tipe}</h3>
                  <button onClick={() => setSelectedOrder(null)}><X size={18} /></button>
               </div>
               <div className="p-6">
                  <div className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-100 text-center">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Total yang dibayarkan</p>
                    <h2 className="text-3xl font-black text-blue-700">Rp {getDetailBiaya(selectedOrder).total.toLocaleString('id-ID')}</h2>
                  </div>

                  <p className="text-xs font-bold text-slate-500 uppercase mb-3">Pilih Metode:</p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button onClick={() => setPaymentMethod('qris')} className={`p-3 border-2 rounded-xl flex flex-col items-center gap-1 ${paymentMethod === 'qris' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                      <QrCode size={20} className={paymentMethod === 'qris' ? 'text-blue-600' : 'text-slate-400'} />
                      <span className="text-[10px] font-bold">QRIS</span>
                    </button>
                    <button onClick={() => setPaymentMethod('bank')} className={`p-3 border-2 rounded-xl flex flex-col items-center gap-1 ${paymentMethod === 'bank' ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}>
                      <CreditCard size={20} className={paymentMethod === 'bank' ? 'text-blue-600' : 'text-slate-400'} />
                      <span className="text-[10px] font-bold">BANK</span>
                    </button>
                  </div>

                  {paymentMethod && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                      <div className="p-4 bg-slate-900 rounded-xl text-white mb-4 text-center">
                        {paymentMethod === 'bank' ? (
                          <>
                            <p className="text-[10px] text-slate-400 uppercase">Mandiri House Ware</p>
                            <p className="font-mono text-lg text-blue-400">1230009876541</p>
                          </>
                        ) : (
                          <p className="text-xs">Scan QRIS untuk menyelesaikan pembayaran</p>
                        )}
                      </div>
                      <div className="relative border-2 border-dashed rounded-xl p-6 text-center hover:border-blue-500 cursor-pointer">
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        <Upload className="mx-auto mb-1 text-slate-400" size={20} />
                        <p className="text-[10px] font-bold text-slate-500">{file ? file.name : "Upload Bukti Transfer"}</p>
                      </div>
                      <button 
                        disabled={!file || uploading} 
                        onClick={handleKonfirmasiBayar}
                        className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-bold disabled:bg-slate-300 shadow-lg shadow-blue-100"
                      >
                        {uploading ? "Memproses..." : "Konfirmasi Pembayaran"}
                      </button>
                    </div>
                  )}
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}