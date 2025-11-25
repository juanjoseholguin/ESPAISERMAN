-- ============================================
-- FIX: Cambiar tipo de room_pin de BIGINT a VARCHAR
-- ============================================
-- Este script corrige el error: "invalid input syntax for type bigint: "E8YBTZ""
-- El problema es que room_pin debe ser VARCHAR(6) para almacenar códigos como "E8YBTZ"

-- Para admin_room
DO $$
BEGIN
    -- Verificar si room_pin es BIGINT y cambiarlo a VARCHAR
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_room' 
        AND column_name = 'room_pin' 
        AND data_type = 'bigint'
    ) THEN
        -- Primero eliminar la restricción UNIQUE si existe
        ALTER TABLE public.admin_room DROP CONSTRAINT IF EXISTS admin_room_room_pin_key;
        
        -- Cambiar el tipo de dato
        ALTER TABLE public.admin_room 
        ALTER COLUMN room_pin TYPE VARCHAR(6) USING room_pin::text;
        
        -- Recrear la restricción UNIQUE
        ALTER TABLE public.admin_room 
        ADD CONSTRAINT admin_room_room_pin_key UNIQUE (room_pin);
        
        RAISE NOTICE 'Columna room_pin en admin_room cambiada de BIGINT a VARCHAR(6)';
    ELSE
        RAISE NOTICE 'Columna room_pin en admin_room ya es VARCHAR o no existe';
    END IF;
END $$;

-- Para players_room
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'players_room' 
        AND column_name = 'room_pin' 
        AND data_type = 'bigint'
    ) THEN
        ALTER TABLE public.players_room 
        ALTER COLUMN room_pin TYPE VARCHAR(6) USING room_pin::text;
        
        RAISE NOTICE 'Columna room_pin en players_room cambiada de BIGINT a VARCHAR(6)';
    ELSE
        RAISE NOTICE 'Columna room_pin en players_room ya es VARCHAR o no existe';
    END IF;
END $$;

-- ============================================
-- Verificación
-- ============================================
-- Verificar el tipo de dato actual
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name IN ('admin_room', 'players_room')
    AND column_name = 'room_pin';

