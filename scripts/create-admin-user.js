const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function createAdminUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Admin şifresini hash'le
    const password = 'admin123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Admin kullanıcısını ekle veya güncelle
    const email = 'admin@rentbuyantalya.com';
    
    const query = `
      INSERT INTO public.admin_users (id, email, password_hash, role, active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (email) 
      DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        active = EXCLUDED.active,
        updated_at = NOW()
      RETURNING *;
    `;

    const values = [
      '087ef190-fdc4-4602-ac9e-2694fd3eee79', // UUID
      email,
      passwordHash,
      'super_admin',
      true
    ];

    const result = await client.query(query, values);
    
    console.log('✅ Admin user created/updated successfully:');
    console.log('Email:', result.rows[0].email);
    console.log('Role:', result.rows[0].role);
    console.log('Active:', result.rows[0].active);
    console.log('Password:', password);
    
    // Test password verification
    const isValid = await bcrypt.compare(password, passwordHash);
    console.log('✅ Password hash verification:', isValid);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createAdminUser();