// Chiño AI — Router de modelos con fallbacks (optimizado para claves free-tier).
// Orde: 1) override do club vía VITE_CHAT_MODELS 2) free models de mellor calidade
// 3) gpt-4o-mini de pago como último recurso. Cada tarefa escolle a mellor opción
// dispoñible e cae ao seguinte ante 402/403/404/429/5xx ou resposta baleira.

const ENV_CHAIN = (import.meta.env.VITE_CHAT_MODELS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const FREE_CHAIN = [
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
]

const PAID_FALLBACK = ['openai/gpt-4o-mini']

export const CHAT_CHAIN = ENV_CHAIN.length > 0 ? ENV_CHAIN : [...FREE_CHAIN, ...PAID_FALLBACK]

export const EMBED_MODEL = import.meta.env.VITE_EMBED_MODEL || 'text-embedding-3-small'

const OR_KEY = () => import.meta.env.VITE_OPENROUTER_API_KEY || ''
const OA_KEY = () => import.meta.env.VITE_OPENAI_API_KEY || ''

// Os modelos de razoamento queiman tokens pensando: precisan presuposto amplo.
const needsBigBudget = (model) => /nemotron|reasoning|thinking|deepseek-r1|qwq/i.test(model)

function endpointFor(model) {
  if (model.includes('/') || OR_KEY()) {
    return {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OR_KEY()}`,
        'HTTP-Referer': 'https://chinoaiagent.vercel.app',
        'X-Title': 'Chiño AI',
      },
    }
  }
  return {
    url: 'https://api.openai.com/v1/chat/completions',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OA_KEY()}` },
  }
}

const RETRYABLE = new Set([402, 403, 404, 429, 500, 502, 503, 529])

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function chatComplete(messages, { temperature = 0.3, maxTokens = 1200, tag = 'chat' } = {}) {
  let lastError = null
  for (const model of CHAT_CHAIN) {
    // 1 intento + 1 reintento ante 429 (rate-limit transitorio)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { url, headers } = endpointFor(model)
        const budget = needsBigBudget(model) ? Math.max(maxTokens, 2500) : maxTokens
        const res = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({ model, messages, temperature, max_tokens: budget }),
        })
        if (res.status === 429 && attempt === 0) {
          lastError = new Error(`API 429 (${model})`)
          await sleep(3000)
          continue
        }
        if (!res.ok) {
          if (RETRYABLE.has(res.status)) { lastError = new Error(`API ${res.status} (${model})`); break }
          throw new Error(`API ${res.status} (${model})`)
        }
        const data = await res.json()
        const text = data.choices?.[0]?.message?.content?.trim()
        if (!text) { lastError = new Error(`Empty (${model})`); break }
        console.info(`[chiño:${tag}] modelo ${model}`)
        return { text, model }
      } catch (e) {
        lastError = e
        break
      }
    }
  }
  throw lastError || new Error('No model available')
}
