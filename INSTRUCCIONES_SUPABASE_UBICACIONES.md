# 📍 Instrucciones Paso a Paso: Configurar Ubicaciones en Supabase

## Paso 1: Crear la Tabla `player_locations`

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. En el menú lateral izquierdo, haz clic en **"SQL Editor"** (ícono de base de datos con lápiz)
3. Haz clic en **"New query"** (botón verde arriba a la derecha)
4. Copia y pega este código SQL:

```sql
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
```

5. Haz clic en **"Run"** (botón verde) o presiona `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
6. Deberías ver un mensaje de éxito: "Success. No rows returned"

---

## Paso 2: Habilitar Realtime para la Tabla

1. En el menú lateral izquierdo, haz clic en **"Database"**
2. Haz clic en **"Replication"** (submenú dentro de Database)
3. Busca la tabla `player_locations` en la lista
4. Si NO aparece en la lista, haz clic en el botón **"Enable"** o el toggle switch junto a `player_locations`
5. Deberías ver un checkmark verde ✅ o el toggle activado

**Si la tabla no aparece en Replication:**
- Ve al **SQL Editor** de nuevo
- Ejecuta este comando:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_locations;
```

---

## Paso 3: Configurar Políticas RLS (Row Level Security)

1. En el menú lateral, haz clic en **"Table Editor"**
2. Busca y haz clic en la tabla `player_locations`
3. Haz clic en el botón **"RLS policies"** (arriba a la derecha, junto a "Insert")
4. Verifica que **"Enable RLS"** esté activado (toggle verde)

### Crear Política para SELECT (Leer):

1. Haz clic en **"New policy"** o **"Add policy"**
2. Selecciona **"Create a policy from scratch"**
3. Configura así:
   - **Policy name:** `Allow public read player_locations`
   - **Allowed operation:** `SELECT`
   - **Target roles:** `public`
   - **USING expression:** `true`
   - **WITH CHECK expression:** (dejar vacío)
4. Haz clic en **"Review"** y luego **"Save policy"**

### Crear Política para INSERT (Insertar):

1. Haz clic en **"New policy"** de nuevo
2. Selecciona **"Create a policy from scratch"**
3. Configura así:
   - **Policy name:** `Allow public insert player_locations`
   - **Allowed operation:** `INSERT`
   - **Target roles:** `public`
   - **USING expression:** (dejar vacío)
   - **WITH CHECK expression:** `true`
4. Haz clic en **"Review"** y luego **"Save policy"**

### Crear Política para UPDATE (Actualizar):

1. Haz clic en **"New policy"** de nuevo
2. Selecciona **"Create a policy from scratch"**
3. Configura así:
   - **Policy name:** `Allow public update player_locations`
   - **Allowed operation:** `UPDATE`
   - **Target roles:** `public`
   - **USING expression:** `true`
   - **WITH CHECK expression:** `true`
4. Haz clic en **"Review"** y luego **"Save policy"**

---

## Paso 4: Verificar que Todo Esté Correcto

### Verificar la Tabla:
1. Ve a **"Table Editor"** → `player_locations`
2. Deberías ver las columnas: `id`, `room_code`, `player_name`, `latitude`, `longitude`, `updated_at`
3. Si hay datos, deberías ver filas con ubicaciones de jugadores

### Verificar Realtime:
1. Ve a **"Database"** → **"Replication"**
2. `player_locations` debe aparecer con un checkmark verde ✅

### Verificar Políticas RLS:
1. Ve a **"Table Editor"** → `player_locations` → **"RLS policies"**
2. Deberías ver 3 políticas:
   - `Allow public read player_locations` (SELECT)
   - `Allow public insert player_locations` (INSERT)
   - `Allow public update player_locations` (UPDATE)

---

## Paso 5: Probar que Funciona

1. Abre tu app en el celular (App1)
2. Únete a una sala
3. Cuando aparezca la pantalla intermedia, presiona **"📍 Activar Ubicación"**
4. Permite el acceso a la ubicación cuando el navegador lo solicite
5. Ve a Supabase → **"Table Editor"** → `player_locations`
6. Deberías ver una nueva fila con:
   - `room_code`: El código de tu sala
   - `player_name`: Tu nombre de jugador
   - `latitude` y `longitude`: Tus coordenadas
   - `updated_at`: La fecha/hora actual

Si ves la fila en Supabase, ¡está funcionando! 🎉

---

## ⚠️ Solución de Problemas

### Si no aparece la tabla en Replication:
Ejecuta en SQL Editor:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_locations;
```

### Si las políticas no funcionan:
Ejecuta en SQL Editor (esto elimina y recrea las políticas):
```sql
-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow public read player_locations" ON public.player_locations;
DROP POLICY IF EXISTS "Allow public insert player_locations" ON public.player_locations;
DROP POLICY IF EXISTS "Allow public update player_locations" ON public.player_locations;

-- Crear políticas nuevas
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
USING (true) WITH CHECK (true);
```

### Si la tabla ya existe pero no tiene la estructura correcta:
Ejecuta en SQL Editor:
```sql
-- Agregar columnas faltantes
ALTER TABLE public.player_locations
  ADD COLUMN IF NOT EXISTS room_code TEXT,
  ADD COLUMN IF NOT EXISTS player_name TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Agregar constraint único si no existe
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
```

