# Espaiserman Trivia - Aplicación de Trivia Interactiva

Aplicación móvil de trivia con temática Spider-Man Colombiano desarrollada en JavaScript vanilla. Los jugadores pueden unirse a salas mediante códigos e interactuar con otros participantes en un juego grupal donde varios compiten al mismo tiempo. Los jugadores deben desplazarse físicamente en un espacio amplio, siguiendo un recorrido marcado por códigos QR que desbloquean las preguntas.

## Despliegue

**app 1**: https://espaiserman.vercel.app/
**app 2**: https://espaiserman-gklh.vercel.app/
**backend**: https://espaiserman-2yll.vercel.app/

## 🚀 Características

- **Juego grupal en tiempo real**: Múltiples jugadores compiten simultáneamente
- **Sistema de salas**: Crear y unirse a salas mediante códigos únicos
- **Mapa interactivo**: Visualización del campus de Icesi usando Leaflet.js
- **QR Codes**: Sistema de códigos QR para desbloquear preguntas en estaciones físicas
- **Potenciadores**: Sistema de ventajas como congelar tiempo o puntos x2
- **Tiempo real**: Comunicación en tiempo real usando Socket.IO
- **Base de datos**: Integración con Supabase para usuarios, preguntas y categorías

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Cuenta de Supabase (para base de datos)
- Git

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd ESPAISERMAN
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```env
   PORT=5050
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   SUPABASE_API_KEY=tu_clave_api_de_supabase
   ```

4. **Configurar Supabase**
   
   Asegúrate de tener las siguientes tablas en tu proyecto de Supabase:
   - `users`: Para almacenar usuarios
   - `questions`: Para almacenar preguntas
   - `question_category`: Para almacenar categorías

   Ver el archivo `database-schemas.sql` para los schemas completos.

## 🏃 Ejecutar Localmente

1. **Iniciar el servidor**
   ```bash
   npm start
   ```
   
   O si prefieres usar nodemon para desarrollo:
   ```bash
   npm run dev
   ```

2. **Acceder a las aplicaciones**
   
   - **App 1 (Jugadores)**: http://localhost:5050/app1
   - **App 2 (Moderador)**: http://localhost:5050/app2
   - **API Base**: http://localhost:5050

## 📱 Estructura del Proyecto

```
ESPAISERMAN/
├── app1/                    # Aplicación para jugadores
│   ├── screens/             # Pantallas de la aplicación
│   ├── app.js              # Lógica principal de navegación
│   ├── index.html          # HTML principal
│   └── styles.css          # Estilos
├── app2/                    # Aplicación para moderador
│   ├── screens/            # Pantallas del moderador
│   ├── app.js              # Lógica principal
│   ├── index.html          # HTML principal
│   └── styles.css          # Estilos
├── server/                  # Backend
│   ├── controllers/        # Controladores de rutas
│   ├── db/                 # Acceso a base de datos
│   ├── routes/             # Definición de rutas
│   └── services/           # Servicios (Socket.IO, Supabase)
├── css/                    # Estilos globales
├── js/                     # Scripts globales
├── index.js                # Servidor principal
└── package.json            # Dependencias del proyecto
```

## 🎮 Cómo Usar

### Para Moderadores (App 2)

1. Abre http://localhost:5050/app2
2. Inicia sesión o regístrate
3. Crea una nueva sala:
   - Selecciona una categoría
   - Define el número de participantes
   - Establece el tiempo por pregunta
4. Visualiza el mapa del campus de Icesi
5. Distribuye las preguntas en el mapa
6. Copia el código de la sala
7. Espera a que los jugadores se unan
8. Inicia la partida cuando estés listo

### Para Jugadores (App 1)

1. Abre http://localhost:5050/app1
2. Inicia sesión o regístrate
3. Únete a una sala usando el código proporcionado por el moderador
4. Espera en el lobby hasta que el moderador inicie la partida
5. Responde las preguntas que aparezcan
6. Desplázate físicamente por el campus siguiendo los códigos QR
7. Gana puntos por cada respuesta correcta
8. Revisa tus resultados al finalizar

## 🔌 API Endpoints

### Usuarios
- `GET /users` - Obtener todos los usuarios
- `POST /users` - Crear un nuevo usuario
- `PUT /users/:id` - Actualizar un usuario
- `DELETE /users/:id` - Eliminar un usuario

