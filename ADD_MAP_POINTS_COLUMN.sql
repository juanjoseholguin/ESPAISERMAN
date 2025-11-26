-- ============================================
-- AGREGAR COLUMNA map_points A admin_room
-- ============================================
-- Este script agrega una columna JSONB para almacenar los puntos personalizados del mapa

-- Agregar columna map_points a admin_room
ALTER TABLE public.admin_room
  ADD COLUMN IF NOT EXISTS map_points JSONB DEFAULT NULL;

-- Comentario en la columna
COMMENT ON COLUMN public.admin_room.map_points IS 'Puntos personalizados del mapa en formato JSON: [{"name": "Edificio A", "coords": [3.3435, -76.533], "questionNumber": 1}, ...]';

-- Ejemplo de estructura JSON esperada:
-- [
--   {
--     "name": "Edificio A",
--     "coords": [3.3435, -76.533],
--     "questionNumber": 1
--   },
--   {
--     "name": "Biblioteca",
--     "coords": [3.3438, -76.5332],
--     "questionNumber": 2
--   },
--   ...
-- ]

