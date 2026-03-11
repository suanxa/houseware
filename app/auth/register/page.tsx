"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [step, setStep] = useState(1); // Step 1: Form, Step 2: OTP
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "pelanggan",
    });
    const [otp, setOtp] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // FUNGSI STEP 1: Kirim Data & Request OTP
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setStep(2); // Pindah ke tampilan OTP
                setStatus("idle");
            } else {
                setStatus("error");
                setErrorMessage(data.error || "Gagal melakukan registrasi.");
            }
        } catch (error) {
            setStatus("error");
            setErrorMessage("Terjadi kesalahan sistem.");
        }
    };

    // FUNGSI STEP 2: Verifikasi OTP
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        try {
            const res = await fetch("/api/auth/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email, otp }),
            });

            if (res.ok) {
                setStatus("success");
                // Beri jeda 2 detik agar user bisa lihat pesan sukses sebelum pindah
                setTimeout(() => router.push("/auth/login?verified=true"), 2000);
            } else {
                const data = await res.json();
                alert(data.error || "OTP Salah!");
                setStatus("idle");
            }
        } catch (error) {
            setStatus("error");
            setErrorMessage("Gagal verifikasi OTP.");
        }
    };

    // TAMPILAN STEP 2 (OTP)
    if (step === 2) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-slate-900">Verifikasi Email</h2>
                            <p className="text-sm text-slate-500 mt-2">
                                Masukkan 6 digit kode yang dikirim ke <br />
                                <span className="font-semibold text-blue-600">{formData.email}</span>
                            </p>
                        </div>
                        
                        <input 
                            type="text" 
                            maxLength={6} 
                            placeholder="000000"
                            required
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full p-4 border-2 border-slate-200 rounded-xl text-center text-3xl tracking-[1rem] font-bold focus:border-blue-500 focus:ring-0 outline-none transition-all"
                        />

                        <button 
                            disabled={status === "loading" || status === "success"}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:bg-slate-400"
                        >
                            {status === "loading" ? "Memverifikasi..." : "Verifikasi Akun"}
                        </button>

                        {status === "success" && (
                            <p className="text-green-600 text-center font-medium">✅ Verifikasi Berhasil! Mengalihkan ke Login...</p>
                        )}
                    </form>
                </div>
            </div>
        );
    }

    // TAMPILAN STEP 1 (FORM DATA)
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12 px-4">
            <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-600">House Ware</h1>
                    <p className="text-slate-500 mt-2">Lengkapi data diri untuk mendaftar</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Contoh: Budi Santoso"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Alamat Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="nama@email.com"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Nomor Telepon</label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="0812xxxx"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Daftar Sebagai</label>
                            <select
                                name="role"
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900"
                                onChange={handleChange}
                            >
                                <option value="pelanggan">Pelanggan</option>
                                <option value="mitra">Mitra (Penyedia Jasa)</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-blue-200 disabled:bg-slate-400 mt-4"
                    >
                        {status === "loading" ? "Memproses..." : "Daftar Sekarang"}
                    </button>
                </form>

                {status === "error" && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                        ❌ {errorMessage}
                    </div>
                )}

                <div className="mt-6 text-center text-sm text-slate-600">
                    Sudah punya akun?{" "}
                    <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
                        Login di sini
                    </Link>
                </div>
            </div>
        </div>
    );
}