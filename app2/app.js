import renderScreen1 from "./screens/screen1.js";
import renderCreateRoom from "./screens/createRoom.js";
import renderLobby from "./screens/lobby.js";
import renderDistributeQuestions from "./screens/distributeQuestions.js";
import renderGameResults from "./screens/gameResults.js";
import { renderProfileEdit } from "./screens/profileEdit.js";
import renderActiveGame from "./screens/activeGame.js";

const socket = io("/", { path: "/real-time" });
window.socket = socket;

const memoryState = {
  rooms: new Map(),
  currentUser: null,
  currentUserAvatar: null,
  currentUserBgColor: null,
  roomCode: null,
  selectedCategory: null,
  participants: null,
  timePerQuestion: null
};
window.memoryState = memoryState;

function clearScripts() {
  document.getElementById("app").innerHTML = "";
}

let route = { path: "/", data: {} };
const savedUser = localStorage.getItem('currentUser');
if (savedUser) {
  memoryState.currentUser = savedUser;
  route = { path: "/create", data: {} };
}
renderRoute(route);

function renderRoute(currentRoute) {
  switch (currentRoute?.path) {
    case "/":
      clearScripts();
      renderScreen1(currentRoute?.data);
      break;
    case "/create":
      clearScripts();
      renderCreateRoom(currentRoute?.data);
      break;
    case "/lobby":
      clearScripts();
      renderLobby(currentRoute?.data);
      break;
    case "/distribute":
      clearScripts();
      renderDistributeQuestions(currentRoute?.data);
      break;
    case "/results":
      clearScripts();
      renderGameResults(currentRoute?.data);
      break;
    case "/active":
      clearScripts();
      renderActiveGame(currentRoute?.data);
      break;
    case "/profile":
      clearScripts();
      renderProfileEdit(currentRoute?.data);
      break;
    default:
      const app = document.getElementById("app");
      app.innerHTML = `<h1>404 - Not Found</h1><p>The page you are looking for does not exist.</p>`;
  }
}

function navigateTo(path, data) {
  route = { path, data };
  renderRoute(route);
}

function generateRoomCode() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

async function makeRequest(url, method, body) {
  const BASE_URL = "http://localhost:5050";
  let response = await fetch(`${BASE_URL}${url}`, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  response = await response.json();
  return response;
}

export { navigateTo, socket, makeRequest, generateRoomCode, memoryState };
