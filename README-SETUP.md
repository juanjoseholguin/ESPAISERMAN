# Espaiserman Trivia - Configuración Completa

## ✅ Estado del Proyecto
- ✅ Servidor configurado y funcionando en puerto 5050
- ✅ Supabase integrado con tu base de datos
- ✅ 3 pantallas funcionando: Splash, Login, Register
- ✅ Navegación entre pantallas con botones de retroceso
- ✅ CORS configurado para evitar errores de conexión

## 🚀 Cómo usar el proyecto

### Opción 1: Con Supabase (Recomendado)
```bash
npm start
```
Esto ejecutará `index.js` que usa tu base de datos de Supabase.

### Opción 2: Sin Supabase (Base de datos local)
```bash
npm run start-simple
```
Esto ejecutará `index-simple.js` que usa una base de datos local simple.

## 🌐 URLs del proyecto

- **Servidor principal**: http://localhost:5050
- **App 1 (Login/Register)**: http://localhost:5050/app1
- **App 2 (Pantallas adicionales)**: http://localhost:5050/app2
- **API de usuarios**: http://localhost:5050/users

## 📱 Funcionalidades implementadas

### App 1 - Pantalla de Login/Register
1. **Pantalla Splash**: Pantalla inicial con botones "Registrarse" e "Iniciar Sesión"
2. **Pantalla Login**: Formulario de inicio de sesión con validación
3. **Pantalla Register**: Formulario de registro con validación de contraseñas
4. **Navegación**: Botones de retroceso que regresan a la pantalla splash

### Base de datos
- **Con Supabase**: Se conecta a tu base de datos `Espaiserman_app`
- **Sin Supabase**: Usa una base de datos local en memoria

## 🔧 Configuración de Supabase

El archivo `.env` ya está configurado con tus credenciales:
```
SUPABASE_URL=https://zdqqueneqkltmoknqvhe.supabase.co
SUPABASE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Esquema de base de datos utilizado

El proyecto está configurado para usar las siguientes tablas de tu esquema:
- `users` - Para almacenar usuarios registrados
- Campos utilizados: `username`, `email`, `espaiser-coin`

## 🎯 Próximos pasos

1. **Probar la aplicación**: Ve a http://localhost:5050/app1
2. **Registrar un usuario**: Usa el formulario de registro
3. **Iniciar sesión**: Usa el formulario de login
4. **Verificar en Supabase**: Revisa que los usuarios se guarden en tu base de datos

## 🐛 Solución de problemas

### Error "ERR_CONNECTION_REFUSED"
- Asegúrate de que el servidor esté ejecutándose con `npm start`
- Verifica que el puerto 5050 no esté siendo usado por otra aplicación

### Error de Supabase
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de que tu proyecto de Supabase esté activo

### Problemas de CORS
- El servidor ya tiene CORS configurado
- Si persisten problemas, verifica que estés accediendo desde localhost

## 📁 Estructura del proyecto

```
ESPAISERMAN/
├── app1/                    # Aplicación principal (Login/Register)
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── screens/
│       └── screen1.js
├── app2/                    # Aplicación secundaria
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── screens/
│       ├── screen1.js
│       └── screen2.js
├── server/                  # Servidor backend
│   ├── controllers/
│   ├── db/
│   ├── routes/
│   └── services/
├── assets/                  # Imágenes y recursos
├── .env                     # Configuración de Supabase
├── index.js                 # Servidor con Supabase
├── index-simple.js          # Servidor sin Supabase
└── package.json
```

¡El proyecto está listo para usar! 🎉
