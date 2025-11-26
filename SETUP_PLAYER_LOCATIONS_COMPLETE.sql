-- ============================================
-- SCRIPT COMPLETO: Configurar player_locations
-- Ejecuta TODO este script en Supabase SQL Editor
-- ============================================

-- 1. Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS public.player_locations (
  id BIGSERIAL PRIMARY KEY,
  room_code TEXT NOT NULL,
  player_name TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_code, player_name)
);

-- 2. Agregar columnas si la tabla ya existía sin ellas
ALTER TABLE public.player_locations
  ADD COLUMN IF NOT EXISTS room_code TEXT,
  ADD COLUMN IF NOT EXISTS player_name TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Crear índice para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_player_locations_room_code ON public.player_locations(room_code);

-- 4. Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_locations;

-- 5. Habilitar RLS (Row Level Security)
ALTER TABLE public.player_locations ENABLE ROW LEVEL SECURITY;

-- 6. Eliminar políticas existentes si existen (para recrearlas)
DROP POLICY IF EXISTS "Allow public read player_locations" ON public.player_locations;
DROP POLICY IF EXISTS "Allow public insert player_locations" ON public.player_locations;
DROP POLICY IF EXISTS "Allow public update player_locations" ON public.player_locations;

-- 7. Crear política para SELECT (leer)
CREATE POLICY "Allow public read player_locations"
ON public.player_locations
FOR SELECT
TO public
USING (true);

-- 8. Crear política para INSERT (insertar)
CREATE POLICY "Allow public insert player_locations"
ON public.player_locations
FOR INSERT
TO public
WITH CHECK (true);

-- 9. Crear política para UPDATE (actualizar)
CREATE POLICY "Allow public update player_locations"
ON public.player_locations
FOR UPDATE
TO public
USING (true) WITH CHECK (true);

-- 10. Agregar constraint único si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'player_locations_room_code_player_name_key'
  ) THEN
    ALTER TABLE public.player_locations
    ADD CONSTRAINT player_locations_room_code_player_name_key
    UNIQUE(room_code, player_name);
  END IF;
END $$;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Después de ejecutar, verifica:
-- 1. Table Editor → player_locations (debe existir)
-- 2. Database → Replication → player_locations (debe estar habilitado ✅)
-- 3. Table Editor → player_locations → RLS policies (debe haber 3 políticas)

