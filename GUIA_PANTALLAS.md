# Guía de Pantallas - Espaiserman Trivia

## 📱 APP 1 - Jugador (http://localhost:5050/app1)

### 1. **screen1.js - Login/Registro**
- **Función**: Pantalla de autenticación
- **Características**:
  - Login con email y contraseña desde Supabase
  - Registro de nuevos usuarios
  - Persistencia de sesión (localStorage)
  - Inicia con 1000 monedas
  - Guarda avatar y color de fondo
- **Siguiente**: Menu principal

### 2. **mainMenu.js - Menú Principal**
- **Función**: Hub principal del jugador
- **Características**:
  - "Unirme a una sala" → Unirse con código
  - "Crear una sala" → Redirige a app2
  - "Tienda" → Comprar items
  - "Perfil" → Editar datos
- **Siguiente**: Depende de la acción

### 3. **joinRoom.js - Unirse a Sala**
- **Función**: Ingresar código de sala
- **Características**:
  - Input para código de 6 caracteres
  - Validación de sala existente
  - Conexión Socket.IO
  - Muestra "Sala no existe" si no existe
- **Siguiente**: lobby.js si todo OK

### 4. **lobby.js - Lobby de Espera**
- **Función**: Sala de espera antes del juego
- **Características**:
  - Muestra código de sala
  - Lista de jugadores conectados
  - Filtra jugadores duplicados
  - Mensaje: "Esperando a que el moderador inicie la partida..."
  - NO muestra botón "Empezar partida"
- **Siguiente**: activeGame.js cuando el moderador inicia

### 5. **activeGame.js - Juego Activo**
- **Función**: Pantalla de juego para jugadores
- **Características**:
  - Muestra pregunta actual (1-5)
  - Timer (10s)
  - 4 opciones de respuesta (A, B, C, D)
  - Actualiza puntaje en tiempo real (+100 por correcta)
  - Navegación automática a la siguiente pregunta
- **Siguiente**: 
  - Siguiente pregunta (1-4)
  - gameResults.js (pregunta 5)

### 6. **gameResults.js - Resultados Finales**
- **Función**: Mostrar tabla de posiciones
- **Características**:
  - Lista ordenada por puntos
  - Primer lugar en rojo
  - Muestra nombre y puntaje
  - Botón "Volver al Menú"
- **Siguiente**: mainMenu.js

### 7. **shop.js - Tienda**
- **Función**: Comprar items con monedas
- **Características**:
  - Items disponibles con precios
  - Resta monedas al comprar
  - Actualiza localStorage
  - Regresa al menú
- **Siguiente**: mainMenu.js

### 8. **profileEdit.js - Editar Perfil**
- **Función**: Personalizar avatar y datos
- **Características**:
  - Seleccionar avatar
  - Elegir color de fondo
  - Ver monedas actuales
  - Botón "Cerrar sesión"
  - Botón "Guardar Cambios"
- **Siguiente**: mainMenu.js

---

## 🎮 APP 2 - Moderador (http://localhost:5050/app2)

### 1. **screen1.js - Login Moderador**
- **Función**: Autenticación del moderador
- **Características**:
  - Mismo sistema de login que app1
  - Redirige a crear sala
- **Siguiente**: createRoom.js

### 2. **createRoom.js - Crear Sala**
- **Función**: Configuración inicial de la partida
- **Características**:
  - Selecciona categoría (dropdown con Supabase)
  - Define número de participantes (2-20)
  - Tiempo por pregunta (10-60s)
  - Botón "Organizar preguntas"
- **Siguiente**: distributeQuestions.js

### 3. **distributeQuestions.js - Distribuir Preguntas**
- **Función**: Mapa del campus ICESI
- **Características**:
  - Mapa interactivo con Leaflet/OpenStreetMap
  - 5 marcadores fijos en puntos del campus:
    - Edificio A
    - Biblioteca
    - Cafetería
    - Auditorio
    - Laboratorios
  - Obtiene preguntas de Supabase por categoría
  - Limita a 5 preguntas (evita payload too large)
  - Botón "Crear sala" → genera código
- **Siguiente**: lobby.js (moderador)

