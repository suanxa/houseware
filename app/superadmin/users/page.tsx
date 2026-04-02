"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { 
  UserPlus, Trash2, ShieldCheck, 
  Mail, User, Loader2, X, Plus, CheckCircle, Clock, Phone, Edit3 
} from "lucide-react";

export default function KelolaStaff() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    phone: "" 
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, role, is_verified, phone")
        .in("role", ["admin", "finance"])
        .order("created_at", { ascending: false });
      
      if (!error) setUsers(data || []);
    } finally {
      setLoading(false);
    }
  }

  // --- FUNGSI UNTUK MEMBUKA MODAL EDIT ---
  const openEditModal = (user: any) => {
    setIsEdit(true);
    setSelectedId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: "", // Kosongkan password saat edit (opsional)
      role: user.role,
      phone: user.phone || ""
    });
    setShowModal(true);
  };

  // --- FUNGSI SIMPAN (TAMBAH / EDIT) ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (isEdit && selectedId) {
      // LOGIKA UPDATE
      const updateData: any = {
        name: form.name,
        email: form.email,
        role: form.role,
        phone: form.phone,
      };
      
      // Hanya update password jika diisi
      if (form.password) updateData.password = form.password;

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", selectedId);

      if (!error) alert("Data Staff Berhasil Diperbarui!");
      else alert("Gagal Update: " + error.message);

    } else {
      // LOGIKA INSERT (TAMBAH BARU)
      const { error } = await supabase.from("users").insert([{
        ...form,
        is_verified: true,
        created_at: new Date().toISOString()
      }]);

      if (!error) alert("Akun Staff Berhasil Dibuat!");
      else alert("Gagal Tambah: " + error.message);
    }

    setShowModal(false);
    resetForm();
    fetchStaff();
    setLoading(false);
  }

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", role: "admin", phone: "" });
    setIsEdit(false);
    setSelectedId(null);
  };

  async function deleteUser(id: string) {
    if (confirm("Apakah Anda yakin ingin menghapus akses staff ini? Tindakan ini tidak dapat dibatalkan.")) {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (!error) fetchStaff();
      else alert("Gagal Hapus: " + error.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight italic uppercase">Manajemen Otoritas Staff 🛡️</h1>
            <p className="text-slate-500 text-sm">Kelola akses kru Admin & Finance secara berkala.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-red-700 transition-all shadow-xl shadow-red-100"
          >
            <Plus size={18} /> Tambah Staff
          </button>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="p-6">Identitas</th>
                <th className="p-6">Kontak</th>
                <th className="p-6">Role</th>
                <th className="p-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && users.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-red-600" /></td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono tracking-tighter">ID: {user.id.slice(0,8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-bold text-slate-700">{user.phone || "-"}</p>
                    <p className="text-[11px] text-slate-400 italic">{user.email}</p>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${user.role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteUser(user.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL (TAMBAH & EDIT) */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
              <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">
                  {isEdit ? "Perbarui Data Staff" : "Otorisasi Staff Baru"}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-full transition-shadow">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Nama Lengkap</label>
                  <input required value={form.name} className="w-full p-4 bg-slate-50 text-slate-900 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-red-600" onChange={(e) => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Nomor HP</label>
                  <input required value={form.phone} className="w-full p-4 bg-slate-50 text-slate-900 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-red-600" onChange={(e) => setForm({...form, phone: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Email Resmi</label>
                  <input required type="email" value={form.email} className="w-full p-4 text-slate-900 bg-slate-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-red-600" onChange={(e) => setForm({...form, email: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Role</label>
                    <select value={form.role} className="w-full p-4 bg-slate-50 rounded-2xl text-slate-900 text-sm outline-none" onChange={(e) => setForm({...form, role: e.target.value})}>
                      <option value="admin">ADMIN</option>
                      <option value="finance">FINANCE</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Password {isEdit && "(Opsional)"}</label>
                    <input required={!isEdit} type="password" value={form.password} className="w-full p-4 bg-slate-50 rounded-2xl text-slate-900 text-sm outline-none focus:ring-2 focus:ring-red-600" placeholder="••••••" onChange={(e) => setForm({...form, password: e.target.value})} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-red-600 transition-all shadow-xl active:scale-95">
                  {isEdit ? "Update Staff" : "Simpan Staff"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}