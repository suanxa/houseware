import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    const { email, otp } = await req.json();

    // 1. Cek apakah OTP valid
    const { data: tokenData, error: tokenError } = await supabase
        .from("verification_tokens")
        .select("*")
        .eq("identifier", email)
        .eq("token", otp)
        .single();

    if (tokenError || !tokenData) {
        return NextResponse.json({ error: "OTP Salah atau Kadaluwarsa" }, { status: 400 });
    }

    // 2. AKTIFKAN USER: Ubah is_verified jadi true
    const { error: updateError } = await supabase
        .from("users")
        .update({ is_verified: true })
        .eq("email", email);

    if (updateError) {
        return NextResponse.json({ error: "Gagal mengaktifkan akun" }, { status: 500 });
    }

    // 3. Hapus token agar tidak bisa dipakai lagi
    await supabase.from("verification_tokens").delete().eq("identifier", email);

    return NextResponse.json({ message: "Akun berhasil diaktifkan!" });
}