-- ============================================
-- VERIFICAR Y CORREGIR room_pin
-- ============================================
-- Este script verifica el estado actual y corrige si es necesario

-- 1. Verificar el tipo actual de room_pin en admin_room
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'admin_room' 
    AND column_name = 'room_pin';

-- 2. Verificar el tipo actual de room_pin en players_room
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'players_room' 
    AND column_name = 'room_pin';

-- 3. Si room_pin es VARCHAR sin límite o TEXT, cambiarlo a VARCHAR(6)
-- Para admin_room
DO $$
BEGIN
    -- Si es VARCHAR sin límite o TEXT, cambiarlo a VARCHAR(6)
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_room' 
        AND column_name = 'room_pin' 
        AND (
            (data_type = 'character varying' AND character_maximum_length IS NULL)
            OR data_type = 'text'
        )
    ) THEN
        ALTER TABLE public.admin_room DROP CONSTRAINT IF EXISTS admin_room_room_pin_key;
        ALTER TABLE public.admin_room 
        ALTER COLUMN room_pin TYPE VARCHAR(6) USING SUBSTRING(room_pin::text, 1, 6);
        ALTER TABLE public.admin_room 
        ADD CONSTRAINT admin_room_room_pin_key UNIQUE (room_pin);
        RAISE NOTICE 'room_pin en admin_room cambiado a VARCHAR(6)';
    ELSIF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_room' 
        AND column_name = 'room_pin' 
        AND data_type = 'character varying' 
        AND character_maximum_length != 6
    ) THEN
        ALTER TABLE public.admin_room DROP CONSTRAINT IF EXISTS admin_room_room_pin_key;
        ALTER TABLE public.admin_room 
        ALTER COLUMN room_pin TYPE VARCHAR(6) USING SUBSTRING(room_pin::text, 1, 6);
        ALTER TABLE public.admin_room 
        ADD CONSTRAINT admin_room_room_pin_key UNIQUE (room_pin);
        RAISE NOTICE 'room_pin en admin_room cambiado a VARCHAR(6)';
    ELSE
        RAISE NOTICE 'room_pin en admin_room ya es VARCHAR(6) o no existe';
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
        AND (
            (data_type = 'character varying' AND character_maximum_length IS NULL)
            OR data_type = 'text'
            OR (data_type = 'character varying' AND character_maximum_length != 6)
        )
    ) THEN
        ALTER TABLE public.players_room 
        ALTER COLUMN room_pin TYPE VARCHAR(6) USING SUBSTRING(room_pin::text, 1, 6);
        RAISE NOTICE 'room_pin en players_room cambiado a VARCHAR(6)';
    ELSE
        RAISE NOTICE 'room_pin en players_room ya es VARCHAR(6) o no existe';
    END IF;
END $$;

-- 4. Verificar el resultado final
SELECT 
    'admin_room' as tabla,
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'admin_room' 
    AND column_name = 'room_pin'
UNION ALL
SELECT 
    'players_room' as tabla,
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'players_room' 
    AND column_name = 'room_pin';

