# 📋 Instrucciones para Habilitar Realtime en Supabase

## 🎯 Objetivo
Habilitar Supabase Realtime en las tablas necesarias para que la aplicación funcione completamente sin Socket.IO.

## ✅ Pasos a Seguir

### 1. Ejecutar el Script SQL

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Copia y pega el contenido del archivo `MIGRACION_REALTIME.sql`
4. Ejecuta el script (botón "Run")
5. Verifica que no haya errores

### 2. Habilitar Realtime en las Tablas

1. Ve a **Supabase Dashboard** → **Database** → **Replication**
2. Busca cada una de estas tablas y **activa el toggle** para habilitar Realtime:
   - ✅ `users`
   - ✅ `admin_room`
   - ✅ `players_room`
   - ✅ `boosters_per_user` (ya debería estar habilitado)

3. Asegúrate de que todas aparezcan como **"Enabled"**

### 3. Verificar Políticas RLS

1. Ve a **Authentication** → **Policies**
2. Verifica que existan las siguientes políticas:

#### Para `admin_room`:
- "Anyone can read active rooms" (SELECT)
- "Users can create rooms" (INSERT)
- "Room creator can update room" (UPDATE)

#### Para `players_room`:
- "Anyone can read players in rooms" (SELECT)
- "Anyone can join a room" (INSERT)
- "Players can update their info" (UPDATE)
- "Players can leave room" (DELETE)

### 4. Verificar que Funciona

1. Abre la consola del navegador (F12)
2. Crea una sala desde app2
3. Únete a la sala desde app1
4. Deberías ver en la consola:
   ```
   🔄 Cambio en players_room: {...}
   🔄 Cambio en admin_room: {...}
   ```

## ⚠️ Solución de Problemas

### ❌ "Realtime no funciona"
- Verifica que Realtime esté habilitado en todas las tablas
- Verifica que las políticas RLS estén creadas
- Revisa la consola del navegador para errores

### ❌ "No se actualizan los jugadores en tiempo real"
- Verifica que la suscripción se haya creado correctamente (debería aparecer en la consola)
- Verifica que el `room_pin` coincida exactamente

### ❌ "Error al crear/unión a sala"
- Verifica que las tablas `admin_room` y `players_room` existan
- Verifica que las columnas estén correctamente definidas
- Revisa los logs del servidor

## 📝 Notas Importantes

- **Socket.IO todavía está en el código**: Se puede mantener para compatibilidad, pero ya no se usa para rooms
- **Realtime se suscribe automáticamente**: Cuando entras a un lobby, se crea una suscripción que escucha cambios
- **Se limpia automáticamente**: Cuando sales del lobby, la suscripción se cancela
- **Los scores se actualizan en tiempo real**: Cuando un jugador responde correctamente, todos los demás ven el cambio

## ✅ Checklist Final

- [ ] Script SQL ejecutado sin errores
- [ ] Realtime habilitado en `users`
- [ ] Realtime habilitado en `admin_room`
- [ ] Realtime habilitado en `players_room`
- [ ] Realtime habilitado en `boosters_per_user`
- [ ] Políticas RLS creadas y verificadas
- [ ] Probado crear una sala
- [ ] Probado unirse a una sala
- [ ] Verificado en la consola que Realtime funciona
- [ ] Probado actualizar score en tiempo real

## 🎉 ¡Listo!

Una vez configurado, toda la aplicación funcionará con Supabase Realtime:
- ✅ Crear salas
- ✅ Unirse a salas
- ✅ Ver jugadores en tiempo real
- ✅ Actualizar scores en tiempo real
- ✅ Iniciar partidas
- ✅ Ver resultados

