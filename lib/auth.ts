import NextAuth, { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// Hapus SupabaseAdapter import
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      phone: string;
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  // --- HAPUS ADAPTER DI SINI ---
  // Kita tidak butuh adapter untuk CredentialsProvider
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null; // Lebih baik return null daripada throw error di sini
        }

        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", credentials.email)
          .single();

        // Debugging di Terminal VS Code
        console.log("Mencoba login:", credentials.email);

        if (!user || error) {
          console.log("User tidak ditemukan");
          return null;
        }

        if (user.is_verified === false) {
          console.log("User belum verifikasi");
          throw new Error("Akun belum diverifikasi.");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          console.log("Password salah");
          return null;
        }

        console.log("Login Berhasil untuk role:", user.role);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt", // Credentials WAJIB pakai JWT
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login", // Redirect kustom jika terjadi error
  },
});