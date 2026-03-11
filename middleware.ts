import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Ambil token untuk cek apakah user sudah login
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Izinkan request jika:
  // 1. Ini adalah request untuk next-auth (api/auth)
  // 2. Token ada (sudah login)
  if (pathname.includes("/api/auth") || token) {
    return NextResponse.next();
  }

  // Redirect ke login jika tidak punya token & mencoba akses halaman terproteksi
  if (!token && pathname !== "/auth/login") {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inventory/:path*",
    // Tambahkan halaman lain yang ingin dikunci di sini
  ],
};