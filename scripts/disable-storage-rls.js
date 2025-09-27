const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function disableStorageRLS() {
  console.log('Database URL:', process.env.DATABASE_URL);
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Disable RLS for storage.objects
    await client.query('ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;');
    console.log('✅ Storage RLS disabled successfully');

    // Drop existing policies
    const policies = [
      'Public read access for listings',
      'Public read access for services', 
      'Public read access for pages',
      'Public read access for blog',
      'Authenticated users can upload listings',
      'Authenticated users can upload services',
      'Authenticated users can upload pages', 
      'Authenticated users can upload blog',
      'Allow upload to listings',
      'Allow upload to services',
      'Allow upload to pages',
      'Allow upload to blog'
    ];

    for (const policy of policies) {
      try {
        await client.query(`DROP POLICY IF EXISTS "${policy}" ON storage.objects;`);
        console.log(`✅ Dropped policy: ${policy}`);
      } catch (error) {
        console.log(`⚠️ Policy not found or error: ${policy}`);
      }
    }

    console.log('🎉 Storage RLS configuration completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

disableStorageRLS();