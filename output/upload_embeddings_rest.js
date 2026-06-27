// Upload embeddings via Supabase REST API (HTTPS, IPv4 compatible)
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const PROJECT = 'kxfokjtfzdznvfykumxy'
const SUPABASE_URL = `https://${PROJECT}.supabase.co`
const SERVICE_KEY = process.argv[2]
if (!SERVICE_KEY) {
  console.error('Uso: node upload_embeddings_rest.js TU_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// Parse SQL to get (fact_text_prefix, vector) pairs
const sql = fs.readFileSync(path.join(__dirname, 'vector_embeddings_supabase.sql'), 'utf8')
const lines = sql.split('\n')
const valuesIdx = lines.findIndex(l => l.trim().startsWith('VALUES'))
const closeIdx = lines.findIndex(l => l.trim().startsWith(') AS v(text_prefix, vec)'))
const factLines = lines.slice(valuesIdx + 1, closeIdx).map(l => l.trim()).filter(l => l.startsWith('('))

const facts = []
for (let i = 0; i < factLines.length; i++) {
  const clean = factLines[i].endsWith(',') ? factLines[i].slice(0, -1) : factLines[i]
  const inner = clean.slice(1, -1)
  const commaIdx = inner.indexOf("', '")
  if (commaIdx === -1) continue
  const factPrefix = inner.slice(1, commaIdx)
  const vecStr = inner.slice(commaIdx + 3, -1)
  facts.push({ text_prefix: factPrefix, vector: vecStr })
}

console.log(`Total: ${facts.length} facts to update`)

let ok = 0, errs = 0
const start = Date.now()

async function run() {
  for (let i = 0; i < facts.length; i++) {
    const f = facts[i]
    // Match by fact_text LIKE prefix%
    const { error } = await supabase
      .from('knowledge_facts')
      .update({ embedding: f.vector })
      .ilike('fact_text', `${f.text_prefix}%`)
    
    if (error) {
      errs++
      if (errs <= 3) console.error(`  Error #${i}: ${error.message}`)
    } else {
      ok++
    }
    if ((i + 1) % 50 === 0) {
      const elapsed = ((Date.now() - start) / 1000).toFixed(0)
      console.log(`  ${i + 1}/${facts.length} (${elapsed}s)`)
    }
  }
  const total = ((Date.now() - start) / 1000).toFixed(0)
  console.log(`\n✓ ${ok} actualizados, ${errs} errores — ${total}s`)
}

run().catch(e => console.error('Fatal:', e))
