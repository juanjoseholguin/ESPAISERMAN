-- ============================================
-- AGREGAR COLUMNAS TIMESTAMP A admin_room
-- ============================================
-- Este script agrega las columnas created_at y updated_at
-- que son necesarias para el funcionamiento correcto

-- Agregar created_at si no existe
ALTER TABLE public.admin_room
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Agregar updated_at si no existe
ALTER TABLE public.admin_room
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_admin_room_updated_at ON public.admin_room;
CREATE TRIGGER update_admin_room_updated_at
    BEFORE UPDATE ON public.admin_room
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar que las columnas existen
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'admin_room'
  AND column_name IN ('created_at', 'updated_at')
ORDER BY column_name;

