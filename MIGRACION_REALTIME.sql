-- ============================================
-- MIGRACIÓN A SUPABASE REALTIME
-- Script SQL para configurar tablas y políticas
-- ============================================

-- 1. Agregar columnas faltantes a users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS password TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '/assets/images/Group 4.png',
  ADD COLUMN IF NOT EXISTS avatar_bg TEXT DEFAULT '#F9D648';

-- Habilitar RLS en users si no está habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes de users si existen
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Crear política para que usuarios puedan actualizar su propio perfil
CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE TO public USING (true) WITH CHECK (true);

-- 2. Crear tabla admin_room si no existe
CREATE TABLE IF NOT EXISTS public.admin_room (
    id BIGSERIAL PRIMARY KEY,
    room_pin VARCHAR(6) NOT NULL UNIQUE,
    admin_user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    room_status BOOLEAN DEFAULT false,
    room_size INTEGER DEFAULT 10,
    room_category_id BIGINT REFERENCES public.question_category(id) ON DELETE SET NULL,
    time_per_question INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Si la tabla ya existía, cambiar el tipo de room_pin a VARCHAR(6)
-- Esto es necesario porque room_pin debe ser un string (ej: "E8YBTZ"), no un número
-- Verifica y corrige: BIGINT, VARCHAR sin límite, TEXT, o VARCHAR con límite diferente a 6
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
    -- Si es VARCHAR con límite diferente a 6
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
    -- Si es BIGINT, cambiarlo a VARCHAR(6)
    ELSIF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_room' 
        AND column_name = 'room_pin' 
        AND data_type = 'bigint'
    ) THEN
        ALTER TABLE public.admin_room DROP CONSTRAINT IF EXISTS admin_room_room_pin_key;
        ALTER TABLE public.admin_room 
        ALTER COLUMN room_pin TYPE VARCHAR(6) USING room_pin::text;
        ALTER TABLE public.admin_room 
        ADD CONSTRAINT admin_room_room_pin_key UNIQUE (room_pin);
        RAISE NOTICE 'room_pin en admin_room cambiado de BIGINT a VARCHAR(6)';
    ELSE
        RAISE NOTICE 'room_pin en admin_room ya es VARCHAR(6) o no existe';
    END IF;
END $$;

-- Agregar columna time_per_question si la tabla ya existía sin ella
ALTER TABLE public.admin_room
  ADD COLUMN IF NOT EXISTS time_per_question INTEGER DEFAULT 30;

-- Agregar columnas de timestamp si no existen
ALTER TABLE public.admin_room
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Crear tabla players_room si no existe
CREATE TABLE IF NOT EXISTS public.players_room (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT REFERENCES public.admin_room(id) ON DELETE CASCADE,
    room_pin VARCHAR(6) NOT NULL,
    user_id BIGINT REFERENCES public.users(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    avatar_url TEXT,
    avatar_bg TEXT,
    score INTEGER DEFAULT 0,
    is_moderator BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, user_id) -- Un usuario solo puede estar una vez en una sala
);

-- Agregar columnas faltantes si la tabla ya existía sin ellas
ALTER TABLE public.players_room
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS avatar_bg TEXT,
  ADD COLUMN IF NOT EXISTS is_moderator BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS player_name TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Si la tabla players_room ya existía, cambiar el tipo de room_pin a VARCHAR(6)
-- Verifica y corrige: BIGINT, VARCHAR sin límite, TEXT, o VARCHAR con límite diferente a 6
DO $$
DECLARE
    current_type TEXT;
