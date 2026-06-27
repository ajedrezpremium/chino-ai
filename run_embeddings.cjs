const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function run() {
  const c = new Client({
    host: 'db.kxfokjtfzdznvfykumxy.supabase.co',
    port: 5432,
    user: 'postgres',
    password: 'UnVeZdhD46ajarao',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });
  await c.connect();
  console.log('Connected. Reading SQL file...');
  const sql = fs.readFileSync(path.join('output', 'vector_embeddings_supabase.sql'), 'utf8');
  console.log('Executing SQL...');
  await c.query(sql);
  console.log('OK - all embeddings inserted');
  await c.end();
}

run().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
