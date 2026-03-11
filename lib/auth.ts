import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs"; // Pastikan sudah install bcryptjs

// --- UPDATE DEFINISI TIPE ---
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string; // Tambahkan role
      phone: string; // Tambahkan phone jika perlu
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    phone?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
// -----------------------------------

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan Password wajib diisi");
        }

        // 1. Cari user di database berdasarkan email
        const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", credentials.email)
    .single();

  if (!user || error) throw new Error("Akun tidak ditemukan");

  // CEK APAKAH SUDAH VERIFIKASI
  if (user.is_verified === false) {
    throw new Error("Akun belum diverifikasi. Silakan cek email Anda.");
  }

        // 2. Bandingkan password yang diinput dengan yang di DB (bcrypt)
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Password salah");
        }

        // 3. Kembalikan data user beserta Role-nya
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // Penting untuk redirect dashboard
          phone: user.phone,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as string; // Masukkan role ke JWT
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string; // Masukkan role ke Session
      }
      return session;
    },
  },
});