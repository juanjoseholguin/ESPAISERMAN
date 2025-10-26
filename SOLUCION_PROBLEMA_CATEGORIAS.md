# Problema con las Categorías de Supabase

## Resumen del Problema
La tabla `question_category` en Supabase existe pero está **VACÍA** y no se pueden insertar datos.

## Diagnóstico Realizado
- ✅ La conexión con Supabase funciona correctamente
- ✅ La tabla `question_category` existe en la base de datos
- ✅ No hay errores de conexión en el código
- ❌ La tabla está completamente vacía (0 registros)
- ❌ No se pueden insertar datos (posible problema de RLS o estructura)

## Posibles Causas

### 1. Row Level Security (RLS) Activado
Supabase puede tener RLS activado que bloquea las operaciones INSERT/UPDATE/DELETE para usuarios anónimos.

### 2. Estructura de la Tabla Incorrecta
La tabla puede tener columnas con nombres diferentes a los esperados (`id`, `name`).

## Soluciones

### Opción 1: Insertar datos manualmente desde el Dashboard de Supabase

1. Ve al dashboard de Supabase: https://zdqqueneqkltmoknqvhe.supabase.co
2. Navega a Table Editor → `question_category`
3. Haz clic en "Insert row" o "Insertar fila"
4. Inserta manualmente las siguientes categorías:

| ID | name | (otras columnas si existen) |
|----|------|------------------------------|
| 1  | Cultura General Colombiana |
| 2  | Mundo Deportivo |
| 3  | Mundo del Entretenimiento |
| 4  | Ciencia y Tecnología |
| 5  | Historia |
| 6  | Geografía |

### Opción 2: Usar SQL Editor en Supabase

Ve al SQL Editor y ejecuta:

```sql
-- Verificar estructura de la tabla
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'question_category';

-- Insertar categorías de ejemplo
INSERT INTO question_category (name) VALUES
  ('Cultura General Colombiana'),
  ('Mundo Deportivo'),
  ('Mundo del Entretenimiento'),
  ('Ciencia y Tecnología'),
  ('Historia'),
  ('Geografía');
```

### Opción 3: Desactivar RLS temporalmente

Si RLS está bloqueando los inserts:

1. Ve a Authentication → Policies
2. Busca políticas para la tabla `question_category`
3. Desactiva RLS temporalmente o crea una política que permita operaciones para usuarios anónimos:

```sql
-- Política para permitir SELECT a todos
CREATE POLICY "Allow public read access" ON question_category
  FOR SELECT USING (true);

-- Política para permitir INSERT a todos (TEMPORAL)
CREATE POLICY "Allow public insert access" ON question_category
  FOR INSERT WITH CHECK (true);
```

### Opción 4: Verificar y ajustar estructura de columnas

Si las columnas tienen nombres diferentes, necesitas:

1. Verificar los nombres reales de las columnas en el dashboard
2. Actualizar el código en `server/controllers/categories.controller.js` para usar los nombres correctos
3. Actualizar el código en `app1/screens/createRoom.js` para mostrar correctamente los datos

## Archivos que Necesitan Verificación

1. **Dashboard de Supabase**: https://zdqqueneqkltmoknqvhe.supabase.co
   - Table Editor → `question_category` → Ver estructura
   - SQL Editor → Ejecutar queries para verificar

2. **Código del servidor**: `server/controllers/categories.controller.js`
   - Verificar que los nombres de columnas sean correctos

3. **Código del frontend**: `app1/screens/createRoom.js`
   - Verificar que acceda correctamente a las propiedades de las categorías

## Pasos Recomendados

1. Abre el dashboard de Supabase
2. Ve a Table Editor → `question_category`
3. Haz clic en "Insert row" y prueba insertar una categoría manualmente
4. Si funciona manualmente, el problema es el código de inserción
5. Si NO funciona manualmente, el problema es RLS o permisos
6. Revisa las políticas RLS en Authentication → Policies
7. Ajusta según sea necesario

## Verificación Final

Después de insertar las categorías, ejecuta:

```bash
node test-supabase-connection.js
```

Deberías ver:
```
✅ Conexión exitosa
📊 Registros encontrados: 6
```

