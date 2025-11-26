import renderScreen1 from "./screens/screen1.js";
import renderCreateRoom from "./screens/createRoom.js";
import renderLobby from "./screens/lobby.js";
import renderDistributeQuestions from "./screens/distributeQuestions.js";
import renderGameResults from "./screens/gameResults.js";
import { renderProfileEdit } from "./screens/profileEdit.js";
import renderActiveGame from "./screens/activeGame.js";

const socket = io("https://espaiserman-2yll.vercel.app", { path: "/real-time" });
window.socket = socket;

const memoryState = {
  rooms: new Map(),
  currentUserId: null,
  currentUser: null,
  currentUserCoins: 0,
  inventory: [],
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
const savedUserId = localStorage.getItem('currentUserId');
const savedCoins = localStorage.getItem('currentUserCoins');
if (savedUser && savedUserId) {
  memoryState.currentUser = savedUser;
  memoryState.currentUserId = parseInt(savedUserId, 10);
  memoryState.currentUserCoins = parseInt(savedCoins ?? "0", 10);
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

async function makeRequest(url, method = "GET", body) {
  const BASE_URL = "https://espaiserman-2yll.vercel.app";
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  let response = await fetch(`${BASE_URL}${url}`, options);
  response = await response.json();
  return response;
}

export { navigateTo, socket, makeRequest, generateRoomCode, memoryState };
