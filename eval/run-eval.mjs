// Test de Experto — ejecuta las 17 preguntas contra el MISMO modelo/prompt/RAG que producción.
// Env: SUPABASE_URL, SUPABASE_SERVICE_KEY, OPENROUTER_KEY
// Salida: eval/eval_resultados_<fecha>.md
import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { LIGA_AGENT_SNAPSHOT } from '../frontend/src/liga-data.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
const OR_KEY = process.env.OPENROUTER_KEY
if (!SUPABASE_URL || !SUPABASE_KEY || !OR_KEY) {
  console.error('Faltan env: SUPABASE_URL, SUPABASE_SERVICE_KEY, OPENROUTER_KEY')
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const src = readFileSync(join(__dirname, '..', 'frontend', 'src', 'chino-knowledge.js'), 'utf-8')
const SYSTEM_PROMPT = src.slice(src.indexOf('`') + 1, src.lastIndexOf('`'))

const CORE_TRUTHS = [
  'O Celta NUNCA gañou a Copa do Rei. Subcampión en 1948, 1994 e 2001.',
  'O Celta NUNCA gañou LaLiga. Mellor posto: 4º.',
  'O Celta NUNCA gañou a Champions nin a UEFA/Europa League.',
  'Aleksandr Mostovoi chegou ao Celta en 1996, NON xogou a final de Copa de 1994.',
  'Iago Aspas debutou en 2008, NON xogou co EuroCelta.',
  'O estadio de Balaídos inaugurouse en 1928. NON o construíu ningún presidente do Celta.',
  'Marián Mouriño é presidenta desde decembro de 2023, NON desde 2025.',
  'Carlos Mouriño foi presidente de 2006 a 2023, NON ata 2025.',
]

// [pregunta, lang, [grupos de keywords con alternativas |]]
const QUESTIONS = [
  ['¿Cuántas Copas del Rey ha ganado el Celta en su historia?', 'es', ['cero|ninguna|nunca|no ha ganado|ningún', '1948', '1994', '2001']],
  ['¿Jugó Mostovoi la final de Copa del Rey de 1994?', 'es', ['no', '1996']],
  ['¿Quién es el máximo goleador histórico del Celta?', 'es', ['aspas']],
  ['¿En qué puesto terminó el Celta la Liga 2025-26 y qué competición europea juega gracias a eso?', 'es', ['sext|6', '54', 'europa']],
  ['¿Cómo va la Liga 2026-27? ¿Quién es el líder?', 'es', ['barcelona|barca', 'jornada|septiembre|directo|laliga']],
  ['¿Cuándo debutó Iago Aspas con el primer equipo? ¿Coincidió con el EuroCelta?', 'es', ['2008', 'no']],
  ['¿Quién es la presidenta del Celta y desde cuándo?', 'es', ['mourino|mouriño', '2023']],
  ['Quiero renovar mi abono para la 26/27: ¿cuánto cuesta lo más barato y hasta cuándo puedo hacerlo?', 'es', ['54', 'junio|19']],
  ['¿Qué es el suplemento de Europa League del abono y cuánto cuesta?', 'es', ['20', 'agosto']],
  ['Quiero visitar Balaídos: ¿dónde compro las entradas del tour, cuánto cuestan y dónde empieza la visita?', 'es', ['bstadium', '15', '14']],
  ['¿Cuándo se inauguró el estadio de Balaídos y qué capacidad tiene?', 'es', ['1928', '29']],
  ['¿Cuál es el mejor puesto del Celta en la historia de la Liga?', 'es', ['cuarto|4', '2002|1947']],
  ['¿Qué equipos descendieron a Segunda División en la temporada 2025-26?', 'es', ['mallorca', 'girona', 'oviedo']],
  ['Estoy pensando en renovar mi abono pero no sé si merece la pena', 'es', ['portal|enlace|abono26|ayud|oferta|cupon']],
  ['¿Ha jugado el Celta la Champions League alguna vez?', 'es', ['2003|03-04', 'octavos|arsenal']],
  ['Cantas Copas do Rei gañou o Celta na súa historia?', 'gl', ['1948', '1994']],
  ["Who is Celta's all-time top scorer and how many goals has he scored?", 'en', ['aspas', '200']],
]

const CAT_MAP = {
  economia: ['presupuesto', 'presuposto', 'salario', 'dinero', 'ingreso', 'gasto', 'venta', 'traspaso', 'deuda', 'millon', 'limite', 'financi'],
  estadio: ['estadio', 'balaidos', 'aforo', 'capacidad', 'remodel', 'grada', 'afouteza', 'tour', 'visita', 'museo'],
  adestradores: ['entrenador', 'adestrador', 'coach', 'tecnico', 'director'],
  presidentes: ['presidente', 'presidenta', 'directiva', 'mouriño', 'mourino', 'ges'],
  europa: ['europa', 'uefa', 'champions', 'europa league', 'intertoto', 'suplemento'],
  historia: ['fundacion', 'historia', 'fusion', '1923', 'origen', 'orixe', 'copa', 'subcampeon'],
  plantilla: ['plantilla', 'xogador', 'jugador', 'fichaxe', 'fichaje', 'contrato', 'cesion', 'mercado', 'canteira', 'cantera'],
  xogadores: ['porteiro', 'portero', 'goleador', 'zamora', 'gol', 'goles', 'mejor', 'mellor', 'partidos', 'aspas', 'mostovoi'],
  liga: ['liga', 'clasificacion', 'tabla', 'posicion', 'puesto', 'puntos', 'lider', 'jornada', 'descenso', 'ascenso'],
  servicios: ['abono', 'abonado', 'renovar', 'renovacion', 'carnet', 'carne', 'entrada', 'entradas', 'taquilla', 'precio', 'cuesta', 'cuestan', 'horario', 'portal', 'tour', 'tienda'],
}
const STOP = new Set(['que', 'el', 'la', 'los', 'las', 'un', 'una', 'del', 'en', 'por', 'con', 'para', 'es', 'se', 'su', 'al', 'lo', 'como', 'mas', 'pero', 'sus', 'le', 'ya', 'este', 'entre', 'todo', 'esta', 'sin', 'era', 'muy', 'cual', 'quien', 'the', 'of', 'and', 'to', 'in', 'is', 'it', 'for', 'on', 'with', 'as', 'at', 'from', 'or', 'an', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'has', 'are', 'have', 'been', 'what', 'when', 'who', 'has', 'how'])

const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

async function getEmbedding(text) {
  const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OR_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.data?.[0]?.embedding || null
}

async function fetchFacts(q) {
  const seen = new Set()
  const merged = []
  const push = (arr) => {
    for (const f of arr || []) {
      const ft = typeof f === 'string' ? f : f.fact_text
      if (ft && !seen.has(ft)) { seen.add(ft); merged.push(ft) }
    }
  }
  const vectorJob = (async () => {
    try {
      const emb = await getEmbedding(q)
      if (emb) {
        const { data } = await supabase.rpc('match_knowledge', { query_embedding: emb, match_threshold: 0.6, match_count: 25 })
        push(data)
      }
    } catch {}
  })()
  const t = norm(q)
  const cats = Object.entries(CAT_MAP).filter(([, kw]) => kw.some((k) => t.includes(k))).map(([c]) => c)
  const words = q.toLowerCase().replace(/[^a-z0-9áéíóúñü\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w))
  const searchTerm = words.join(' ')
  const keywordJob = (async () => {
    try {
      let query = supabase.from('knowledge_facts').select('fact_text').eq('verified', true)
      if (cats.length) query = query.in('category', cats)
      if (searchTerm) query = query.textSearch('fact_text', searchTerm, { type: 'websearch' })
      const { data } = await query.limit(25)
      push(data)
    } catch {}
    if (cats.length) {
      try {
        const { data: fb } = await supabase.from('knowledge_facts').select('fact_text').eq('verified', true).in('category', cats).limit(25)
        push(fb)
      } catch {}
    }
  })()
  await Promise.all([vectorJob, keywordJob])
  return merged.slice(0, 60)
}

const LANG_SYS = {
  gl: 'O usuario escribiu en GALEGO. RESPONDE SÓ EN GALEGO. 0 palabras en español ou inglés.',
  en: 'The user wrote in ENGLISH. Respond ONLY in English. 0 words in Spanish or Galician.',
  es: 'El usuario escribió en ESPAÑOL. RESPONDE SÓLO EN ESPAÑOL. 0 palabras en gallego o inglés.',
}

async function ask(q, lang) {
  const facts = await fetchFacts(q)
  const factsStr = facts.length ? facts.join('\n') : '(sen feitos específicos; usa o teu coñecemento xeral con prudencia)'
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'system', content: `Hechos verificados:\n${CORE_TRUTHS.join('\n')}\n---\n${factsStr}` },
    { role: 'system', content: LIGA_AGENT_SNAPSHOT },
    { role: 'system', content: `🚨 IDIOMA: ${LANG_SYS[lang]}` },
    { role: 'user', content: q },
  ]
  // NOTA: a clave dispoñible é free-tier (sen créditos) → úsase un modelo :free.
  // O que se avalía é a RAG + prompt (idénticos a producción), non o modelo.
  const EVAL_MODEL = process.env.EVAL_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free'
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OR_KEY}`, 'HTTP-Referer': 'https://chinoaiagent.vercel.app', 'X-Title': 'Chiño AI eval' },
    body: JSON.stringify({ model: EVAL_MODEL, messages, temperature: 0.2, max_tokens: 2500 }),
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function main() {
  console.log(`Avaliando ${QUESTIONS.length} preguntas...`)
  const rows = []
  let pass = 0
  for (let i = 0; i < QUESTIONS.length; i++) {
    const [q, lang, groups] = QUESTIONS[i]
    let answer = ''
    try {
      answer = await ask(q, lang)
    } catch (e) {
      answer = `ERRO: ${e.message}`
    }
    const n = norm(answer)
    const hits = groups.map((g) => g.split('|').some((alt) => n.includes(norm(alt.trim()))))
    const ok = hits.every(Boolean)
    if (ok) pass++
    rows.push({ i: i + 1, q, lang, ok, hits, groups, answer: answer.slice(0, 600) })
    console.log(`Q${i + 1}: ${ok ? '✅' : '❌'} [${hits.map((h) => (h ? '·' : 'X')).join('')}] ${q.slice(0, 60)}`)
  }
  const stamp = new Date().toISOString().split('T')[0]
  const modelName = process.env.EVAL_MODEL || 'nvidia/nemotron-3-super-120b-a12b:free'
  let md = `# 🧪 Resultados Test de Experto — ${stamp}\n\n**Chiño: ${pass}/${QUESTIONS.length} (${Math.round((pass / QUESTIONS.length) * 100)}%)** · modelo ${modelName} (clave free-tier; en producción openai/gpt-4o-mini), temp 0.2, MESMO prompt e RAG que producción. O test avalía o coñecemento inxectado, non o modelo.\n\n`
  for (const r of rows) {
    md += `## Q${r.i} ${r.ok ? '✅' : '❌'} (${r.lang})\n**${r.q}**\n\nKeywords: ${r.groups.map((g, k) => (r.hits[k] ? '✅' : '❌') + ' `' + g + '`').join(' ')}\n\n> ${r.answer.replace(/\n/g, '\n> ')}\n\n`
  }
  const out = join(__dirname, `eval_resultados_${stamp}.md`)
  writeFileSync(out, md)
  console.log(`\nGardado en ${out}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
