"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  History, 
  Users, 
  Settings, 
  LogOut,
  Wallet,
  MapPin,
  ChevronDown,
  UserCog
} from "lucide-react";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = session?.user?.role;

  // State dropdown
  const [isMasterOpen, setIsMasterOpen] = useState(
    pathname.includes("/superadmin/users") || pathname.includes("/superadmin/mitra")
  );

  // Navigasi Berdasarkan Role
  const menuItems = {
    pelanggan: [
      { name: "Dashboard", href: "/dashboard/pelanggan", icon: LayoutDashboard },
      { name: "Titip Barang", href: "/penitipan/buat", icon: Package },
      { name: "Sewa Angkutan", href: "/angkutan/buat", icon: Truck },
      { name: "Riwayat Transaksi", href: "/riwayat", icon: History },
    ],
    mitra: [
      { name: "Dashboard", href: "/dashboard/mitra", icon: LayoutDashboard },
      { name: "Lokasi Saya", href: "/mitra/lokasi", icon: MapPin },
      { name: "Kelola Armada", href: "/mitra/armada", icon: Truck },
      { name: "Konfirmasi Pesanan", href: "/mitra/update-status", icon: Package },
    ],
    finance: [
      { name: "Dashboard", href: "/dashboard/finance", icon: LayoutDashboard },
      { name: "Verifikasi Bayar", href: "/finance/verifikasi", icon: Wallet },
      { name: "Laporan Keuangan", href: "/finance/laporan", icon: History },
    ],
    admin: [
      { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
      { name: "Manajemen User", href: "/admin/users", icon: Users },
      { name: "Monitor Layanan", href: "/admin/monitor", icon: Settings },
    ],
    superadmin: [
      { name: "Dashboard", href: "/dashboard/superadmin", icon: LayoutDashboard },
      // Data Master tidak ditaruh di sini agar tidak kena looping spasi yang salah
      { name: "Semua Transaksi", href: "/superadmin/transaksi", icon: History },
    ]
  };

  const currentMenu = menuItems[role as keyof typeof menuItems] || [];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col z-50">
      <div className="p-6 border-b border-slate-50">
        <h1 className="text-2xl font-bold text-blue-600 tracking-tight italic">House Ware</h1>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">Management System</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto overflow-x-hidden">
        {currentMenu.map((item, index) => (
          <div key={item.name}>
  <Link
    href={item.href}
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      pathname === item.href 
      ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
      : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
    }`}
  >
    <item.icon size={20} className={pathname === item.href ? "text-white" : "group-hover:text-blue-600"} />
    <span className="font-bold text-sm">{item.name}</span>
  </Link>

  {/* SISIPKAN DROPDOWN TANPA SPASI HANTU */}
  {role === "superadmin" && item.name === "Dashboard" && (
    <>
      <button
        onClick={() => setIsMasterOpen(!isMasterOpen)}
        className={`w-full mt-1 flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
          isMasterOpen ? "text-blue-600 bg-blue-50/50" : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        <div className="flex items-center space-x-3">
          <Settings size={20} />
          <span className="font-bold text-sm">Data Master</span>
        </div>
        <ChevronDown size={16} className={`transition-transform duration-300 ${isMasterOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Gunakan Conditional Rendering (isMasterOpen && ...) untuk menghilangkan ruang hantu */}
      {isMasterOpen && (
        <div className="pl-11 mt-1 mb-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <SubMenuLink 
            href="/superadmin/users" 
            label="Manajemen User" 
            icon={<Users size={14} />} 
            active={pathname === "/superadmin/users"} 
          />
          <SubMenuLink 
            href="/superadmin/mitra" 
            label="Data Mitra" 
            icon={<UserCog size={14} />} 
            active={pathname === "/superadmin/mitra"} 
          />
        </div>
      )}
    </>
  )}
</div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="px-4 py-3 bg-slate-50 rounded-2xl mb-2 border border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">Signed in as</p>
          <p className="text-xs font-bold text-slate-900 truncate">{session?.user?.name || "User"}</p>
          <div className="mt-2"><span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black uppercase italic">{role}</span></div>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/auth/login" })} className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 font-bold text-sm">
          <LogOut size={20} />
          <span>Keluar Sistem</span>
        </button>
      </div>
    </aside>
  );
}

// Komponen Kecil untuk Sub-menu agar kode bersih
function SubMenuLink({ href, label, icon, active }: any) {
  return (
    <Link 
      href={href}
      className={`flex items-center space-x-3 p-2 rounded-lg text-xs font-bold transition-all ${
        active ? "text-blue-600 bg-blue-100" : "text-slate-500 hover:text-blue-600 hover:bg-slate-50"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}