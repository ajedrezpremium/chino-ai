-- =============================================================
-- MIGRACIÓN V1.0 · Chiño AI
-- Ranking con nombres reales + perfiles públicos
-- =============================================================

-- 1. Permitir SELECT público en user_profiles (para rankings)
DROP POLICY IF EXISTS "Perfil propio" ON user_profiles;
CREATE POLICY "Lectura pública de perfiles" ON user_profiles FOR SELECT USING (TRUE);
CREATE POLICY "Crear perfil propio" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Actualizar perfil propio" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Permitir SELECT público en game_sessions (para rankings)
DROP POLICY IF EXISTS "Sesiones propias" ON game_sessions;
CREATE POLICY "Lectura pública de sesiones" ON game_sessions FOR SELECT USING (TRUE);
CREATE POLICY "Crear sesión propia" ON game_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Actualizar sesión propia" ON game_sessions FOR UPDATE USING (auth.uid() = user_id);

-- 3. Añadir display_name a user_profiles (para compatibilidade)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
