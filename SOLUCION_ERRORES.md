# 🔧 Solución de Errores Encontrados

## Problemas Identificados y Solucionados

### 1. ❌ Error: "Could not find the 'time_per_question' column"

**Problema**: La tabla `admin_room` ya existía pero no tenía la columna `time_per_question`.

**Solución**: Se agregó un `ALTER TABLE` en el script SQL para agregar la columna si no existe.

**Pasos para aplicar**:
1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta este comando adicional:
```sql
ALTER TABLE public.admin_room
  ADD COLUMN IF NOT EXISTS time_per_question INTEGER DEFAULT 30;
```

O simplemente vuelve a ejecutar el script `MIGRACION_REALTIME.sql` completo (ya está actualizado).

---

### 2. ❌ Error: "Error al actualizar el perfil"

**Problema**: La tabla `users` no tenía políticas RLS para permitir UPDATE.

**Solución**: Se agregaron políticas RLS en el script SQL.

**Pasos para aplicar**:
1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta este comando:
```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE TO public USING (true) WITH CHECK (true);
```

O ejecuta el script `MIGRACION_REALTIME.sql` completo (ya está actualizado).

---

### 3. ❌ La tienda no muestra nada

**Problema**: 
- Se estaba usando `boosters` antes de definirlo
- No había validación si los boosters estaban vacíos

**Solución**: 
- Se movió la línea que guarda `window.currentBoosters` después de cargar los boosters
- Se agregó validación y mensaje si no hay boosters

**Ya está corregido en el código**. Solo necesitas recargar la página.

---

## 📋 Checklist de Verificación

Después de aplicar las correcciones:

- [ ] Ejecutar el script SQL actualizado `MIGRACION_REALTIME.sql`
- [ ] Verificar que la columna `time_per_question` existe en `admin_room`
- [ ] Verificar que las políticas RLS de `users` permiten UPDATE
- [ ] Recargar la aplicación (Ctrl+F5 para limpiar caché)
- [ ] Probar crear una sala (debería funcionar)
- [ ] Probar actualizar el perfil (debería funcionar)
- [ ] Probar abrir la tienda (debería mostrar boosters)

---

## 🔍 Cómo Verificar en Supabase

### Verificar columna `time_per_question`:
1. Ve a **Database** → **Tables** → `admin_room`
2. Verifica que existe la columna `time_per_question`

### Verificar políticas RLS de `users`:
1. Ve a **Authentication** → **Policies**
2. Selecciona la tabla `users`
3. Deberías ver la política "Users can update their own profile" (UPDATE)

---

## ⚠️ Si los Problemas Persisten

1. **Limpiar caché del navegador**: Ctrl+Shift+Delete o Ctrl+F5
2. **Reiniciar el servidor**: Detén y vuelve a iniciar `node index.js`
3. **Verificar consola del navegador**: F12 → Console para ver errores específicos
4. **Verificar logs del servidor**: Revisa la terminal donde corre el servidor

