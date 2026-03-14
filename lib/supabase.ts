import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// GUNAKAN ANON KEY UNTUK SISI CLIENT
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: typeof window !== "undefined", // Aktifkan jika di browser
    persistSession: typeof window !== "undefined",
  },
})