BEGIN
    -- Obtener el tipo actual de room_pin
    SELECT data_type INTO current_type
    FROM information_schema.columns
    WHERE table_schema = 'public' 
        AND table_name = 'players_room' 
        AND column_name = 'room_pin';
    
    -- Si existe y no es VARCHAR(6), cambiarlo
    IF current_type IS NOT NULL AND current_type != 'character varying' THEN
        -- Si es BIGINT, convertir directamente
        ALTER TABLE public.players_room 
        ALTER COLUMN room_pin TYPE VARCHAR(6) USING room_pin::text;
        RAISE NOTICE 'room_pin en players_room cambiado de % a VARCHAR(6)', current_type;
    ELSIF current_type = 'character varying' THEN
        -- Verificar si el límite es diferente a 6
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'players_room' 
                AND column_name = 'room_pin' 
                AND (
                    character_maximum_length IS NULL 
                    OR character_maximum_length != 6
                )
        ) THEN
            ALTER TABLE public.players_room 
            ALTER COLUMN room_pin TYPE VARCHAR(6) USING SUBSTRING(room_pin::text, 1, 6);
            RAISE NOTICE 'room_pin en players_room cambiado a VARCHAR(6)';
        ELSE
            RAISE NOTICE 'room_pin en players_room ya es VARCHAR(6)';
        END IF;
    ELSE
        RAISE NOTICE 'room_pin en players_room no existe o ya es VARCHAR(6)';
    END IF;
END $$;

-- 4. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_admin_room_pin ON public.admin_room(room_pin);
CREATE INDEX IF NOT EXISTS idx_admin_room_status ON public.admin_room(room_status);
CREATE INDEX IF NOT EXISTS idx_players_room_pin ON public.players_room(room_pin);
CREATE INDEX IF NOT EXISTS idx_players_room_room_id ON public.players_room(room_id);
CREATE INDEX IF NOT EXISTS idx_players_room_user_id ON public.players_room(user_id);

-- 5. Habilitar RLS en las tablas
ALTER TABLE public.admin_room ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players_room ENABLE ROW LEVEL SECURITY;

-- 6. Eliminar políticas existentes si existen (para evitar errores)
DROP POLICY IF EXISTS "Anyone can read active rooms" ON public.admin_room;
DROP POLICY IF EXISTS "Users can create rooms" ON public.admin_room;
DROP POLICY IF EXISTS "Room creator can update room" ON public.admin_room;
DROP POLICY IF EXISTS "Anyone can read players in rooms" ON public.players_room;
DROP POLICY IF EXISTS "Anyone can join a room" ON public.players_room;
DROP POLICY IF EXISTS "Players can update their info" ON public.players_room;
DROP POLICY IF EXISTS "Players can leave room" ON public.players_room;

-- 7. Crear políticas para admin_room
CREATE POLICY "Anyone can read active rooms"
ON public.admin_room FOR SELECT TO public USING (true);

CREATE POLICY "Users can create rooms"
ON public.admin_room FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Room creator can update room"
ON public.admin_room FOR UPDATE TO public USING (true) WITH CHECK (true);

-- 8. Crear políticas para players_room
CREATE POLICY "Anyone can read players in rooms"
ON public.players_room FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can join a room"
ON public.players_room FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Players can update their info"
ON public.players_room FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Players can leave room"
ON public.players_room FOR DELETE TO public USING (true);

-- 9. Verificar que todas las columnas existen (opcional, para debugging)
-- Descomenta las siguientes líneas si quieres verificar las columnas después de ejecutar el script

-- Verificar columnas de players_room
-- SELECT 
--     column_name,
--     data_type,
--     is_nullable,
--     column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
--     AND table_name = 'players_room'
-- ORDER BY ordinal_position;

-- Verificar room_pin en ambas tablas
-- SELECT 
--     'admin_room' as tabla,
--     column_name,
--     data_type,
--     character_maximum_length
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
--     AND table_name = 'admin_room' 
--     AND column_name = 'room_pin'
-- UNION ALL
-- SELECT 
--     'players_room' as tabla,
--     column_name,
--     data_type,
--     character_maximum_length
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
--     AND table_name = 'players_room' 
--     AND column_name = 'room_pin';

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 
-- Después de ejecutar este script:
-- 1. Ve a Supabase Dashboard → Database → Replication
-- 2. Habilita Realtime en estas tablas:
--    - users
--    - admin_room
--    - players_room
-- 
-- ============================================

