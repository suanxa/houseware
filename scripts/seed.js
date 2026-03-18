const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY 
);

async function seed() {
  const password = await bcrypt.hash('password123', 10);
  console.log('--- Memulai Seeding ---');

  const users = [
    { name: 'Admin Operasional', email: 'admin@houseware.com', role: 'admin' },
    { name: 'Finance Manager', email: 'finance@houseware.com', role: 'finance' },
    { name: 'Mitra Gudang', email: 'mitra@houseware.com', role: 'mitra' },
    { name: 'Budi Pelanggan', email: 'pelanggan@gmail.com', role: 'pelanggan' },
  ];

  for (const user of users) {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        name: user.name,
        email: user.email,
        password: password,
        role: user.role,
        is_verified: true,
        phone: '08123456789'
      }, { onConflict: 'email' });

    if (error) {
      console.error(`Gagal seed ${user.email}:`, error.message);
    } else {
      console.log(`✅ Berhasil seed: ${user.email}`);
    }
  }

  console.log('--- Seeding Selesai! ---');
}

seed();