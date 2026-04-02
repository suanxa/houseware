"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/sidebar";
import { Clock } from "lucide-react";
import { 
  Users, Search, Filter, MoreVertical, 
  CheckCircle2, XCircle, Mail, Phone, 
  Calendar, ArrowUpRight, Loader2, UserCheck, UserX
} from "lucide-react";

export default function ManajemenUserAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      // Admin hanya mengelola user dengan role 'pelanggan'
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "pelanggan")
        .order("created_at", { ascending: false });

      if (!error) setUsers(data || []);
    } finally {
      setLoading(false);
    }
  }

  // Fungsi Toggle Verifikasi (Aktivasi/Nonaktifkan User)
  async function toggleVerification(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from("users")
      .update({ is_verified: !currentStatus })
      .eq("id", id);
    
    if (!error) fetchUsers();
  }

  // Logika Filter & Search
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || 
                          (filterStatus === "active" && user.is_verified) || 
                          (filterStatus === "pending" && !user.is_verified);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Header Section */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="text-blue-600" /> Manajemen Pelanggan
            </h1>
            <p className="text-slate-500 text-sm font-medium">Pantau dan kelola seluruh basis data pelanggan House Ware.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Cari nama atau email..."
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 outline-none shadow-sm cursor-pointer"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="active">Verified (Active)</option>
              <option value="pending">Unverified</option>
            </select>
          </div>
        </header>

        {/* User Statistics Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="p-6">Informasi Pelanggan</th>
                <th className="p-6">Kontak</th>
                <th className="p-6">Tgl Bergabung</th>
                <th className="p-6">Status Akun</th>
                <th className="p-6 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black shadow-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">USER_ID: {user.id.slice(0,8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <Mail size={12} className="text-slate-400" /> {user.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <Phone size={12} className="text-slate-400" /> {user.phone || "-"}
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                        <Calendar size={14} />
                        {new Date(user.created_at).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 w-fit ${
                        user.is_verified ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {user.is_verified ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {user.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <button 
                        onClick={() => toggleVerification(user.id, user.is_verified)}
                        className={`p-2.5 rounded-xl transition-all border ${
                          user.is_verified 
                          ? 'text-red-500 border-red-50 hover:bg-red-50' 
                          : 'text-emerald-500 border-emerald-50 hover:bg-emerald-50'
                        }`}
                        title={user.is_verified ? "Nonaktifkan Akun" : "Verifikasi Akun"}
                      >
                        {user.is_verified ? <UserX size={18} /> : <UserCheck size={18} />}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-400 italic">
                    Tidak ada pelanggan yang ditemukan dengan kriteria tersebut.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Insight */}
        <footer className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-4 bg-blue-600 rounded-2xl text-white">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Total Pelanggan</p>
              <h4 className="text-2xl font-black">{users.length}</h4>
           </div>
           <div className="p-4 bg-slate-900 rounded-2xl text-white">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Pelanggan Aktif</p>
              <h4 className="text-2xl font-black">{users.filter(u => u.is_verified).length}</h4>
           </div>
           <div className="p-4 bg-white border border-slate-200 rounded-2xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menunggu Verifikasi</p>
              <h4 className="text-2xl font-black text-amber-500">{users.filter(u => !u.is_verified).length}</h4>
           </div>
        </footer>
      </main>
    </div>
  );
}