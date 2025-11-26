import renderSplashLoginRegister from "./screens/screen1.js";
import renderMainMenu from "./screens/mainMenu.js";
import renderJoinRoom from "./screens/joinRoom.js";
import renderCreateRoom from "./screens/createRoom.js";
import renderLobby from "./screens/lobby.js";
import { renderProfileEdit } from "./screens/profileEdit.js";
import renderShop from "./screens/shop.js";
import renderMapScreen from "./screens/mapScreen.js";
import renderActiveGame from "./screens/activeGame.js";
import renderCorrectAnswer from "./screens/correctAnswer.js";
import renderWrongAnswer from "./screens/wrongAnswer.js";
import renderGameResults from "./screens/gameResults.js";

const socket = io("/", { path: "/real-time" });
window.socket = socket;

// Configurar Supabase para Realtime (se configuran desde index.html)
// Estas variables se deben definir en index.html antes de cargar este script
if (typeof window.SUPABASE_URL === 'undefined') {
  console.warn('⚠️ SUPABASE_URL no está definido. Realtime no funcionará.');
}
if (typeof window.SUPABASE_ANON_KEY === 'undefined') {
  console.warn('⚠️ SUPABASE_ANON_KEY no está definido. Realtime no funcionará.');
}

const memoryState = {
  rooms: new Map(),
  currentUserId: null,
  currentUser: null,
  currentUserAvatar: null,
  currentUserBgColor: null,
  inventory: [],
  roomConfig: null,
  currentUserCoins: 0,
};
window.memoryState = memoryState;

function clearScripts() {
  document.getElementById("app").innerHTML = "";
}

let route = { path: "/", data: {} };
const savedUser = localStorage.getItem('currentUser');
const savedUserId = localStorage.getItem('currentUserId');
const savedCoins = localStorage.getItem('currentUserCoins');
const savedAvatar = localStorage.getItem('currentUserAvatar');
const savedBgColor = localStorage.getItem('currentUserBgColor');

if (savedUser && savedUserId) {
  memoryState.currentUser = savedUser;
  memoryState.currentUserId = parseInt(savedUserId, 10);
  if (savedCoins) memoryState.currentUserCoins = parseInt(savedCoins, 10);
  memoryState.currentUserAvatar = savedAvatar || 'assets/images/Group 4.png';
  memoryState.currentUserBgColor = savedBgColor || '#F9D648';
  route = { path: "/main", data: {} };
} else {
  route = { path: "/", data: {} };
}
renderRoute(route);

function renderRoute(currentRoute) {
  switch (currentRoute?.path) {
    case "/":
      clearScripts();
      renderSplashLoginRegister(currentRoute?.data);
      break;
    case "/main":
      clearScripts();
      renderMainMenu(currentRoute?.data);
      break;
    case "/join":
      clearScripts();
      renderJoinRoom(currentRoute?.data);
      break;
    case "/create":
      clearScripts();
      renderCreateRoom(currentRoute?.data);
      break;
    case "/profile":
      clearScripts();
      renderProfileEdit(currentRoute?.data);
      break;
    case "/shop":
      clearScripts();
      renderShop(currentRoute?.data);
      break;
    case "/lobby":
      clearScripts();
      renderLobby(currentRoute?.data);
      break;
    case "/map":
      clearScripts();
      renderMapScreen(currentRoute?.data);
      break;
    case "/active":
      clearScripts();
      renderActiveGame(currentRoute?.data);
      break;
    case "/correct-answer":
      clearScripts();
      renderCorrectAnswer(currentRoute?.data);
      break;
    case "/wrong-answer":
      clearScripts();
      renderWrongAnswer(currentRoute?.data);
      break;
    case "/results":
      clearScripts();
      renderGameResults(currentRoute?.data);
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

function createRoom() {
  const code = generateRoomCode();
  memoryState.rooms.set(code, { createdAt: Date.now(), players: [] });
  return code;
}

function joinRoom(code, playerName) {
  const room = memoryState.rooms.get(code);
  if (!room) return { ok: false, error: "Sala no existe" };
  room.players.push(playerName || "Invitado");
  return { ok: true, room };
}

async function updateCoins(delta) {
  if (!memoryState.currentUserId) {
    console.warn('⚠️ No hay currentUserId para actualizar monedas');
    return null;
  }
  
  const currentLocalCoins = memoryState.currentUserCoins || 0;
  console.log('💰 updateCoins llamado:', { delta, currentLocal: currentLocalCoins, userId: memoryState.currentUserId });
  
  try {
    const response = await makeRequest(`/users/${memoryState.currentUserId}/coins`, "PATCH", { delta });
    if (response?.success && response.coins !== undefined) {
      const serverCoins = response.coins;
      const finalCoins = Math.max(currentLocalCoins, serverCoins);
      memoryState.currentUserCoins = finalCoins;
      localStorage.setItem('currentUserCoins', finalCoins.toString());
      console.log('✅ updateCoins exitoso:', { delta, currentLocal: currentLocalCoins, server: serverCoins, final: finalCoins });
    } else {
      console.warn('⚠️ updateCoins: respuesta sin éxito o sin coins:', response);
    }
    return response;
  } catch (error) {
    console.error('❌ Error en updateCoins:', error);
    return { error: error.message };
  }
}

async function makeRequest(url, method = "GET", body) {
  const BASE_URL = "http://localhost:5050";
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

export { navigateTo, socket, makeRequest, createRoom, joinRoom, memoryState, updateCoins };
