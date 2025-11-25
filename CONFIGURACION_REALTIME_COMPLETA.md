# 🚀 Configuración Completa de Realtime (Sin Socket.IO)

## 📋 Paso 1: Ejecutar las Políticas RLS en Supabase

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Copia y pega el contenido del archivo `POLITICAS_RLS_BOOSTERS.sql`
3. Ejecuta el script (botón "Run")
4. Verifica que las políticas se hayan creado:
   - Ve a **Authentication** → **Policies**
   - Selecciona la tabla `boosters_per_user`
   - Deberías ver 3 políticas: SELECT, INSERT, DELETE

## 📋 Paso 2: Habilitar Realtime en Supabase

1. Ve a **Supabase Dashboard** → **Database** → **Replication**
2. Busca la tabla `boosters_per_user`
3. **Activa el toggle** para habilitar Realtime
4. Asegúrate de que aparezca como **"Enabled"**

## 📋 Paso 3: Verificar Configuración en el Código

Ya está configurado en `app1/index.html` con tus credenciales:
- ✅ `SUPABASE_URL` configurado
- ✅ `SUPABASE_ANON_KEY` configurado
- ✅ Script de Supabase incluido

## 🎯 Cómo Funciona (Sin Socket.IO)

### Flujo de Compra:
1. Usuario compra un potenciador
2. Se hace `POST /users/:userId/boosters/purchase`
3. El servidor inserta una fila en `boosters_per_user`
4. **Supabase Realtime detecta el cambio automáticamente**
5. El frontend recibe la notificación en tiempo real
6. Se actualiza `memoryState.inventory`
7. La UI se actualiza automáticamente (sin recargar)

### Flujo de Uso:
1. Usuario usa un potenciador
2. Se hace `POST /users/:userId/boosters/consume`
3. El servidor elimina una fila de `boosters_per_user`
4. **Supabase Realtime detecta el cambio automáticamente**
5. El frontend recibe la notificación
6. Se actualiza la cantidad en la UI

## 🔍 Verificar que Funciona

### En la Consola del Navegador deberías ver:

**Al comprar:**
```
✅ Compra exitosa - Inventario actualizado: {...}
🔄 Cambio detectado en inventario: {event: 'INSERT', ...}
✅ Inventario actualizado desde Realtime: [...]
🔄 Actualizado Empanadirri: x1
```

**Al usar:**
```
🔄 Cambio detectado en inventario: {event: 'DELETE', ...}
✅ Inventario actualizado desde Realtime: [...]
🔄 Actualizado Empanadirri: x0
```

## ⚠️ Solución de Problemas

### ❌ "Supabase no está disponible"
- Verifica que el script de Supabase esté en `index.html`
- Verifica que las credenciales estén correctas

### ❌ "No se detectan cambios"
- Verifica que Realtime esté habilitado en `boosters_per_user`
- Verifica que las políticas RLS estén creadas
- Revisa la consola del navegador para errores

### ❌ "Las cantidades no se actualizan"
- Verifica que `memoryState.inventory` se esté actualizando (consola)
- Verifica que los nombres de los boosters coincidan exactamente
- Revisa los logs en la consola

## 📝 Notas Importantes

- **No se usa Socket.IO para el inventario**: Todo funciona con Supabase Realtime
- **La cantidad se calcula**: No hay campo `quantity`, se cuenta las filas
- **Actualización automática**: No necesitas recargar la página
- **Suscripciones se limpian**: Cuando sales de la tienda/juego, se cancelan automáticamente

## ✅ Checklist Final

- [ ] Políticas RLS creadas en Supabase
- [ ] Realtime habilitado en `boosters_per_user`
- [ ] Credenciales configuradas en `index.html`
- [ ] Script de Supabase incluido en `index.html`
- [ ] Probado comprando un potenciador
- [ ] Probado usando un potenciador
- [ ] Verificado en la consola que Realtime funciona