### Preguntas
- `GET /questions` - Obtener todas las preguntas
- `GET /questions/:id` - Obtener una pregunta por ID
- `GET /questions/category/:categoryId` - Obtener preguntas por categoría

### Categorías
- `GET /categories` - Obtener todas las categorías

## 🗄️ Base de Datos

El proyecto utiliza Supabase (PostgreSQL) con las siguientes tablas principales:

- **users**: Información de usuarios, avatares, monedas
- **questions**: Preguntas del juego con opciones y respuestas correctas
- **question_category**: Categorías de preguntas

Ver `database-schemas.sql` para la estructura completa de las tablas.

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Base de datos**: Supabase (PostgreSQL)
- **Tiempo real**: Supabase
- **Mapas**: Leaflet.js
- **Estilos**: CSS vanilla

## 📝 Scripts Disponibles

- `npm start` - Inicia el servidor en modo producción
- `npm run dev` - Inicia el servidor con nodemon (auto-reload)
- `npm run start-simple` - Inicia versión simplificada sin Supabase

## 🐛 Solución de Problemas

### El servidor no inicia
- Verifica que el puerto 5050 esté disponible
- Asegúrate de que todas las dependencias estén instaladas (`npm install`)
- Revisa que el archivo `.env` esté configurado correctamente

### Error de conexión a Supabase
- Verifica que las variables de entorno `SUPABASE_URL` y `SUPABASE_ANON_KEY` estén correctas
- Asegúrate de que las tablas existan en tu proyecto de Supabase
- Revisa los permisos RLS (Row Level Security) en Supabase

### El mapa no se muestra
- Verifica que Leaflet.js esté cargado correctamente
- Revisa la consola del navegador para errores de JavaScript
- Asegúrate de tener conexión a internet (Leaflet usa tiles de OpenStreetMap)

## Database Schemas:
- create table public.users ( id bigint generated by default as identity not null, username text null, email text null, espaiser - coin numeric null, password text null, avatar_url text null, avatar_bg text null, constraint users_pkey primary key (id) ) TABLESPACE pg_default;

- create table public.questions ( id bigint generated by default as identity not null, category__id bigint not null, question text null, answer json null, correct_answer text null, constraint questions_pkey primary key (id, category__id), constraint questions_category__id_fkey foreign KEY (category__id) references question_category (id) ) TABLESPACE pg_default;

- create table public.question_zone ( id bigint generated by default as identity not null, latitude numeric null, longitude numeric null, radius numeric null, room_id bigint null, constraint question_zone_pkey primary key (id), constraint question_zone_room_id_fkey foreign KEY (room_id) references admin_room (id) ) TABLESPACE pg_default;

- create table public.question_category ( id bigint generated by default as identity not null, category text null, constraint category_pkey primary key (id) ) TABLESPACE pg_default;

- create table public.players_room ( id bigint generated by default as identity not null, room_pin bigint null, room_id bigint null, user_id bigint null, constraint players_room_pkey primary key (id), constraint players_room_user_id_fkey foreign KEY (user_id) references users (id) ) TABLESPACE pg_default;

- create table public.boosters_per_user ( id bigint generated by default as identity not null, user_id bigint null, booster_id bigint null, constraint boosters_per_user_pkey primary key (id), constraint boosters_per_user_booster_id_fkey foreign KEY (booster_id) references booster (id), constraint boosters_per_user_user_id_fkey foreign KEY (user_id) references users (id) ) TABLESPACE pg_default;

- create table public.booster ( id bigint generated by default as identity not null, booster_name text null, booster_hability text null, booster_description text null, booster_price numeric null, constraint booster_pkey primary key (id) ) TABLESPACE pg_default;

- create table public.admin_room ( id bigint generated by default as identity not null, room_pin bigint null, admin_user_id bigint null, room_status boolean null, room_size numeric null, room_category_id bigint null, constraint game_room_pkey primary key (id), constraint admin_room_room_category_id_fkey foreign KEY (room_category_id) references question_category (id) ) TABLESPACE pg_default;

## 📄 Licencia

MIT License

## 👥 Autores

Espaiserman Team

## 🙏 Agradecimientos

- Universidad Icesi
- OpenStreetMap por los tiles del mapa
- Comunidad de desarrolladores de código abierto
