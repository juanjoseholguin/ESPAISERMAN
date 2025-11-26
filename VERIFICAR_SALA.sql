-- ============================================
-- VERIFICAR SALA EN LA BASE DE DATOS
-- ============================================
-- Ejecuta este script para verificar si una sala existe
-- Reemplaza 'Q6UC5X' con el código de tu sala

-- Verificar si la sala existe en admin_room
SELECT 
    id,
    room_pin,
    admin_user_id,
    room_status,
    room_size,
    room_category_id,
    time_per_question,
    created_at
FROM admin_room
WHERE room_pin = 'Q6UC5X';  -- ← Cambia este código

-- Verificar jugadores en la sala
SELECT 
    id,
    room_id,
    room_pin,
    user_id,
    player_name,
    avatar_url,
    avatar_bg,
    is_moderator,
    score,
    created_at
FROM players_room
WHERE room_pin = 'Q6UC5X';  -- ← Cambia este código

-- Ver todas las salas recientes
SELECT 
    room_pin,
    admin_user_id,
    room_status,
    room_size,
    created_at
FROM admin_room
ORDER BY created_at DESC
LIMIT 10;

-- Ver todos los jugadores en todas las salas
SELECT 
    pr.room_pin,
    pr.player_name,
    pr.user_id,
    pr.is_moderator,
    ar.room_status,
    ar.created_at as room_created_at
FROM players_room pr
LEFT JOIN admin_room ar ON pr.room_pin = ar.room_pin
ORDER BY pr.created_at DESC
LIMIT 20;

