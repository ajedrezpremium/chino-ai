-- Chiño AI — Atribución de ventas (UTM + clics + cupones)
-- Tablas para demostrar €€€ atribuidos ao axente: clics en ofertas/enlaces e cupones reclamados

-- 1. Clics en accións do axente (ofertas, enlaces, cupones)
CREATE TABLE IF NOT EXISTS link_clicks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'enlace' CHECK (kind IN ('oferta', 'enlace', 'cupon')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_link_clicks_created ON link_clicks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_link_clicks_kind ON link_clicks(kind);
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública de link_clicks" ON link_clicks;
CREATE POLICY "Lectura pública de link_clicks" ON link_clicks FOR SELECT USING (true);
DROP POLICY IF EXISTS "Inserción pública de link_clicks" ON link_clicks;
CREATE POLICY "Inserción pública de link_clicks" ON link_clicks FOR INSERT WITH CHECK (true);

-- 2. Códigos promocionais (crea o club, reparte o axente)
CREATE TABLE IF NOT EXISTS promo_codes (
  code TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT DEFAULT '',
  discount_text TEXT DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública de promo_codes" ON promo_codes;
CREATE POLICY "Lectura pública de promo_codes" ON promo_codes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Inserción pública de promo_codes" ON promo_codes;
CREATE POLICY "Inserción pública de promo_codes" ON promo_codes FOR INSERT WITH CHECK (true);

-- 3. Cupones reclamados (conversión atribuída)
CREATE TABLE IF NOT EXISTS coupon_claims (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  code TEXT NOT NULL REFERENCES promo_codes(code) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, code)
);
CREATE INDEX IF NOT EXISTS idx_coupon_claims_code ON coupon_claims(code);
CREATE INDEX IF NOT EXISTS idx_coupon_claims_created ON coupon_claims(created_at DESC);
ALTER TABLE coupon_claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura pública de coupon_claims" ON coupon_claims;
CREATE POLICY "Lectura pública de coupon_claims" ON coupon_claims FOR SELECT USING (true);
DROP POLICY IF EXISTS "Inserción pública de coupon_claims" ON coupon_claims;
CREATE POLICY "Inserción pública de coupon_claims" ON coupon_claims FOR INSERT WITH CHECK (true);

-- 4. Flag en chat_history: a mensaxe do axente incluía unha acción comercial (para o funnel)
ALTER TABLE chat_history ADD COLUMN IF NOT EXISTS has_action BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_chat_history_action ON chat_history(has_action, created_at DESC);

-- 5. Códigos iniciais de exemplo
INSERT INTO promo_codes (code, label, description, discount_text, active) VALUES
  ('CHINO10', 'Tenda Oficial', 'Desconto na tenda oficial do RC Celta', '10% dto.', true),
  ('ABONO26', 'Renovación Abono', 'Desconto en gastos de xestión ao renovar o abono 26/27', '5€ dto.', true),
  ('TOURBALAIDOS', 'Tour Balaídos', 'Visita guiada ao estadio con desconto', '2x1', true)
ON CONFLICT (code) DO NOTHING;
