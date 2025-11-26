const express = require('express');
const router = express.Router();
const {
  createRoomController,
  getRoomByPinController,
  getRoomWithPlayersController,
  joinRoomController,
  updatePlayerScoreController,
  startRoomController,
  getRoomResultsController,
  leaveRoomController
} = require('../controllers/rooms.controller');

// Crear sala
router.post('/rooms', createRoomController);

// Obtener sala por PIN
router.get('/rooms/:roomPin', getRoomByPinController);

// Obtener sala con jugadores
router.get('/rooms/:roomPin/players', getRoomWithPlayersController);

// Unirse a una sala
router.post('/rooms/:roomPin/join', joinRoomController);

// Actualizar score de un jugador
router.patch('/rooms/:roomPin/players/:userId/score', updatePlayerScoreController);

// Iniciar sala
router.post('/rooms/:roomPin/start', startRoomController);

// Obtener resultados de una sala
router.get('/rooms/:roomPin/results', getRoomResultsController);

// Salir de una sala
router.delete('/rooms/:roomPin/players/:userId', leaveRoomController);

module.exports = router;

