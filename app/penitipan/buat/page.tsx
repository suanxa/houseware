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
      const { data: jenis } = await supabase.from("jenis_barang").select("id, nama_jenis, harga_per_hari, ongkir_dasar");
      
      if (lokasi) setListLokasi(lokasi);
      if (jenis) setListJenis(jenis);
    };
    fetchDataMaster();
  }, []);

  // --- LOGIKA HITUNG HARGA ---
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
        // Gunakan Number(item.jumlah || 0) agar saat input kosong (NaN) perhitungan tidak rusak
        totalSewaSemuaBarang += (Number(kategori.harga_per_hari) * Number(item.jumlah || 0) * durasiHari);
        
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

  // --- PERBAIKAN LOGIKA UPDATE ITEM (JUMLAH) ---
  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    
    if (field === "jumlah") {
      // Jika input dihapus bersih oleh user
      if (value === "") {
        newItems[index] = { ...newItems[index], jumlah: "" as any };
      } else {
        const parsedValue = parseInt(value.toString());
        // Set ke 0 jika NaN, atau ambil nilai positifnya
        newItems[index] = { 
          ...newItems[index], 
          jumlah: isNaN(parsedValue) ? 0 : Math.max(0, parsedValue) 
        };
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return alert("Silakan login dahulu");
    if (!globalData.lokasi_id) return alert("Pilih lokasi gudang");
    
    // Validasi Jumlah Barang
    const hasInvalidQty = items.some(i => !i.jumlah || Number(i.jumlah) < 1);
    if (hasInvalidQty) return alert("Jumlah barang minimal 1 unit untuk setiap item");

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
      <main className="flex-1 p-8 overflow-y-auto font-sans">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Pesan Penitipan Barang 📦</h1>
            <p className="text-slate-600 font-medium italic">Lengkapi rincian untuk mendapatkan estimasi harga.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* LOKASI & WAKTU */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 tracking-tight"><Calendar size={18} className="text-blue-600"/> Informasi Waktu & Tempat</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Gudang Tujuan</label>
                  <select required className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => setGlobalData({...globalData, lokasi_id: e.target.value})}>
                    <option value="">-- Pilih Lokasi --</option>
                    {listLokasi.map((loc) => <option key={loc.id} value={loc.id}>{loc.nama_lokasi}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tgl Mulai</label>
                  <input type="date" required className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => setGlobalData({...globalData, tanggal_mulai: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tgl Selesai</label>
                  <input type="date" required className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => setGlobalData({...globalData, tanggal_selesai: e.target.value})}/>
                </div>
              </div>
            </div>

            {/* DAFTAR BARANG */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 tracking-tight"><Package size={18} className="text-blue-600"/> Daftar Barang</h3>
                <button type="button" onClick={addRow} className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">
                  <Plus size={16}/> Tambah Baris
                </button>
              </div>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 relative group transition-all">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Kategori</label>
                        <select required value={item.jenis_barang_id} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          onChange={(e) => updateItem(index, "jenis_barang_id", e.target.value)}>
                          <option value="">-- Pilih --</option>
                          {listJenis.map((j) => <option key={j.id} value={j.id}>{j.nama_jenis}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-6">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Deskripsi Barang</label>
                        <input required type="text" placeholder="Contoh: Kursi Lipat, Dus Dokumen" value={item.deskripsi_barang}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                          onChange={(e) => updateItem(index, "deskripsi_barang", e.target.value)} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 text-center">Jumlah</label>
                        <input 
                          required                         
                          type="text"                           
                          inputMode="numeric"
                          value={item.jumlah}
                          onFocus={(e) => e.target.select()}                          
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-black text-center focus:ring-2 focus:ring-blue-600 outline-none bg-white"                          
                          onChange={(e) => {
                            const val = e.target.value;
                            const cleanValue = val.replace(/[^0-9]/g, "");
                            updateItem(index, "jumlah", cleanValue);
                          }} 
                          placeholder="0"
                        />
                      </div>
                      <div className="md:col-span-1 flex justify-end">
                        {items.length > 1 && (
                          <button type="button" onClick={() => removeRow(index)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
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
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Truck size={24} /></div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm tracking-tight">Butuh Jasa Penjemputan?</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Layanan Kurir Door-to-Door</p>
                  </div>
                </div>
                <input type="checkbox" className="w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500" onChange={(e) => setButuhJemput(e.target.checked)} />
              </div>
              {butuhJemput && (
                <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Detail Alamat Penjemputan</label>
                  <textarea required placeholder="Jl. Nama Jalan, No. Rumah, RT/RW, Kelurahan..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                    rows={3} onChange={(e) => setAlamatJemput(e.target.value)} />
                </div>
              )}
            </div>

            {/* RINGKASAN ESTIMASI */}
            <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-3 text-slate-400">
                      <ReceiptText size={20} />
                      <span className="text-xs font-bold uppercase tracking-widest">Biaya Sewa ({kalkulasiBiaya.durasi} Hari)</span>
                    </div>
                    <span className="font-black text-lg">{kalkulasiBiaya.sewa.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}</span>
                  </div>
                  
                  {butuhJemput && (
                    <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-6 text-blue-400">
                      <span className="text-xs font-bold uppercase tracking-widest">Biaya Logistik Penjemputan</span>
                      <span className="font-black text-lg">+ {kalkulasiBiaya.ongkir.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}</span>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Total Estimasi Dibayar</p>
                      <h2 className="text-4xl font-black text-blue-500 tracking-tighter italic">
                        {kalkulasiBiaya.total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                      </h2>
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center gap-3 backdrop-blur-sm">
                       <Info size={16} className="text-blue-400" />
                       <p className="text-[9px] text-slate-400 font-bold uppercase leading-tight">
                         Status Tagihan: <span className="text-white">Menunggu Verifikasi Barang</span>
                       </p>
                    </div>
                  </div>
               </div>
               {/* Efek dekoratif background */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-blue-600/20 transition-all duration-700"></div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-500 disabled:bg-slate-700 transition-all shadow-xl shadow-blue-900/20">
              {loading ? <Loader2 className="animate-spin" /> : <>Buat Pesanan Sekarang <ArrowRight size={20} /></>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}