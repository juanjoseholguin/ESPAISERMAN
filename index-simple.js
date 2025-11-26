require('dotenv').config();
const express = require("express");
const path = require("path");
const { createServer } = require("http");
const cors = require("cors");

const usersRouter = require("./server/routes/users-simple.router");

const PORT = process.env.PORT || 5050;

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());
app.use("/app1", express.static(path.join(__dirname, "app1")));
app.use("/app2", express.static(path.join(__dirname, "app2")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
  res.json({
    message: "Espaiserman Trivia Server (Simple) is running!",
    endpoints: {
      app1: "http://localhost:5050/app1",
      app2: "http://localhost:5050/app2",
      users: "http://localhost:5050/users"
    }
  });
});

app.use("/", usersRouter);

httpServer.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
