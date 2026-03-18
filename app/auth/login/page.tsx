"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); 
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, 
      });

      if (result?.error) {
        setStatus("error");
        setErrorMessage("Email atau Password salah.");
        return;
      }
      if (result?.ok) {
        setStatus("success");
        window.location.href = "/dashboard/pelanggan"; 
      }
    } catch (err) {
      console.error("Login Error:", err);
      setStatus("error");
      setErrorMessage("Terjadi kesalahan sistem.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">House Ware</h1>
          <p className="text-slate-500 mt-2">Masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Alamat Email</label>
            <input
              type="email"
              placeholder="nama@email.com"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="Masukkan password anda"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900"
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button 
            type="submit" 
            disabled={status === "loading"}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all disabled:bg-slate-400"
          >
            {status === "loading" ? "Memproses..." : "Masuk ke House Ware"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="text-blue-600 font-semibold hover:underline">
            Daftar di sini
          </Link>
        </div>

        {status === "error" && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
            ❌ {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
}