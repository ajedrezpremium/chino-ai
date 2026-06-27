const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const PASSWORD = process.argv[2]
if (!PASSWORD) {
  console.error('Uso: node run_embeddings.js TU_PASSWORD')
  process.exit(1)
}

// Try pooler first (IPv4 compatible), fallback to direct (IPv6)
async function tryConnect(host, port) {
  const client = new Client({
    host,
    port,
    database: 'postgres',
    user: 'postgres',
    password: PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  })
  await client.connect()
  return client
}

async function main() {
  const PROJECT = 'kxfokjtfzdznvfykumxy'
  let client
  // Try direct IPv6 address
  const ipv6 = '2a05:d01c:874:6b02:7744:8705:c428:3e3'
  const hostsToTry = [
    { host: ipv6, port: 5432, label: 'IPv6 directo' },
  ]
  for (const h of hostsToTry) {
    try {
      client = await tryConnect(h.host, h.port)
      console.log(`Conectado via ${h.label}: ${h.host}:${h.port}`)
      break
    } catch (e) {
      console.log(`  ${h.label} falló: ${e.message}`)
    }
  }
  if (!client) {
    console.error('No se pudo conectar.')
    console.error('▶ Activa IPv4 add-on en Supabase Dashboard → Database (solución fácil)')
    console.error('▶ O pega los 34 chunks de output/embedding_chunks/ en el SQL Editor')
    process.exit(1)
  }
  const sql = fs.readFileSync(path.join(__dirname, 'vector_embeddings_supabase.sql'), 'utf8')
  console.log('Ejecutando SQL... (19.6MB, puede tardar 1-2 min)')
  await client.query(sql)
  console.log('¡Listo! 665 embeddings cargados')
  await client.end()
}

main().catch(e => { console.error('Error:', e.message); process.exit(1) })
