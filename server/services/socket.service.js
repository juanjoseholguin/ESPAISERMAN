const { Server } = require("socket.io");

let io;
// Estado simple en memoria para las salas
const rooms = new Map(); // code -> { hostId, players: [{id,name}], createdAt }

function generateRoomCode() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

const initSocketInstance = (httpServer) => {
  io = new Server(httpServer, {
    path: "/real-time",
    cors: { origin: "*" },
    maxHttpBufferSize: 1e8, // 100MB
    pingTimeout: 60000,
    transports: ['polling', 'websocket']
  });

  io.on("connection", (socket) => {
    // Crear sala
    socket.on("room:create", ({ code, host, category, maxParticipants, timePerQuestion, questions }) => {
      if (!rooms.has(code)) {
        rooms.set(code, { 
          hostId: socket.id, 
          players: [], 
          createdAt: Date.now(),
          host,
          category,
          maxParticipants,
          timePerQuestion,
          questions: questions || []
        });
        socket.join(code);
        socket.emit("room:created", { code });
        io.to(code).emit("room:state", { code, ...rooms.get(code) });
      }
    });

    // Unirse a sala
    socket.on("room:join", ({ code, playerName, avatar_url, avatar_bg, isModerator }) => {
      const room = rooms.get(code);
      if (!room) {
        socket.emit("room:error", { message: "Sala no existe" });
        return;
      }
      
      const alreadyJoined = room.players.some(p => p.id === socket.id);
      if (alreadyJoined) {
        console.log(`Socket ${socket.id} already in room ${code}`);
        io.to(code).emit("room:state", { code, ...room });
        socket.emit("room:joined", { code });
        return;
      }
      
      if (isModerator) {
        socket.join(code);
        console.log(`Moderator ${playerName} joined room ${code}`);
        io.to(code).emit("room:state", { code, ...room });
        socket.emit("room:joined", { code });
        return;
      }
      
      if (room.players.length >= room.maxParticipants) {
        socket.emit("room:error", { message: `Sala llena (${room.maxParticipants} jugadores máximo)` });
        return;
      }
      
      socket.join(code);
      room.players.push({ 
        id: socket.id, 
        name: playerName,
        avatar_url: avatar_url || '/assets/images/Group 4.png',
        avatar_bg: avatar_bg || '#F9D648',
        score: 0
      });
      
      console.log(`Player ${playerName} (${socket.id}) joined room ${code}. Total: ${room.players.length}/${room.maxParticipants}`);
      io.to(code).emit("room:state", { code, ...room });
      socket.emit("room:joined", { code });
    });

    // Iniciar juego (solo host)
    socket.on("room:start", ({ code }) => {
      const room = rooms.get(code);
      if (!room) return;
      if (room.hostId !== socket.id) return;
      // Enviar solo IDs para evitar payload too large
      const questionIds = room.questions?.map(q => q.id) || [];
      io.to(code).emit("room:started", { code, questionIds });
    });
    
    // Solicitar estado de sala
    socket.on("room:state-request", ({ code }) => {
      const room = rooms.get(code);
      if (room) {
        const roomState = { code, ...room };
        socket.emit("room:state", roomState);
      }
    });
    
    // Respuesta de jugador
    socket.on("player:answer", ({ roomCode, correct, playerName }) => {
      const room = rooms.get(roomCode);
      if (room) {
        const player = room.players.find(p => p.name === playerName);
        if (player) {
          player.score = (player.score || 0) + (correct ? 100 : 0);
          io.to(roomCode).emit("room:state", { code: roomCode, ...room });
        }
      }
    });
    
    // Solicitar resultados finales
    socket.on("request-final-results", ({ roomCode }) => {
      const room = rooms.get(roomCode);
      if (room) {
        const results = room.players.map(p => ({ name: p.name, score: p.score || 0 }));
        socket.emit("room:final-results", results);
      }
    });

    // Desconexión: remover jugador
    socket.on("disconnect", () => {
      for (const [code, room] of rooms) {
        const idx = room.players.findIndex((p) => p.id === socket.id);
        if (idx !== -1) {
          room.players.splice(idx, 1);
          if (room.players.length === 0) {
            rooms.delete(code);
          } else {
            // si era host, pasar host al primer jugador
            if (room.hostId === socket.id) {
              room.hostId = room.players[0]?.id;
            }
            io.to(code).emit("room:state", { code, ...room });
          }
        }
      }
    });
  });
};

const emitEvent = (eventName, data) => {
  if (!io) throw new Error("Socket.io instance is not initialized");
  io.emit(eventName, data);
};

module.exports = { emitEvent, initSocketInstance };
