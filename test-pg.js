const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('✅ Successfully connected to Supabase PostgreSQL! Server time:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Connection failed:', err);
  } finally {
    await client.end();
  }
}

run();
