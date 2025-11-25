-- ============================================
-- FIX: Agregar columnas faltantes a players_room
-- ============================================
-- Este script corrige los errores:
-- - "Could not find the 'avatar_bg' column"
-- - "Could not find the 'is_moderator' column"
-- - "Could not find the 'avatar_url' column"

-- Agregar todas las columnas que pueden faltar
ALTER TABLE public.players_room
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS avatar_bg TEXT,
  ADD COLUMN IF NOT EXISTS is_moderator BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS player_name TEXT;

-- Verificar que las columnas existen
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'players_room'
ORDER BY ordinal_position;

