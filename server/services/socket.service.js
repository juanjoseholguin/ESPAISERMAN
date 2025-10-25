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
  });

  io.on("connection", (socket) => {
    // Crear sala
    socket.on("room:create", ({ code, host, categoryId, maxParticipants, timePerQuestion, numQuestions }) => {
      if (!rooms.has(code)) {
        rooms.set(code, { 
          hostId: socket.id, 
          players: [], 
          createdAt: Date.now(),
          host,
          categoryId,
          maxParticipants,
          timePerQuestion,
          numQuestions
        });
        socket.join(code);
        socket.emit("room:created", { code });
        io.to(code).emit("room:state", { code, ...rooms.get(code) });
      }
    });

    // Unirse a sala
    socket.on("room:join", ({ code, playerName, avatar_url, avatar_bg }) => {
      const room = rooms.get(code);
      if (!room) {
        socket.emit("room:error", { message: "Sala no existe" });
        return;
      }
      socket.join(code);
      room.players.push({ 
        id: socket.id, 
        name: playerName,
        avatar_url: avatar_url || '/assets/images/Group 4.png',
        avatar_bg: avatar_bg || '#F9D648'
      });
      io.to(code).emit("room:state", { code, ...room });
      socket.emit("room:joined", { code });
    });

    // Iniciar juego (solo host)
    socket.on("room:start", ({ code }) => {
      const room = rooms.get(code);
      if (!room) return;
      if (room.hostId !== socket.id) return;
      io.to(code).emit("room:started", { code });
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
