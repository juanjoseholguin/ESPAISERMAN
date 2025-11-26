// Servicio para manejar rooms con Supabase Realtime
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
        // Recargar el estado completo de la sala cuando hay cambios
        // Esto asegura que los scores se actualicen en tiempo real
        loadRoomState(roomPin).then(onRoomUpdate).catch(err => {
          console.error('Error reloading room state after players_room change:', err);
        });
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
        // Recargar el estado completo de la sala cuando hay cambios
        loadRoomState(roomPin).then(onRoomUpdate).catch(err => {
          console.error('Error reloading room state after admin_room change:', err);
        });
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
    const response = await fetch(`https://espaiserman-2yll.vercel.app/rooms/${roomPin}/players`);
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

    console.log('✅ Room state loaded:', roomData);

    // Transformar el formato para compatibilidad con el código existente
    const transformedState = {
      code: roomData.room_pin || roomPin,
      players: (roomData.players || []).map(p => ({
        id: p.user_id,
        user_id: p.user_id,
        name: p.player_name || p.name || 'Jugador',
        player_name: p.player_name || p.name || 'Jugador',
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

    console.log('✅ Transformed room state:', transformedState);
    return transformedState;
  } catch (error) {
    console.error('Error loading room state:', error);
    // Retornar un estado vacío en lugar de null para que la UI no se rompa
    return {
      code: roomPin,
      players: [],
      room_status: false
    };
  }
}

// Crear una sala
export async function createRoomAPI(adminUserId, categoryId, maxParticipants, timePerQuestion) {
  try {
    const response = await fetch('https://espaiserman-2yll.vercel.app/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminUserId,
        categoryId,
        maxParticipants,
        timePerQuestion
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear la sala');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}

// Unirse a una sala
export async function joinRoomAPI(roomPin, userId, playerName, avatarUrl, avatarBg, isModerator = false) {
  try {
    const response = await fetch(`https://espaiserman-2yll.vercel.app/rooms/${roomPin}/join`, {
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
    const response = await fetch(`https://espaiserman-2yll.vercel.app/rooms/${roomPin}/start`, {
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

// Actualizar score de un jugador
export async function updatePlayerScoreAPI(roomPin, userId, points) {
  try {
    const response = await fetch(`https://espaiserman-2yll.vercel.app/rooms/${roomPin}/players/${userId}/score`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al actualizar el score');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating player score:', error);
    throw error;
  }
}

export async function getRoomResultsAPI(roomPin) {
  try {
    const response = await fetch(`https://espaiserman-2yll.vercel.app/rooms/${roomPin}/results`);

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

export async function checkRoomStatus(roomPin) {
  try {
    const response = await fetch(`https://espaiserman-2yll.vercel.app/rooms/${roomPin}`);
    if (!response.ok) {
      return { room_status: false };
    }
    const roomData = await response.json();
    return { room_status: roomData.room_status || false };
  } catch (error) {
    console.error('Error checking room status:', error);
    return { room_status: false };
  }
}


