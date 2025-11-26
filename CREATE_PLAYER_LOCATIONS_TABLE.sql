-- Tabla para almacenar ubicaciones de jugadores en tiempo real
CREATE TABLE IF NOT EXISTS public.player_locations (
  id BIGSERIAL PRIMARY KEY,
  room_code TEXT NOT NULL,
  player_name TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_code, player_name)
);

-- Índice para mejorar búsquedas por sala
CREATE INDEX IF NOT EXISTS idx_player_locations_room_code ON public.player_locations(room_code);

-- Habilitar Realtime para esta tabla
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_locations;

-- Política RLS: Permitir lectura y escritura pública (ajustar según necesidades de seguridad)
CREATE POLICY "Allow public read player_locations"
ON public.player_locations
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public insert player_locations"
ON public.player_locations
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update player_locations"
ON public.player_locations
FOR UPDATE
TO public
USING (true);

