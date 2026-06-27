-- Políticas de seguridad corregidas

DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'rankings_players') THEN
  DROP POLICY IF EXISTS "Lectura pública de rankings" ON rankings_players;
  CREATE POLICY "Lectura pública de rankings" ON rankings_players FOR SELECT USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'rankings_coaches') THEN
  DROP POLICY IF EXISTS "Lectura pública de coaches" ON rankings_coaches;
  CREATE POLICY "Lectura pública de coaches" ON rankings_coaches FOR SELECT USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'user_profiles') THEN
  DROP POLICY IF EXISTS "Lectura pública de perfiles" ON user_profiles;
  DROP POLICY IF EXISTS "Escritura para propietarios" ON user_profiles;
  DROP POLICY IF EXISTS "Actualización para propietarios" ON user_profiles;
  CREATE POLICY "Lectura pública de perfiles" ON user_profiles FOR SELECT USING (true);
  CREATE POLICY "Escritura para propietarios" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
  CREATE POLICY "Actualización para propietarios" ON user_profiles FOR UPDATE USING (auth.uid() = id);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'game_sessions') THEN
  DROP POLICY IF EXISTS "Lectura pública de sesiones" ON game_sessions;
  DROP POLICY IF EXISTS "Crear sesión propia" ON game_sessions;
  DROP POLICY IF EXISTS "Actualizar sesión propia" ON game_sessions;
  CREATE POLICY "Lectura pública de sesiones" ON game_sessions FOR SELECT USING (true);
  CREATE POLICY "Crear sesión propia" ON game_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Actualizar sesión propia" ON game_sessions FOR UPDATE USING (auth.uid() = user_id);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'knowledge_facts') THEN
  DROP POLICY IF EXISTS "Lectura pública de facts" ON knowledge_facts;
  CREATE POLICY "Lectura pública de facts" ON knowledge_facts FOR SELECT USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'game_questions') THEN
  DROP POLICY IF EXISTS "Lectura pública de preguntas" ON game_questions;
  CREATE POLICY "Lectura pública de preguntas" ON game_questions FOR SELECT USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'corrections') THEN
  DROP POLICY IF EXISTS "Usuarios poden enviar correccións" ON corrections;
  DROP POLICY IF EXISTS "Admin pode ver correccións" ON corrections;
  CREATE POLICY "Usuarios poden enviar correccións" ON corrections FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Admin pode ver correccións" ON corrections FOR SELECT USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'chat_history') THEN
  DROP POLICY IF EXISTS "Lectura propia de chat" ON chat_history;
  DROP POLICY IF EXISTS "Escritura propia de chat" ON chat_history;
  CREATE POLICY "Lectura propia de chat" ON chat_history FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Escritura propia de chat" ON chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'conversation_summaries') THEN
  DROP POLICY IF EXISTS "Lectura propia de summaries" ON conversation_summaries;
  DROP POLICY IF EXISTS "Escritura propia de summaries" ON conversation_summaries;
  CREATE POLICY "Lectura propia de summaries" ON conversation_summaries FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Escritura propia de summaries" ON conversation_summaries FOR INSERT WITH CHECK (auth.uid() = user_id);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'push_subscriptions') THEN
  DROP POLICY IF EXISTS "Lectura propia de push" ON push_subscriptions;
  DROP POLICY IF EXISTS "Escritura propia de push" ON push_subscriptions;
  DROP POLICY IF EXISTS "Borrado propio de push" ON push_subscriptions;
  CREATE POLICY "Lectura propia de push" ON push_subscriptions FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Escritura propia de push" ON push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Borrado propio de push" ON push_subscriptions FOR DELETE USING (auth.uid() = user_id);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'realtime_celta') THEN
  DROP POLICY IF EXISTS "Lectura pública de realtime" ON realtime_celta;
  CREATE POLICY "Lectura pública de realtime" ON realtime_celta FOR SELECT USING (true);
END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'anecdotas') THEN
  DROP POLICY IF EXISTS "Lectura pública de anecdotas" ON anecdotas;
  CREATE POLICY "Lectura pública de anecdotas" ON anecdotas FOR SELECT USING (true);
END IF; END $$;
