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

router.post('/rooms', createRoomController);

router.get('/rooms/:roomPin', getRoomByPinController);

router.get('/rooms/:roomPin/players', getRoomWithPlayersController);

router.post('/rooms/:roomPin/join', joinRoomController);

router.patch('/rooms/:roomPin/players/:userId/score', updatePlayerScoreController);

router.post('/rooms/:roomPin/start', startRoomController);

router.get('/rooms/:roomPin/results', getRoomResultsController);

router.delete('/rooms/:roomPin/players/:userId', leaveRoomController);

module.exports = router;

