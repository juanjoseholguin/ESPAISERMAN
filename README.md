# Espaiserman Trivia App - Documentación Completa

## 📱 Descripción del Proyecto
Aplicación móvil de trivia con temática Spider-Man desarrollada en JavaScript vanilla, HTML y CSS. La aplicación incluye todas las pantallas necesarias para una experiencia completa de trivia interactiva.

## 🎯 Características Principales
- ✅ **14 Pantallas Completas** basadas en tus diseños específicos
- ✅ **Navegación Fluida** entre todas las pantallas
- ✅ **Diseño Responsive** optimizado para móviles
- ✅ **Efectos Visuales** y animaciones atractivas
- ✅ **Sistema de Usuario** con registro y login
- ✅ **Tienda de Potenciadores** funcional
- ✅ **Simulación de Juego** completa
- ✅ **Código Limpio** y fácil de entender

## 📁 Estructura del Proyecto
```
espaiserman-app/
├── index.html              # Archivo principal HTML
├── README.md               # Documentación principal
├── css/
│   ├── main.css            # Estilos principales y base
│   └── login.css           # Estilos específicos por pantalla
├── js/
│   └── main.js             # Lógica principal de la aplicación
└── assets/
    ├── README.md           # Documentación de assets
    └── images/              # Carpeta para imágenes
        ├── fondo-amarillo.png
        ├── espaiserman-logo.png
        ├── espaiserman-character.png
        └── ... (todas las imágenes necesarias)
```

## 🖥️ Pantallas Implementadas

### 1. **Login** (`login-screen`)
- Formulario de inicio de sesión
- Validación de campos
- Navegación a registro

### 2. **Register** (`register-screen`)
- Formulario de registro
- Validación de contraseñas
- Navegación a login

### 3. **Carga Inicial** (`loading-screen`)
- Animación de carga
- Logo principal
- Transición automática

### 4. **Menú Principal** (`main-menu-screen`)
- Botones de navegación
- Acceso a todas las funciones
- Logo del juego

### 5. **Perfil** (`profile-screen`)
- Información del usuario
- Estadísticas de juego
- Personaje Espaiserman

### 6. **Tienda** (`shop-screen`)
- Potenciadores disponibles
- Sistema de compra
- Precios en monedas

### 7. **Crear Sala** (`create-room-screen`)
- Configuración de sala
- Número de jugadores
- Dificultad del juego

### 8. **Unirse a Sala** (`join-room-screen`)
- Escaneo de QR
- Ingreso de código
- Opciones de conexión

### 9. **Lectura QR** (`qr-screen`)
- Simulador de escáner QR
- Interfaz de cámara
- Detección automática
### 10. **Distribuir Preguntas** (`distribute-questions-screen`)
- Configuración de preguntas
- Categorías disponibles
- Cantidad de preguntas

### 11. **Respuesta Correcta** (`correct-answer-screen`)
- Feedback positivo
- Puntos ganados
- Animación de éxito

### 12. **Fin de Partida** (`game-over-screen`)
- Estadísticas finales
- Puntuación total
- Opciones de reinicio

### 13. **Potenciador** (`power-up-screen`)
- Efectos especiales
- Duración del poder
- Animaciones atractivas

### 14. **Mapa de Moderador** (`moderator-map-screen`)
- Control del juego
- Ubicación de jugadores
- Botones de moderación

## 🚀 Cómo Usar la Aplicación

### Instalación
1. Descarga todos los archivos
2. Coloca las imágenes en la carpeta `assets/images/`
3. Abre `index.html` en tu navegador

### Navegación
- **Login/Register**: Pantallas de autenticación
- **Menú Principal**: Centro de navegación
- **Juego**: Flujo completo de trivia
- **Perfil**: Información del usuario
- **Tienda**: Comprar potenciadores

## 🎨 Personalización

### Colores Principales
- **Rojo Principal**: `#FF4444`
- **Rojo Secundario**: `#CC3333`
- **Fondo**: Amarillo con puntos
- **Texto**: `#333` (gris oscuro)
- **Blanco**: `#FFFFFF`

### Fuentes
- **Principal**: Arial, sans-serif
- **Tamaños**: 16px base, escalable

### Animaciones
- **Bounce**: Para respuestas correctas
- **Pulse**: Para potenciadores
- **Spin**: Para carga
- **FadeIn**: Para transiciones

## 🔧 Funcionalidades Técnicas

### Sistema de Navegación
```javascript
showScreen(screenId) // Cambiar pantalla
handleScreenEffects(screenId) // Efectos especiales
```

### Gestión de Usuario
```javascript
saveUserData() // Guardar datos
loadUserData() // Cargar datos
updateUserStats() // Actualizar estadísticas
```

### Simulación de Juego
```javascript
handleCreateRoom() // Crear sala
handleJoinRoom() // Unirse a sala
handleGenerateQuestions() // Generar preguntas
```

## 📱 Responsive Design

### Breakpoints
- **Desktop**: > 768px
- **Tablet**: 768px - 480px
- **Mobile**: < 480px

### Adaptaciones
- Botones más grandes en móvil
- Texto escalable
- Layout flexible
- Imágenes responsivas

## 🎯 Próximas Implementaciones

### Funcionalidades Avanzadas
- [ ] Integración con API de IA para preguntas
- [ ] Integración con API de mapas
- [ ] Base de datos real
- [ ] Multiplayer en tiempo real
- [ ] Sistema de notificaciones
- [ ] Modo offline

### Mejoras Técnicas
- [ ] Service Workers para PWA
- [ ] Optimización de rendimiento
- [ ] Testing automatizado
- [ ] CI/CD pipeline

## 🐛 Solución de Problemas

### Problemas Comunes
1. **Imágenes no cargan**: Verificar rutas en `assets/images/`
2. **Navegación no funciona**: Verificar que `main.js` esté cargado
3. **Estilos no aplican**: Verificar que `main.css` esté cargado

### Debug
- Usar `console.log()` para debugging
- Verificar errores en DevTools
- Comprobar que todos los archivos estén presentes

## 📞 Soporte

Para cualquier problema o pregunta sobre la aplicación, revisa:
1. Esta documentación
2. Los comentarios en el código
3. La estructura de archivos
4. Los logs de la consola del navegador

---

**Desarrollado con ❤️ para Espaiserman Trivia**