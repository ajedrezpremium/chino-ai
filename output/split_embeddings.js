const fs = require('fs')
const path = require('path')

const sql = fs.readFileSync(path.join(__dirname, 'vector_embeddings_supabase.sql'), 'utf8')

// The file has one fact per line inside VALUES, like:
// VALUES
// ('fact1', '[vector]'),
// ('fact2', '[vector]'),
// ...
// ) AS v(text_prefix, vec)

const lines = sql.split('\n')

// Find VALUES line
const valuesIdx = lines.findIndex(l => l.trim().startsWith('VALUES'))
// Find the closing line
const closeIdx = lines.findIndex(l => l.trim().startsWith(') AS v(text_prefix, vec)'))

// Extract fact lines (each starts with '(')
const factLines = lines.slice(valuesIdx + 1, closeIdx)
  .map(l => l.trim())
  .filter(l => l.startsWith('('))

console.log(`Total facts encontrados: ${factLines.length}`)

// Header: lines before VALUES + VALUES + first fact
const headerFirstLine = lines.slice(0, valuesIdx + 1).join('\n') + '\n'

// Footer: everything after ) AS v(...)
let footer = lines.slice(closeIdx).join('\n')
const semiPos = footer.indexOf(');')
if (semiPos >= 0) {
  footer = footer.substring(semiPos + 2).trim()
}

// Split into chunks of 50
const CHUNK_SIZE = 20
const totalChunks = Math.ceil(factLines.length / CHUNK_SIZE)

fs.mkdirSync(path.join(__dirname, 'embedding_chunks'), { recursive: true })

// Separate trailing comma from last fact
for (let i = 0; i < totalChunks; i++) {
  const chunkFacts = factLines.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE).map(l => l)
  // Remove trailing comma from last line in chunk
  const last = chunkFacts.length - 1
  if (chunkFacts[last].endsWith(',')) {
    chunkFacts[last] = chunkFacts[last].slice(0, -1)
  }
  let chunkSQL = headerFirstLine
  chunkSQL += chunkFacts.join('\n') + '\n'
  chunkSQL += ') AS v(text_prefix, vec) WHERE knowledge_facts.fact_text LIKE v.text_prefix || \'%\';\n\n'
  // Only add footer to last chunk
  if (i === totalChunks - 1) {
    chunkSQL += footer
  }
  const filePath = path.join(__dirname, 'embedding_chunks', `embedding_chunk_${i + 1}_of_${totalChunks}.sql`)
  fs.writeFileSync(filePath, chunkSQL, 'utf8')
  const sizeKB = (Buffer.byteLength(chunkSQL, 'utf8') / 1024).toFixed(1)
  console.log(`Chunk ${i + 1}/${totalChunks}: ${chunkFacts.length} facts → ${path.basename(filePath)} (${sizeKB}KB)`)
}

console.log(`\n¡Listo! ${totalChunks} archivos en output/embedding_chunks/`)
console.log('Pégalos en orden en el SQL Editor de Supabase.')
