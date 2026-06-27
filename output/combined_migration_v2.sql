-- =============================================
-- MIGRACIÓN V2: Memoria persistente + Anécdotas
-- =============================================

-- 1. Tabla de resúmenes de conversación (memoria persistente)
CREATE TABLE IF NOT EXISTS conversation_summaries (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_user
  ON conversation_summaries(user_id, created_at DESC);

-- 2. Tabla de anécdotas (YouTube Las Historias de Venom)
CREATE TABLE IF NOT EXISTS anecdotas (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  url_video TEXT NOT NULL,
  protagonista TEXT,
  equipo TEXT,
  año TEXT,
  categoria TEXT,
  valor_ensenanza TEXT,
  resumen TEXT,
  transcripcion TEXT,
  fecha_publicacion TIMESTAMPTZ,
  vistas BIGINT,
  likes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_anecdotas_protagonista ON anecdotas(protagonista);
CREATE INDEX IF NOT EXISTS idx_anecdotas_equipo ON anecdotas(equipo);
CREATE INDEX IF NOT EXISTS idx_anecdotas_categoria ON anecdotas(categoria);
CREATE INDEX IF NOT EXISTS idx_anecdotas_año ON anecdotas(año);

-- 3. Tabla de datos en tiempo real
CREATE TABLE IF NOT EXISTS realtime_celta (
  id BIGSERIAL PRIMARY KEY,
  data_type TEXT NOT NULL, -- 'standings', 'matches', 'squad', 'transfers'
  payload JSONB NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_realtime_type_time ON realtime_celta(data_type, fetched_at DESC);
