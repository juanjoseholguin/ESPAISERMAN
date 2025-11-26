-- Script para verificar y corregir problemas con boosters en Supabase

-- 1. Verificar que la tabla booster existe y tiene datos
SELECT COUNT(*) as total_boosters FROM public.booster;

-- 2. Ver todos los boosters disponibles
SELECT id, booster_name, booster_price FROM public.booster ORDER BY id;

-- 3. Verificar políticas RLS en la tabla booster
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'booster';

-- 4. Si no hay políticas o están bloqueando, crear/actualizar políticas para permitir lectura pública
-- Primero eliminar políticas existentes si es necesario
DROP POLICY IF EXISTS "Anyone can read boosters" ON public.booster;

-- Crear política para permitir lectura pública de boosters
CREATE POLICY "Anyone can read boosters" 
ON public.booster 
FOR SELECT 
TO public 
USING (true);

-- 5. Verificar que RLS esté habilitado pero con políticas permisivas
ALTER TABLE public.booster ENABLE ROW LEVEL SECURITY;

-- 6. Verificar datos de ejemplo (deberían existir estos boosters según las imágenes)
-- Si no existen, insertarlos:
INSERT INTO public.booster (booster_name, booster_hability, booster_description, booster_price)
VALUES 
    ('Media de güaro temporal', 'Emborrachar el reloj', 'Suma 5 segundos más al reloj', 200),
    ('Café cargado', 'Despierta la mente', 'Elimina una respuesta incorrecta de la siguiente pregunta', 400),
    ('Empanadirri legal', 'Revive el hambre de aprender', 'Te da una segunda oportunidad para continuar', 300),
    ('Chichaghrrom', 'Puro poder porcino', 'Duplica los puntos que ganes en la siguiente pregunta', 500)
ON CONFLICT DO NOTHING;

-- 7. Verificar que los datos se insertaron correctamente
SELECT id, booster_name, booster_price FROM public.booster ORDER BY id;

-- 8. HABILITAR RLS EN LA TABLA BOOSTER (si no está habilitado)
ALTER TABLE public.booster ENABLE ROW LEVEL SECURITY;

-- 9. ELIMINAR POLÍTICAS EXISTENTES DE BOOSTER (si existen)
DROP POLICY IF EXISTS "Anyone can read boosters" ON public.booster;
DROP POLICY IF EXISTS "Anyone can insert boosters" ON public.booster;
DROP POLICY IF EXISTS "Anyone can update boosters" ON public.booster;

-- 10. CREAR POLÍTICAS PARA LA TABLA BOOSTER (CRÍTICO - Sin esto no se pueden leer los boosters)
-- Política para permitir lectura pública de todos los boosters
CREATE POLICY "Anyone can read boosters" 
ON public.booster 
FOR SELECT 
TO public 
USING (true);

-- Política para permitir inserción (opcional, para administradores)
CREATE POLICY "Anyone can insert boosters" 
ON public.booster 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Política para permitir actualización (opcional, para administradores)
CREATE POLICY "Anyone can update boosters" 
ON public.booster 
FOR UPDATE 
TO public 
USING (true) 
WITH CHECK (true);

-- 11. VERIFICAR QUE LAS POLÍTICAS SE CREARON CORRECTAMENTE
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'booster';

-- 8. HABILITAR RLS EN LA TABLA BOOSTER (si no está habilitado)
ALTER TABLE public.booster ENABLE ROW LEVEL SECURITY;

-- 9. ELIMINAR POLÍTICAS EXISTENTES DE BOOSTER (si existen)
DROP POLICY IF EXISTS "Anyone can read boosters" ON public.booster;
DROP POLICY IF EXISTS "Anyone can insert boosters" ON public.booster;
DROP POLICY IF EXISTS "Anyone can update boosters" ON public.booster;

-- 10. CREAR POLÍTICAS PARA LA TABLA BOOSTER
-- Política para permitir lectura pública de todos los boosters
CREATE POLICY "Anyone can read boosters" 
ON public.booster 
FOR SELECT 
TO public 
USING (true);

-- Política para permitir inserción (opcional, para administradores)
CREATE POLICY "Anyone can insert boosters" 
ON public.booster 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Política para permitir actualización (opcional, para administradores)
CREATE POLICY "Anyone can update boosters" 
ON public.booster 
FOR UPDATE 
TO public 
USING (true) 
WITH CHECK (true);

-- 11. VERIFICAR QUE LAS POLÍTICAS SE CREARON CORRECTAMENTE
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'booster';