### 4. **lobby.js - Lobby Moderador**
- **Función**: Vistazo previo a la partida
- **Características**:
  - Muestra código de sala (grande y visible)
  - Lista de jugadores conectados
  - NO filtra duplicados (los jugadores sí)
  - Botón "Empezar partida" (solo visible para moderador)
  - El moderador SÍ puede ver esta pantalla
- **Siguiente**: activeGame.js (moderador)

### 5. **activeGame.js - Juego Activo Moderador**
- **Función**: Monitoreo en tiempo real
- **Características**:
  - NO muestra las preguntas
  - NO tiene opciones de respuesta
  - Muestra "Pregunta 1 de 5"
  - Tabla de posiciones en tiempo real
  - Muestra puntajes actualizados
  - Botón "Finalizar Partida"
- **Siguiente**: gameResults.js

### 6. **gameResults.js - Resultados Finales Moderador**
- **Función**: Tabla final para moderador
- **Características**:
  - Muestra resultados de todos los jugadores
  - Ordenados por puntaje
  - Botón "Finalizar partida" → vuelve a crear sala
- **Siguiente**: createRoom.js

### 7. **profileEdit.js - Perfil Moderador**
- **Función**: Misma que app1
- **Características**: 
  - Editar avatar, color, nombre
  - Cerrar sesión
  - Regresar al menú
- **Siguiente**: createRoom.js

---

## 🔄 Flujo Completo

### Jugador (App1):
```
Login → Menu → Unirse a Sala → Lobby → Juego Activo (5 preguntas) → Resultados
                                     ↓
                                  Tienda / Perfil
```

### Moderador (App2):
```
Login → Crear Sala → Distribuir Preguntas → Lobby → Empezar Partida → 
Juego Activo (monitoreo) → Resultados → Crear Nueva Sala
```

---

## 🔧 Funcionalidades Técnicas

### Persistencia:
- `localStorage` guarda: nombre, monedas, avatar, color
- Sesión se mantiene al recargar
- Monedas persisten entre sesiones

### Socket.IO Events:
- `room:create` - Moderador crea sala
- `room:join` - Jugador se une
- `room:start` - Moderador inicia juego
- `room:started` - Jugadores reciben inicio
- `player:answer` - Jugador responde (actualiza score)
- `room:state` - Estado de la sala en tiempo real
- `room:final-results` - Resultados finales

### Supabase:
- Tabla `users` - Login/registro
- Tabla `questions` - Preguntas por categoría
- Tabla `question_category` - Categorías
- RLS: Habilitar acceso público a questions

---

## 🎯 Problemas Resueltos

1. ✅ Error 413 Payload Too Large - Configurado límite a 100MB
2. ✅ Duplicados en jugadores - Filtrado por ID
3. ✅ Preguntas no se filtran - Query por category_id
4. ✅ "Sala no existe" - Socket.IO validación
5. ✅ Moderador ve preguntas - Removidas opciones de respuesta
6. ✅ No avanzo preguntas - Navegación correcta implementada
7. ✅ Duplicado en resultados - Corregido HTML

---

## 📊 Estructura de Datos

### Room Object:
```javascript
{
  hostId: socket.id,
  players: [{ id, name, avatar_url, avatar_bg, score }],
  code: "H7VV83",
  category: "5",
  maxParticipants: 10,
  timePerQuestion: 30,
  questions: [Array de 5 preguntas]
}
```

### Question Object (Supabase):
```javascript
{
  id: 31,
  category_id: 5,
  question: "¿Cuál es la capital de Colombia?",
  answer: ["Bogotá", "Medellín", "Cali", "Barranquilla"],
  correct_answer: "Bogotá"
}
```

---

## 🚀 Cómo Usar

1. **Iniciar servidor**: `node index.js` (puerto 5050)
2. **Abrir app2**: http://localhost:5050/app2 (Moderador)
3. **Crear sala**: Configurar categoría, participantes, tiempo
4. **Distribuir**: Click en mapa y "Crear sala"
5. **Copiar código**: El código aparece en lobby
6. **Abrir app1**: http://localhost:5050/app1 (Jugadores)
7. **Unirse**: Ingresar código y unirse
8. **Iniciar**: Moderador da "Empezar partida"
9. **Jugar**: Jugadores responden 5 preguntas
10. **Resultados**: Se muestran al final

---

Listo! Todas las pantallas explicadas. Si necesitas detalles específicos, dímelo.

