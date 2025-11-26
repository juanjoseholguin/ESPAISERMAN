# 📋 Instrucciones para Configurar Supabase Realtime

## 🎯 Objetivo
Configurar Supabase Realtime para que el inventario de potenciadores se actualice automáticamente cuando compres o uses uno, sin necesidad de recargar la página.

## ✅ Pasos a Seguir

### 1. Obtener las Credenciales de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Settings** → **API**
3. Copia estos valores:
   - **Project URL** (ejemplo: `https://xxxxx.supabase.co`)
   - **anon/public key** (la clave que empieza con `eyJ...`)

### 2. Configurar en el Código

#### En `app1/index.html` (líneas 19-22):

```html
<script>
  // REEMPLAZA ESTOS VALORES con los de tu proyecto Supabase
  window.SUPABASE_URL = 'https://tu-proyecto.supabase.co'; // ← Pega tu Project URL aquí
  window.SUPABASE_ANON_KEY = 'tu-anon-key-aqui'; // ← Pega tu anon key aquí
</script>
```

**Ejemplo real:**
```html
<script>
  window.SUPABASE_URL = 'https://abcdefghijklmnop.supabase.co';
  window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI4MCwiZXhwIjoxOTU0NTQzMjgwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
</script>
```

### 3. Habilitar Realtime en Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Ve a **Database** → **Replication**
3. Busca la tabla `boosters_per_user`
4. **Activa el toggle** para habilitar Realtime en esa tabla
5. Asegúrate de que esté marcado como **Enabled**

### 4. Configurar Políticas RLS (Row Level Security)

Para que Realtime funcione, necesitas permitir que los usuarios lean sus propios datos:

1. Ve a **Authentication** → **Policies**
2. Selecciona la tabla `boosters_per_user`
3. Crea una política nueva:
   - **Policy name**: `Users can read their own boosters`
   - **Allowed operation**: `SELECT`
   - **Policy definition**: 
     ```sql
     (auth.uid()::text = user_id::text)
     ```
   - O si no usas auth.uid(), usa:
     ```sql
     (true)  -- Permite lectura pública (solo para desarrollo)
     ```

### 5. Verificar que Funciona

1. Abre la consola del navegador (F12)
2. Ve a la tienda y compra un potenciador
3. Deberías ver en la consola:
   ```
   🔄 Cambio detectado en inventario: {...}
   ✅ Inventario actualizado desde Realtime: [...]
   ```
4. El contador "x0" debería cambiar a "x1" automáticamente

## 🔧 Solución de Problemas

### ❌ "Supabase no está disponible"
- Verifica que agregaste el script de Supabase en `index.html`
- Verifica que las variables `SUPABASE_URL` y `SUPABASE_ANON_KEY` estén definidas

### ❌ "Realtime no funciona"
- Verifica que Realtime esté habilitado en la tabla `boosters_per_user`
- Verifica las políticas RLS
- Revisa la consola del navegador para ver errores

### ❌ "No se actualiza el inventario"
- Verifica que el `user_id` en la tabla coincida con el `currentUserId`
- Verifica que la suscripción se haya creado correctamente (debería aparecer en la consola)

## 📝 Notas Importantes

- **No hay campo `quantity` en la tabla**: La cantidad se calcula contando las filas en `boosters_per_user` para cada `booster_id` y `user_id`
- **Realtime se suscribe automáticamente**: Cuando entras a la tienda o al juego, se crea una suscripción que escucha cambios
- **Se limpia automáticamente**: Cuando sales de la tienda o del juego, la suscripción se cancela

## 🎉 ¡Listo!

Una vez configurado, el inventario se actualizará automáticamente en tiempo real cuando:
- Compres un potenciador
- Uses un potenciador
- Cualquier cambio ocurra en la tabla `boosters_per_user`


