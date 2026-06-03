-- Vector search setup for knowledge_facts
-- Run this AFTER combined_migration.sql (table must exist with 665 facts)

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column
ALTER TABLE knowledge_facts ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- 3. Create IVFFlat index for approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS idx_knowledge_facts_embedding ON knowledge_facts USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 4. Create match function
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 50
)
RETURNS TABLE(fact_text text, similarity float)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT kf.fact_text, 1 - (kf.embedding <=> query_embedding) as similarity
  FROM knowledge_facts kf
  WHERE 1 - (kf.embedding <=> query_embedding) > match_threshold
  ORDER BY kf.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5. Now run: output/vector_embeddings_supabase.sql (UPDATE with 665 vectors)
-- That file is 19.6MB and needs to be run separately
