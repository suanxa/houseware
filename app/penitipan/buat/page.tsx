"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { 
  Package, 
  Calendar, 
  ArrowRight, 
  Loader2, 
  Plus, 
  Trash2, 
  Info, 
  ReceiptText, 
  Truck 
} from "lucide-react";

export default function BuatPenitipan() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State Master Data
  const [listLokasi, setListLokasi] = useState<any[]>([]);
  const [listJenis, setListJenis] = useState<any[]>([]);

  // State Form Utama
  const [globalData, setGlobalData] = useState({
    lokasi_id: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
  });

  // State Layanan Jemput
  const [butuhJemput, setButuhJemput] = useState(false);
  const [alamatJemput, setAlamatJemput] = useState("");

  // State Keranjang Barang
  const [items, setItems] = useState([
    { jenis_barang_id: "", deskripsi_barang: "", jumlah: 1 }
  ]);

  useEffect(() => {
    const fetchDataMaster = async () => {
      const { data: lokasi } = await supabase.from("lokasi_penitipan").select("id, nama_lokasi");
      // Ambil harga_per_hari dan ongkir_dasar
      const { data: jenis } = await supabase.from("jenis_barang").select("id, nama_jenis, harga_per_hari, ongkir_dasar");
      
      if (lokasi) setListLokasi(lokasi);
      if (jenis) setListJenis(jenis);
    };
    fetchDataMaster();
  }, []);

  // --- LOGIKA HITUNG HARGA (Highest Base Fare) ---
  const kalkulasiBiaya = useMemo(() => {
    if (!globalData.tanggal_mulai || !globalData.tanggal_selesai) {
      return { sewa: 0, ongkir: 0, total: 0, durasi: 0 };
    }

    const mulai = new Date(globalData.tanggal_mulai);
    const selesai = new Date(globalData.tanggal_selesai);
    const diffTime = Math.abs(selesai.getTime() - mulai.getTime());
    const durasiHari = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    let totalSewaSemuaBarang = 0;
    let ongkirDasarTertinggi = 0;

    items.forEach((item) => {
      const kategori = listJenis.find((j) => j.id === item.jenis_barang_id);
      if (kategori) {
        totalSewaSemuaBarang += (Number(kategori.harga_per_hari) * Number(item.jumlah) * durasiHari);
        
        // Cari ongkir termahal di antara barang yang dipilih
        if (Number(kategori.ongkir_dasar) > ongkirDasarTertinggi) {
          ongkirDasarTertinggi = Number(kategori.ongkir_dasar);
        }
      }
    });

    const ongkirFinal = butuhJemput ? ongkirDasarTertinggi : 0;

    return {
      sewa: totalSewaSemuaBarang,
      ongkir: ongkirFinal,
      total: totalSewaSemuaBarang + ongkirFinal,
      durasi: durasiHari
    };
  }, [items, globalData, listJenis, butuhJemput]);

  const addRow = () => {
    setItems([...items, { jenis_barang_id: "", deskripsi_barang: "", jumlah: 1 }]);
  };

  const removeRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    if (field === "jumlah") {
      const parsedValue = parseInt(value.toString());
      newItems[index] = { 
        ...newItems[index], 
        [field]: isNaN(parsedValue) ? 0 : parsedValue 
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return alert("Silakan login dahulu");
    if (!globalData.lokasi_id) return alert("Pilih lokasi gudang");
    if (butuhJemput && !alamatJemput) return alert("Isi alamat penjemputan");

    setLoading(true);

    const dataToInsert = items.map((item) => ({
      user_id: session.user.id,
      lokasi_id: globalData.lokasi_id,
      jenis_barang_id: item.jenis_barang_id,
      deskripsi_barang: item.deskripsi_barang,
      jumlah: Number(item.jumlah),
      tanggal_mulai: globalData.tanggal_mulai,
      tanggal_selesai: globalData.tanggal_selesai,
      status: "pending",
      butuh_jemput: butuhJemput,
      alamat_jemput: butuhJemput ? alamatJemput : null,
      // Ongkir dibagi rata per baris agar total di DB konsisten
      ongkir_final: butuhJemput ? kalkulasiBiaya.ongkir / items.length : 0,
    }));

    const { error } = await supabase.from("penitipan_barang").insert(dataToInsert);

    if (error) {
      alert("Gagal: " + error.message);
    } else {
      alert(`Pesanan berhasil dikirim!`);
      router.push("/dashboard/pelanggan");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Pesan Penitipan Barang 📦</h1>
            <p className="text-slate-600 font-medium">Lengkapi rincian untuk mendapatkan estimasi harga penjemputan & sewa.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* LOKASI & WAKTU */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Calendar size={18} className="text-blue-600"/> Informasi Waktu & Tempat</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Gudang</label>
                  <select required className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setGlobalData({...globalData, lokasi_id: e.target.value})}>
                    <option value="">-- Pilih Lokasi --</option>
                    {listLokasi.map((loc) => <option key={loc.id} value={loc.id}>{loc.nama_lokasi}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mulai</label>
                  <input type="date" required className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium"
                    onChange={(e) => setGlobalData({...globalData, tanggal_mulai: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Selesai</label>
                  <input type="date" required className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium"
                    onChange={(e) => setGlobalData({...globalData, tanggal_selesai: e.target.value})}/>
                </div>
              </div>
            </div>

            {/* DAFTAR BARANG */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Package size={18} className="text-blue-600"/> Daftar Barang</h3>
                <button type="button" onClick={addRow} className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700">
                  <Plus size={16}/> Tambah Item
                </button>
              </div>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 relative">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kategori</label>
                        <select required value={item.jenis_barang_id} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium"
                          onChange={(e) => updateItem(index, "jenis_barang_id", e.target.value)}>
                          <option value="">-- Pilih --</option>
                          {listJenis.map((j) => <option key={j.id} value={j.id}>{j.nama_jenis}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-6">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Deskripsi</label>
                        <input required type="text" placeholder="Contoh: Meja Kayu, TV" value={item.deskripsi_barang}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
                          onChange={(e) => updateItem(index, "deskripsi_barang", e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Jumlah</label>
                        <input required type="number" min="1" value={item.jumlah}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold text-center"
                          onChange={(e) => updateItem(index, "jumlah", e.target.value)} />
                      </div>
                      <div className="md:col-span-1 flex justify-end">
                        {items.length > 1 && (
                          <button type="button" onClick={() => removeRow(index)} className="p-2 text-red-500">
                            <Trash2 size={18}/>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* OPSI PENJEMPUTAN */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Truck size={24} /></div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Butuh Penjemputan?</h3>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Layanan Door-to-Door</p>
                  </div>
                </div>
                <input type="checkbox" className="w-6 h-6 rounded text-blue-600" onChange={(e) => setButuhJemput(e.target.checked)} />
              </div>
              {butuhJemput && (
                <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in duration-300">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Alamat Penjemputan</label>
                  <textarea required placeholder="Jl. Nama Jalan, No. Rumah, Kecamatan..."
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={3} onChange={(e) => setAlamatJemput(e.target.value)} />
                </div>
              )}
            </div>

            {/* RINGKASAN TAGIHAN */}
            <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                  <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <ReceiptText className="text-blue-400" size={20} />
                      <span className="text-sm font-medium text-slate-400">Total Sewa ({kalkulasiBiaya.durasi} Hari)</span>
                    </div>
                    <span className="font-bold">Rp {kalkulasiBiaya.sewa.toLocaleString('id-ID')}</span>
                  </div>
                  
                  {butuhJemput && (
                    <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4 text-orange-400">
                      <span className="text-sm font-medium">Biaya Jemput (Tarif Tertinggi)</span>
                      <span className="font-bold">+ Rp {kalkulasiBiaya.ongkir.toLocaleString('id-ID')}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Estimasi Tagihan</p>
                      <h2 className="text-3xl font-bold text-blue-400">Rp {kalkulasiBiaya.total.toLocaleString('id-ID')}</h2>
                    </div>
                    <div className="bg-white/5 p-2 rounded-lg border border-white/10 flex items-center gap-2">
                       <Info size={14} className="text-blue-400" />
                       <span className="text-[10px] text-slate-400 font-medium">Bayar setelah barang diverifikasi</span>
                    </div>
                  </div>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-slate-300 transition-all shadow-lg">
              {loading ? <Loader2 className="animate-spin" /> : <>Konfirmasi Penitipan <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}