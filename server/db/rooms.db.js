const supabase = require('../services/supabase.service');

// Generar código de sala único
function generateRoomCode() {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

// Crear una sala en admin_room
async function createRoom(adminUserId, categoryId, maxParticipants, timePerQuestion, mapPoints = null) {
  try {
    const roomPin = generateRoomCode();
    console.log(`🔨 Creating room with PIN: "${roomPin}" (type: ${typeof roomPin}), adminUserId: ${adminUserId}, categoryId: ${categoryId}, maxParticipants: ${maxParticipants}, timePerQuestion: ${timePerQuestion}, mapPoints: ${mapPoints?.length || 0} puntos`);
    
    const insertData = {
      room_pin: String(roomPin).trim().toUpperCase(),
      admin_user_id: adminUserId,
      room_category_id: categoryId,
      room_size: maxParticipants,
      time_per_question: timePerQuestion,
      room_status: false
    };

    if (mapPoints && Array.isArray(mapPoints) && mapPoints.length > 0) {
      insertData.map_points = mapPoints;
    }
    
    console.log(`📤 Inserting room data:`, insertData);
    
    const { data, error } = await supabase
      .from('admin_room')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating room in Supabase:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    if (!data) {
      console.error('❌ Room created but no data returned');
      return { success: false, error: 'Sala creada pero no se recibieron datos' };
    }
    
    console.log(`✅ Room created successfully:`, data);
    console.log(`✅ Room PIN in database: "${data.room_pin}" (type: ${typeof data.room_pin})`);
    
    // Verificar que la sala se puede leer inmediatamente
    const verifyResult = await getRoomByPin(data.room_pin);
    if (verifyResult.success) {
      console.log(`✅ Verified: Room can be read immediately after creation`);
    } else {
      console.warn(`⚠️ Warning: Room created but cannot be read immediately: ${verifyResult.error}`);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error creating room:', error);
    return { success: false, error: error.message };
  }
}

// Obtener sala por PIN
async function getRoomByPin(roomPin) {
  try {
    console.log(`🔍 Getting room by PIN: "${roomPin}" (type: ${typeof roomPin}, length: ${roomPin?.length})`);
    
    // Limpiar el roomPin (eliminar espacios, convertir a mayúsculas)
    const cleanRoomPin = String(roomPin).trim().toUpperCase();
    console.log(`🔍 Cleaned room PIN: "${cleanRoomPin}"`);
    
    const { data, error } = await supabase
      .from('admin_room')
      .select('*')
      .eq('room_pin', cleanRoomPin)
      .single();

    if (error) {
      console.error(`❌ Error getting room ${cleanRoomPin}:`, error);
      throw error;
    }
    
    if (!data) {
      console.warn(`⚠️ Room ${cleanRoomPin} not found`);
      return { success: false, error: 'Sala no encontrada' };
    }
    
    console.log(`✅ Room found:`, data);
    return { success: true, data };
  } catch (error) {
    console.error('Error getting room:', error);
    return { success: false, error: error.message };
  }
}

// Obtener sala con jugadores
async function getRoomWithPlayers(roomPin) {
  try {
    // Limpiar el roomPin (eliminar espacios, convertir a mayúsculas)
    const cleanRoomPin = String(roomPin).trim().toUpperCase();
    console.log(`🔍 Getting room with players for PIN: "${cleanRoomPin}"`);
    
    const { data: room, error: roomError } = await supabase
      .from('admin_room')
      .select('*')
      .eq('room_pin', cleanRoomPin)
      .single();

    if (roomError) {
      console.error(`❌ Error getting room ${cleanRoomPin}:`, roomError);
      // Si es un error de "no encontrado", retornar un error más claro
      if (roomError.code === 'PGRST116') {
        return { success: false, error: 'Sala no encontrada' };
      }
      throw roomError;
    }

    if (!room) {
      console.warn(`⚠️ Room ${cleanRoomPin} not found`);
      return { success: false, error: 'Sala no encontrada' };
    }

    console.log(`✅ Room found:`, room);

    const { data: players, error: playersError } = await supabase
      .from('players_room')
      .select('*')
      .eq('room_pin', cleanRoomPin)
      .order('id', { ascending: true }); // Ordenar por id si created_at no existe

    if (playersError) {
      console.error(`❌ Error getting players for room ${cleanRoomPin}:`, playersError);
      throw playersError;
    }

    console.log(`✅ Found ${players?.length || 0} players in room ${cleanRoomPin}:`, players);

    return {
      success: true,
      data: {
        ...room,
        players: players || []
      }
    };
  } catch (error) {
    console.error('Error getting room with players:', error);
    return { success: false, error: error.message };
  }
}

// Unirse a una sala
async function joinRoom(roomPin, userId, playerName, avatarUrl, avatarBg, isModerator = false) {
  try {
    // Limpiar el roomPin
    const cleanRoomPin = String(roomPin).trim().toUpperCase();
    console.log(`🔍 Joining room: "${cleanRoomPin}", userId: ${userId}, playerName: "${playerName}"`);
    
    // Verificar que la sala existe
    const roomResult = await getRoomByPin(cleanRoomPin);
    if (!roomResult.success || !roomResult.data) {
      console.error(`❌ Cannot join: room ${cleanRoomPin} does not exist`);
      return { success: false, error: roomResult.error || 'Sala no existe' };
    }

    const room = roomResult.data;
    console.log(`✅ Room exists, proceeding to join`);

    // Verificar si la sala está llena
    const { count } = await supabase
      .from('players_room')
      .select('*', { count: 'exact', head: true })
      .eq('room_pin', cleanRoomPin);

    if (count >= room.room_size) {
      return { success: false, error: `Sala llena (${room.room_size} jugadores máximo)` };
    }

    // Verificar si el usuario ya está en la sala
    const { data: existingPlayer } = await supabase
      .from('players_room')
      .select('*')
      .eq('room_pin', cleanRoomPin)
      .eq('user_id', userId)
      .single();

    if (existingPlayer) {
      console.log(`✅ User ${userId} already in room ${cleanRoomPin}`);
      return { success: true, data: existingPlayer, alreadyJoined: true };
    }

    // Insertar jugador
    console.log(`➕ Inserting player into room ${cleanRoomPin}...`);
    const { data, error } = await supabase
      .from('players_room')
      .insert({
        room_id: room.id,
        room_pin: cleanRoomPin,
        user_id: userId,
        player_name: playerName,
        avatar_url: avatarUrl,
        avatar_bg: avatarBg,
        is_moderator: isModerator,
        score: 0
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error inserting player:`, error);
      throw error;
    }
    
    console.log(`✅ Player inserted successfully:`, data);
    return { success: true, data };
  } catch (error) {
    console.error('Error joining room:', error);
    return { success: false, error: error.message };
  }
}

// Actualizar score de un jugador
async function updatePlayerScore(roomPin, userId, points) {
  try {
    const { data: player } = await supabase
      .from('players_room')
      .select('score')
      .eq('room_pin', roomPin)
      .eq('user_id', userId)
      .single();

    if (!player) {
      return { success: false, error: 'Jugador no encontrado' };
    }

    const newScore = (player.score || 0) + points;

    const { data, error } = await supabase
      .from('players_room')
      .update({ score: newScore })
      .eq('room_pin', roomPin)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating player score:', error);
    return { success: false, error: error.message };
  }
}

// Iniciar sala (cambiar room_status a true)
async function startRoom(roomPin, adminUserId) {
  try {
    const cleanRoomPin = String(roomPin).trim().toUpperCase();
    console.log(`🚀 Starting room: "${cleanRoomPin}", adminUserId: ${adminUserId}`);
    
    const { data: room, error: roomError } = await supabase
      .from('admin_room')
      .select('*')
      .eq('room_pin', cleanRoomPin)
      .eq('admin_user_id', adminUserId)
      .single();

    if (roomError || !room) {
      console.error(`❌ Room ${cleanRoomPin} not found or user ${adminUserId} is not admin`);
      return { success: false, error: 'No tienes permisos para iniciar esta sala o la sala no existe' };
    }

    console.log(`✅ Room found, updating status to true...`);

    const { data, error } = await supabase
      .from('admin_room')
      .update({ room_status: true })
      .eq('room_pin', cleanRoomPin)
      .select()
      .single();

    if (error) {
      console.error(`❌ Error updating room status:`, error);
      throw error;
    }
    
    console.log(`✅ Room ${cleanRoomPin} started successfully:`, data);
    return { success: true, data };
  } catch (error) {
    console.error('Error starting room:', error);
    return { success: false, error: error.message };
  }
}

async function endRoom(roomPin, adminUserId) {
  try {
    const cleanRoomPin = String(roomPin).trim().toUpperCase();
    console.log(`🛑 Ending room: "${cleanRoomPin}", adminUserId: ${adminUserId}`);
    
    const { data: room, error: roomError } = await supabase
      .from('admin_room')
      .select('*')
      .eq('room_pin', cleanRoomPin)
      .eq('admin_user_id', adminUserId)
      .single();

    if (roomError || !room) {
      console.error(`❌ Room ${cleanRoomPin} not found or user ${adminUserId} is not admin`);
      return { success: false, error: 'No tienes permisos para finalizar esta sala o la sala no existe' };
    }

    const { data, error } = await supabase
      .from('admin_room')
      .update({ room_status: false })
      .eq('room_pin', cleanRoomPin)
      .select()
      .single();

    if (error) {
      console.error(`❌ Error ending room:`, error);
      throw error;
    }
    
    console.log(`✅ Room ${cleanRoomPin} ended successfully:`, data);
    return { success: true, data };
  } catch (error) {
    console.error('Error ending room:', error);
    return { success: false, error: error.message };
  }
}

// Obtener resultados finales de una sala
async function getRoomResults(roomPin) {
  try {
    const { data, error } = await supabase
      .from('players_room')
      .select('player_name, score')
      .eq('room_pin', roomPin)
      .order('score', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error getting room results:', error);
    return { success: false, error: error.message };
  }
}

// Salir de una sala
async function leaveRoom(roomPin, userId) {
  try {
    const { error } = await supabase
      .from('players_room')
      .delete()
      .eq('room_pin', roomPin)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error leaving room:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  createRoom,
  getRoomByPin,
  getRoomWithPlayers,
  joinRoom,
  updatePlayerScore,
  startRoom,
  getRoomResults,
  leaveRoom,
  endRoom,
  generateRoomCode
};

