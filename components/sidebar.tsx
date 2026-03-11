"use client";

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
  MapPin
} from "lucide-react";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = session?.user?.role;

  // Navigasi Dinamis Berdasarkan Role
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
      { name: "Pesanan Masuk", href: "/mitra/pesanan", icon: Package },
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
      { name: "Data Master", href: "/superadmin/master", icon: Settings },
      { name: "Semua Transaksi", href: "/superadmin/all", icon: History },
    ]
  };

  // Ambil menu sesuai role user yang sedang login
  const currentMenu = menuItems[role as keyof typeof menuItems] || [];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-50">
        <h1 className="text-2xl font-bold text-blue-600 tracking-tight">House Ware</h1>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">Management System</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {currentMenu.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
              }`}
            >
              <item.icon size={20} className={isActive ? "text-white" : "group-hover:text-blue-600"} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer & Logout */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <div className="px-4 py-3 bg-slate-50 rounded-xl mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Login Sebagai</p>
          <p className="text-sm font-bold text-slate-900 truncate">{session?.user?.name}</p>
          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase italic">
            {role}
          </span>
        </div>
        
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium"
        >
          <LogOut size={20} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
}