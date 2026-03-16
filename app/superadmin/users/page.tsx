"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { 
  UserPlus, Trash2, ShieldCheck, 
  Mail, User, Loader2, X, Plus, CheckCircle, Clock
} from "lucide-react";

export default function KelolaStaff() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // State untuk form tambah staff
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin" 
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    setLoading(true);
    try {
      // Mengambil user dengan role admin atau finance
      // Dihapus .order("created_at") karena kolom tidak ada di DB kamu
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, role, is_verified")
        .in("role", ["admin", "finance"]);
      
      if (error) {
        console.error("Fetch Error:", error.message);
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      console.error("System Error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Proses Insert ke tabel users
    const { error } = await supabase.from("users").insert([{
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      is_verified: true // Langsung aktif karena dibuat oleh Super Admin
    }]);

    if (!error) {
      alert("Akun Staff Berhasil Dibuat!");
      setShowModal(false);
      setForm({ name: "", email: "", password: "", role: "admin" });
      fetchStaff(); // Refresh tabel
    } else {
      alert("Gagal: " + error.message);
    }
    setLoading(false);
  }

  async function deleteUser(id: string) {
    if (confirm("Apakah Anda yakin ingin menghapus akses staff ini?")) {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (!error) fetchStaff();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manajemen Staff 🛡️</h1>
            <p className="text-slate-500 text-sm">Pusat kendali akun Admin & Finance.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-100"
          >
            <Plus size={18} /> Tambah Staff Baru
          </button>
        </header>

        {/* Tabel */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identitas Staff</th>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kontak / Email</th>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Otoritas Role</th>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <Loader2 className="animate-spin mx-auto text-red-600 mb-2" />
                      <p className="text-xs text-slate-400 font-medium">Menghubungkan ke Database...</p>
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm">
                            {user.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 capitalize">{user.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter">ID: {user.id.slice(0,8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-sm font-medium text-slate-600 italic">
                        {user.email}
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase border shadow-sm ${
                          user.role === 'admin' 
                            ? 'bg-blue-50 text-blue-600 border-blue-100' 
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-5 text-sm">
                        {user.is_verified ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px]">
                            <CheckCircle size={14} /> ACTIVE
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-500 font-bold text-[10px]">
                            <Clock size={14} /> PENDING
                          </div>
                        )}
                      </td>
                      <td className="p-5 text-center">
                        <button 
                          onClick={() => deleteUser(user.id)}
                          className="p-2.5 bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all border border-transparent hover:border-red-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <div className="bg-slate-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={32} className="text-slate-200" />
                      </div>
                      <p className="text-slate-400 italic text-sm">Tidak ada staff Admin atau Finance yang ditemukan.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Tambah Staff */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-slate-900">Registrasi Staff</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Internal Access Only</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleAddStaff} className="p-8 space-y-5">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Nama Lengkap</label>
                    <input required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-red-600 transition-all outline-none" placeholder="Masukkan nama staff..." onChange={(e) => setForm({...form, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Email Perusahaan</label>
                    <input required type="email" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-red-600 transition-all outline-none" placeholder="email@houseware.com" onChange={(e) => setForm({...form, email: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Password</label>
                      <input required type="password" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-red-600 transition-all outline-none" placeholder="••••••" onChange={(e) => setForm({...form, password: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Role</label>
                      <select className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-red-600 transition-all outline-none cursor-pointer" onChange={(e) => setForm({...form, role: e.target.value})}>
                        <option value="admin">ADMIN</option>
                        <option value="finance">FINANCE</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold mt-4 shadow-xl shadow-red-100 hover:bg-red-700 active:scale-95 transition-all">
                  Otorisasi Akun Staff
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}