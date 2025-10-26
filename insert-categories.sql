-- Script SQL para insertar categorías en Supabase
-- Ejecuta este script en el SQL Editor de Supabase
-- URL: https://zdqqueneqkltmoknqvhe.supabase.co

-- Primero, verificar la estructura de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'question_category'
ORDER BY ordinal_position;

-- Intentar insertar categorías con diferentes nombres de columnas
-- (Prueba cada uno hasta que funcione)

-- Opción 1: Si la columna se llama 'name'
INSERT INTO question_category (name) VALUES
  ('Cultura General Colombiana'),
  ('Mundo Deportivo'),
  ('Mundo del Entretenimiento'),
  ('Ciencia y Tecnología'),
  ('Historia'),
  ('Geografía')
ON CONFLICT DO NOTHING;

-- Opción 2: Si la columna se llama 'category_name'
-- INSERT INTO question_category (category_name) VALUES
--   ('Cultura General Colombiana'),
--   ('Mundo Deportivo'),
--   ('Mundo del Entretenimiento'),
--   ('Ciencia y Tecnología'),
--   ('Historia'),
--   ('Geografía')
-- ON CONFLICT DO NOTHING;

-- Opción 3: Si la columna se llama 'nombre'
-- INSERT INTO question_category (nombre) VALUES
--   ('Cultura General Colombiana'),
--   ('Mundo Deportivo'),
--   ('Mundo del Entretenimiento'),
--   ('Ciencia y Tecnología'),
--   ('Historia'),
--   ('Geografía')
-- ON CONFLICT DO NOTHING;

-- Verificar que se insertaron correctamente
SELECT * FROM question_category ORDER BY id;

