const {
  createRoom,
  getRoomByPin,
  getRoomWithPlayers,
  joinRoom,
  updatePlayerScore,
  startRoom,
  getRoomResults,
  leaveRoom,
  endRoom
} = require('../db/rooms.db');

// Crear una sala
const createRoomController = async (req, res) => {
  try {
    const { adminUserId, categoryId, maxParticipants, timePerQuestion, mapPoints } = req.body;

    console.log(`📥 POST /rooms requested:`, { adminUserId, categoryId, maxParticipants, timePerQuestion, mapPointsCount: mapPoints?.length || 0 });

    if (!adminUserId || !categoryId || !maxParticipants || !timePerQuestion) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const result = await createRoom(adminUserId, categoryId, maxParticipants, timePerQuestion, mapPoints);
    
    if (result.success) {
      console.log(`✅ Room created successfully, returning:`, result.data);
      res.json(result.data);
    } else {
      console.error(`❌ Room creation failed:`, result.error);
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in createRoomController:', error);
    res.status(500).json({ error: 'Error al crear la sala' });
  }
};

// Obtener sala por PIN
const getRoomByPinController = async (req, res) => {
  try {
    const { roomPin } = req.params;
    const result = await getRoomByPin(roomPin);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getRoomByPinController:', error);
    res.status(500).json({ error: 'Error al obtener la sala' });
  }
};

// Obtener sala con jugadores
const getRoomWithPlayersController = async (req, res) => {
  try {
    const { roomPin } = req.params;
    console.log(`📥 GET /rooms/${roomPin}/players requested`);
    
    const result = await getRoomWithPlayers(roomPin);
    
    if (result.success) {
      console.log(`✅ Returning room data with ${result.data.players?.length || 0} players`);
      res.json(result.data);
    } else {
      console.error(`❌ Room not found: ${result.error}`);
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getRoomWithPlayersController:', error);
    res.status(500).json({ error: 'Error al obtener la sala' });
  }
};

// Unirse a una sala
const joinRoomController = async (req, res) => {
  try {
    const { roomPin } = req.params;
    const { userId, playerName, avatarUrl, avatarBg, isModerator } = req.body;

    console.log(`📥 POST /rooms/${roomPin}/join requested`, { userId, playerName, isModerator });

    if (!userId || !playerName) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const result = await joinRoom(roomPin, userId, playerName, avatarUrl, avatarBg, isModerator);
    
    if (result.success) {
      console.log(`✅ Join successful for user ${userId} in room ${roomPin}`);
      res.json(result.data);
    } else {
      console.error(`❌ Join failed: ${result.error}`);
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in joinRoomController:', error);
    res.status(500).json({ error: 'Error al unirse a la sala' });
  }
};

// Actualizar score de un jugador
const updatePlayerScoreController = async (req, res) => {
  try {
    const { roomPin, userId } = req.params;
    const { points } = req.body;

    if (points === undefined) {
      return res.status(400).json({ error: 'Faltan puntos' });
    }

    const result = await updatePlayerScore(roomPin, userId, points);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in updatePlayerScoreController:', error);
    res.status(500).json({ error: 'Error al actualizar el score' });
  }
};

// Iniciar sala
const startRoomController = async (req, res) => {
  try {
    const { roomPin } = req.params;
    const { adminUserId } = req.body;

    if (!adminUserId) {
      return res.status(400).json({ error: 'Falta adminUserId' });
    }

    const result = await startRoom(roomPin, adminUserId);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(403).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in startRoomController:', error);
    res.status(500).json({ error: 'Error al iniciar la sala' });
  }
};

// Obtener resultados de una sala
const getRoomResultsController = async (req, res) => {
  try {
    const { roomPin } = req.params;
    const result = await getRoomResults(roomPin);
    
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in getRoomResultsController:', error);
    res.status(500).json({ error: 'Error al obtener los resultados' });
  }
};

// Salir de una sala
const leaveRoomController = async (req, res) => {
  try {
    const { roomPin, userId } = req.params;
    const result = await leaveRoom(roomPin, userId);
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in leaveRoomController:', error);
    res.status(500).json({ error: 'Error al salir de la sala' });
  }
};

const endRoomController = async (req, res) => {
  try {
    const { roomPin } = req.params;
    const { adminUserId } = req.body;

    if (!adminUserId) {
      return res.status(400).json({ error: 'adminUserId es requerido' });
    }

    const result = await endRoom(roomPin, adminUserId);
    
    if (result.success) {
      res.json({ success: true, message: 'Partida finalizada' });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error in endRoomController:', error);
    res.status(500).json({ error: 'Error al finalizar la sala' });
  }
};

module.exports = {
  createRoomController,
  getRoomByPinController,
  getRoomWithPlayersController,
  joinRoomController,
  updatePlayerScoreController,
  startRoomController,
  getRoomResultsController,
  leaveRoomController,
  endRoomController
};

