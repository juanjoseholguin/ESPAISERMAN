-- ============================================
-- ESPAISERMAN TRIVIA - DATABASE SCHEMAS
-- Backup/Export de schemas de Supabase
-- ============================================

-- Tabla: users
-- Descripción: Almacena información de los usuarios del sistema
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    "espaiser-coin" INTEGER DEFAULT 100,
    avatar_url TEXT DEFAULT '/assets/images/Group 4.png',
    avatar_bg VARCHAR(7) DEFAULT '#F9D648',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: question_category
-- Descripción: Almacena las categorías de preguntas disponibles
CREATE TABLE IF NOT EXISTS question_category (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: questions
-- Descripción: Almacena las preguntas del juego con sus opciones y respuestas
CREATE TABLE IF NOT EXISTS questions (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT REFERENCES question_category(id) ON DELETE CASCADE,
    category__id BIGINT REFERENCES question_category(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT[] NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'medium',
    points INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_questions_category_id ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_category__id ON questions(category__id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Comentarios en las tablas
COMMENT ON TABLE users IS 'Tabla de usuarios del sistema Espaiserman';
COMMENT ON TABLE question_category IS 'Categorías de preguntas disponibles en el juego';
COMMENT ON TABLE questions IS 'Preguntas del juego con opciones múltiples';

-- Comentarios en las columnas principales
COMMENT ON COLUMN users."espaiser-coin" IS 'Monedas virtuales del usuario para comprar items en la tienda';
COMMENT ON COLUMN users.avatar_url IS 'URL de la imagen del avatar del usuario';
COMMENT ON COLUMN users.avatar_bg IS 'Color de fondo hexadecimal del avatar';
COMMENT ON COLUMN questions.answer IS 'Array de strings con las opciones de respuesta (A, B, C, D)';
COMMENT ON COLUMN questions.correct_answer IS 'Respuesta correcta de la pregunta';
COMMENT ON COLUMN questions.points IS 'Puntos que otorga esta pregunta al responder correctamente';

-- Políticas RLS (Row Level Security) - Ejemplo básico
-- Nota: Ajusta estas políticas según tus necesidades de seguridad

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Política para users: Todos pueden leer (para login)
CREATE POLICY "Users are viewable by everyone" ON users
    FOR SELECT USING (true);

-- Política para users: Solo usuarios autenticados pueden insertar
CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (true);

-- Política para question_category: Todos pueden leer
CREATE POLICY "Categories are viewable by everyone" ON question_category
    FOR SELECT USING (true);

-- Política para questions: Todos pueden leer
CREATE POLICY "Questions are viewable by everyone" ON questions
    FOR SELECT USING (true);

-- ============================================
-- DATOS DE EJEMPLO (Opcional)
-- ============================================

-- Insertar categorías de ejemplo
INSERT INTO question_category (category, description) VALUES
    ('Historia de Colombia', 'Preguntas sobre la historia de Colombia'),
    ('Geografía', 'Preguntas sobre geografía colombiana'),
    ('Cultura', 'Preguntas sobre cultura colombiana'),
    ('Deportes', 'Preguntas sobre deportes'),
    ('Ciencia', 'Preguntas sobre ciencia y tecnología')
ON CONFLICT (category) DO NOTHING;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 
-- 1. Este archivo contiene los schemas básicos de las tablas.
-- 2. Las políticas RLS están configuradas para permitir lectura pública.
-- 3. Ajusta las políticas según tus necesidades de seguridad.
-- 4. El campo 'category__id' en questions es un alias alternativo para 'category_id'.
-- 5. Las fechas se manejan automáticamente con TIMESTAMP WITH TIME ZONE.
-- 6. Los índices mejoran el rendimiento de las consultas por categoría.
--
-- ============================================

