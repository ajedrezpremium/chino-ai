-- Tabla histórica de partidos del RC Celta (1923-)
-- Un registro por partido, escalable a miles
CREATE TABLE IF NOT EXISTS match_history (
  id BIGSERIAL PRIMARY KEY,
  season TEXT NOT NULL,
  date TEXT NOT NULL,
  competition TEXT NOT NULL,
  opponent TEXT NOT NULL,
  home BOOLEAN NOT NULL DEFAULT true,
  result TEXT,
  scorers JSONB DEFAULT '[]',
  attendance TEXT,
  round TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_history_season ON match_history(season);
CREATE INDEX IF NOT EXISTS idx_match_history_date ON match_history(date);

ALTER TABLE match_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura pública de match_history" ON match_history;
CREATE POLICY "Lectura pública de match_history" ON match_history
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Escritura service_role match_history" ON match_history;
CREATE POLICY "Escritura service_role match_history" ON match_history
  FOR INSERT WITH CHECK (true);
