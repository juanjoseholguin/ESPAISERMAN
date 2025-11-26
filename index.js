require('dotenv').config();
const express = require("express");
const path = require("path");
const { createServer } = require("http");
const cors = require("cors");

const usersRouter = require("./server/routes/users.router");
const boostersRouter = require("./server/routes/boosters.router");
const questionsRouter = require("./server/routes/questions.router");
const categoriesRouter = require("./server/routes/categories.router");
const roomsRouter = require("./server/routes/rooms.router");

const PORT = process.env.PORT || 5050;

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use("/app1", express.static(path.join(__dirname, "app1")));
app.use("/app2", express.static(path.join(__dirname, "app2")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
  res.json({
    message: "Espaiserman Trivia Server is running!",
    endpoints: {
      app1: "http://localhost:5050/app1",
      app2: "http://localhost:5050/app2",
      users: "http://localhost:5050/users"
    }
  });
});

app.get("/app2/*", (req, res) => {
  res.sendFile(path.join(__dirname, "app2", "index.html"));
});

app.use("/", usersRouter);
app.use("/", boostersRouter);
app.use("/", questionsRouter);
app.use("/", categoriesRouter);
app.use("/", roomsRouter);

httpServer.listen(PORT, '0.0.0.0', () => {
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  let localIP = 'localhost';

  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
    if (localIP !== 'localhost') break;
  }

  console.log(`\n🚀 Server running!`);
  console.log(`📱 App 1 (Jugadores): http://${localIP}:${PORT}/app1`);
  console.log(`💻 App 2 (Moderador): http://${localIP}:${PORT}/app2`);
  console.log(`🌐 Local: http://localhost:${PORT}\n`);
});