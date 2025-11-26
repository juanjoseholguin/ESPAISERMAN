# 📋 Explicación sobre `room_pin`

## ¿Qué tipo de dato es `room_pin`?

**`room_pin` debe ser VARCHAR(6)** - es un **STRING** (texto) de máximo 6 caracteres.

**Ejemplos de códigos válidos:**
- `"HT6WWR"`
- `"E8YBTZ"`
- `"ABC123"`
- `"XYZ789"`

**NO es un número** - no puede ser BIGINT, INTEGER, etc., porque contiene letras.

---

## ¿Dónde está el `room_pin`?

### 1. **En la Base de Datos (Supabase)**

El `room_pin` se almacena en **dos tablas**:

#### Tabla `admin_room`:
```sql
CREATE TABLE admin_room (
    id BIGSERIAL PRIMARY KEY,
    room_pin VARCHAR(6) NOT NULL UNIQUE,  -- ← AQUÍ está el código de la sala
    admin_user_id BIGINT,
    room_status BOOLEAN,
    ...
);
```

#### Tabla `players_room`:
```sql
CREATE TABLE players_room (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT,                      -- ← Referencia al ID de admin_room
    room_pin VARCHAR(6) NOT NULL,        -- ← AQUÍ también (para búsquedas rápidas)
    user_id BIGINT,
    player_name TEXT,
    ...
);
```

**¿Por qué está en ambas tablas?**
- En `admin_room`: Es el identificador único de la sala (UNIQUE)
- En `players_room`: Permite buscar rápidamente todos los jugadores de una sala sin hacer JOIN

---

### 2. **Dónde se Genera el `room_pin`**

El código se genera en el **servidor** cuando se crea una sala:

**Archivo:** `server/db/rooms.db.js`

```javascript
// Función que genera el código
function generateRoomCode() {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;  // Retorna un string como "HT6WWR"
}

// Se usa cuando se crea una sala
async function createRoom(adminUserId, categoryId, maxParticipants, timePerQuestion) {
  const roomPin = generateRoomCode();  // ← Se genera aquí
  
  await supabase
    .from('admin_room')
    .insert({
      room_pin: roomPin,  // ← Se guarda en la base de datos
      ...
    });
}
```

---

### 3. **Cómo se Usa el `room_pin`**

#### En el Frontend:
- El usuario ingresa el código en el input (ej: "HT6WWR")
- Se envía al servidor para unirse a la sala

#### En el Backend:
- Se busca la sala por `room_pin` en `admin_room`
- Se buscan los jugadores por `room_pin` en `players_room`
- Se usa en todas las operaciones de sala (unirse, iniciar, actualizar scores, etc.)

---

## 🔍 Verificar el Tipo de Dato en Supabase

Para verificar que `room_pin` es VARCHAR y no BIGINT:

1. Ve a **Supabase Dashboard** → **Table Editor** → `admin_room`
2. Haz clic en la columna `room_pin`
3. Debería mostrar: **Type: `varchar(6)`** o **Type: `character varying(6)`**

Si muestra **Type: `bigint`**, entonces necesitas ejecutar el script `FIX_ROOM_PIN_TYPE.sql`.

---

## ✅ Resumen

| Aspecto | Detalle |
|---------|---------|
| **Tipo de dato** | `VARCHAR(6)` (STRING, no número) |
| **Longitud** | 6 caracteres |
| **Formato** | Letras mayúsculas y números (sin I, L, O, 0, 1) |
| **Dónde se genera** | `server/db/rooms.db.js` → función `generateRoomCode()` |
| **Dónde se almacena** | Tabla `admin_room` (columna `room_pin`) |
| **También se usa en** | Tabla `players_room` (columna `room_pin`) |
| **Ejemplo** | `"HT6WWR"`, `"E8YBTZ"`, `"ABC123"` |

---

## ⚠️ Si Tienes Errores

Si ves errores como:
- `"invalid input syntax for type bigint: "E8YBTZ""`
- `"Could not find the 'room_pin' column"`

**Solución:**
1. Ejecuta `FIX_ROOM_PIN_TYPE.sql` en Supabase SQL Editor
2. O ejecuta `MIGRACION_REALTIME.sql` completo (ya incluye el fix)

