import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendOTP } from "@/lib/email";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, email, password, phone, role } = await req.json();

        // 1. Validasi Input
        if (!name || !email || !password || !phone || !role) {
            return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
        }

        // 2. Hash Password (Keamanan)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Simpan User ke tabel 'users'
        // Kita simpan dengan status mungkin 'unverified' jika kamu ingin sistem verifikasi ketat
        const { data: newUser, error: userError } = await supabase
            .from("users")
            .insert({
                name,
                email,
                password: hashedPassword,
                phone,
                role,
            })
            .select()
            .single();

        if (userError) {
            if (userError.code === "23505") { // Error code untuk email duplikat
                return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
            }
            return NextResponse.json({ error: "Gagal menyimpan data user" }, { status: 500 });
        }

        // 4. Proses OTP (seperti kode kamu sebelumnya)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        await supabase
            .from("verification_tokens")
            .delete()
            .eq("identifier", email);

        const { error: otpError } = await supabase
            .from("verification_tokens")
            .insert({
                identifier: email,
                token: otp,
                expires: expires,
            });

        if (otpError) {
            return NextResponse.json({ error: "User terdaftar, tapi gagal buat OTP" }, { status: 500 });
        }

        // 5. Kirim Email
        try {
            await sendOTP(email, otp);
        } catch (emailError) {
            return NextResponse.json({ error: "Gagal mengirim email verifikasi" }, { status: 500 });
        }

        return NextResponse.json({ message: "Registrasi berhasil, silakan cek email" }, { status: 201 });

    } catch (error) {
        console.error("Register Error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
    }
}