// Servicio para manejar rooms con Supabase Realtime (app2)
import { getSupabaseClient } from './supabaseClient.js';

// Suscribirse a cambios en una sala (players_room y admin_room)
export function subscribeToRoom(roomPin, onRoomUpdate) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('⚠️ Supabase no disponible para suscripción de rooms');
    return null;
  }

  // Suscribirse a cambios en players_room
  const playersChannel = supabase
    .channel(`room-players-${roomPin}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'players_room',
        filter: `room_pin=eq.${roomPin}`
      },
      (payload) => {
        console.log('🔄 Cambio en players_room:', payload);
        // Recargar el estado completo de la sala
        loadRoomState(roomPin).then(onRoomUpdate);
      }
    )
    .subscribe();

  // Suscribirse a cambios en admin_room
  const adminChannel = supabase
    .channel(`room-admin-${roomPin}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'admin_room',
        filter: `room_pin=eq.${roomPin}`
      },
      (payload) => {
        console.log('🔄 Cambio en admin_room:', payload);
        // Recargar el estado completo de la sala
        loadRoomState(roomPin).then(onRoomUpdate);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(adminChannel);
    }
  };
}

// Cargar el estado completo de una sala
export async function loadRoomState(roomPin) {
  try {
    const response = await fetch(`http://localhost:5050/rooms/${roomPin}/players`);
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Sala ${roomPin} no encontrada`);
        return {
          code: roomPin,
          players: [],
          room_status: false
        };
      }
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(errorData.error || 'Error al cargar la sala');
    }
    const roomData = await response.json();
    
    console.log('✅ Room state loaded (app2):', roomData);
    
    // Transformar el formato para compatibilidad con el código existente
    const transformedState = {
      code: roomData.room_pin || roomPin,
      players: (roomData.players || []).map(p => ({
        id: p.user_id,
        user_id: p.user_id, // Agregar también user_id para compatibilidad
        name: p.player_name || p.name || 'Jugador',
        player_name: p.player_name || p.name || 'Jugador', // Agregar también player_name
        avatar_url: p.avatar_url,
        avatar_bg: p.avatar_bg,
        score: p.score || 0
      })),
      host: roomData.admin_user_id,
      category: roomData.room_category_id,
      maxParticipants: roomData.room_size,
      timePerQuestion: roomData.time_per_question,
      room_status: roomData.room_status || false,
      map_points: roomData.map_points || null
    };
    
    console.log('✅ Transformed room state (app2):', transformedState);
    return transformedState;
  } catch (error) {
    console.error('Error loading room state:', error);
    // Retornar un estado vacío en lugar de null
    return {
      code: roomPin,
      players: [],
      room_status: false
    };
  }
}

// Crear una sala
export async function createRoomAPI(adminUserId, categoryId, maxParticipants, timePerQuestion, mapPoints = null) {
  try {
    console.log('📤 Creating room via API:', { adminUserId, categoryId, maxParticipants, timePerQuestion, mapPointsCount: mapPoints?.length || 0 });
    
    const response = await fetch(`${window.location.origin}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminUserId,
        categoryId,
        maxParticipants,
        timePerQuestion,
        mapPoints: mapPoints || null
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error creating room:', error);
      throw new Error(error.error || 'Error al crear la sala');
    }

    const roomData = await response.json();
    console.log('✅ Room created via API:', roomData);
    return roomData;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}

// Unirse a una sala
export async function joinRoomAPI(roomPin, userId, playerName, avatarUrl, avatarBg, isModerator = false) {
  try {
    const response = await fetch(`http://localhost:5050/rooms/${roomPin}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        playerName,
        avatarUrl,
        avatarBg,
        isModerator
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al unirse a la sala');
    }

    return await response.json();
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
}

// Iniciar una sala
export async function startRoomAPI(roomPin, adminUserId) {
  try {
    const response = await fetch(`http://localhost:5050/rooms/${roomPin}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminUserId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al iniciar la sala');
    }

    return await response.json();
  } catch (error) {
    console.error('Error starting room:', error);
    throw error;
  }
}

export async function getRoomResultsAPI(roomPin) {
  try {
    const response = await fetch(`http://localhost:5050/rooms/${roomPin}/results`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al obtener los resultados');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting room results:', error);
    throw error;
  }
}

export async function endRoomAPI(roomPin, adminUserId) {
  try {
    const response = await fetch(`http://localhost:5050/rooms/${roomPin}/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminUserId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al finalizar la sala');
    }

    return await response.json();
  } catch (error) {
    console.error('Error ending room:', error);
    throw error;
  }
}

