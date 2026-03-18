import { auth } from "@/lib/auth"; 
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isDashboardPage = nextUrl.pathname.startsWith("/dashboard");
  const isPenitipanPage = nextUrl.pathname.startsWith("/penitipan");
  const isAngkutanPage = nextUrl.pathname.startsWith("/angkutan");

  // 1. Jika belum login dan mencoba akses halaman terproteksi
  if (!isLoggedIn && (isDashboardPage || isPenitipanPage || isAngkutanPage)) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  // 2. Proteksi Role (Cek apakah folder dashboard sesuai dengan role user)
  if (isDashboardPage) {
    const targetRole = nextUrl.pathname.split("/")[2]; // mengambil 'admin' dari '/dashboard/admin'
    
    if (role !== targetRole) {
      // Jika role tidak cocok, tendang ke dashboard miliknya sendiri
      return NextResponse.redirect(new URL(`/dashboard/${role}`, nextUrl));
    }
  }

  // 3. Proteksi Fitur Khusus Pelanggan
  if ((isPenitipanPage || isAngkutanPage) && role !== "pelanggan") {
    return NextResponse.redirect(new URL(`/dashboard/${role}`, nextUrl));
  }

  return NextResponse.next();
});

// Matcher tetap sama
export const config = {
  matcher: ["/dashboard/:path*", "/penitipan/:path*", "/angkutan/:path*"],
};