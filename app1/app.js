import renderSplashLoginRegister from "./screens/screen1.js";
import renderMainMenu from "./screens/mainMenu.js";
import renderJoinRoom from "./screens/joinRoom.js";
import renderCreateRoom from "./screens/createRoom.js";
import renderForgotPassword from "./screens/forgotPassword.js";
import renderLobby from "./screens/lobby.js";
import { renderChangePassword } from "./screens/changePassword.js";
import { renderCategorySelection } from "./screens/categorySelection.js";
import { renderProfileEdit } from "./screens/profileEdit.js";
import renderShop from "./screens/shop.js";
import renderMapScreen from "./screens/mapScreen.js";

const socket = io("/", { path: "/real-time" });

// Estado simple en memoria para demo (rooms type Among Us)
const memoryState = {
  rooms: new Map(), // roomCode -> { createdAt, players: [] }
  currentUser: null,
  currentUserAvatar: null,
  currentUserBgColor: null,
  roomConfig: null
};
// Exponer por si se requiere depurar en el navegador
window.memoryState = memoryState;

function clearScripts() {
  document.getElementById("app").innerHTML = "";
}

let route = { path: "/", data: {} };
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
    case "/forgot":
      clearScripts();
      renderForgotPassword(currentRoute?.data);
      break;
    case "/change-password":
      clearScripts();
      renderChangePassword(currentRoute?.data);
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

async function makeRequest(url, method, body) {
  const BASE_URL = "http://localhost:5050";
  try {
    let response = await fetch(`${BASE_URL}${url}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      console.error(`❌ Error HTTP ${response.status}:`, errorData);
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error en makeRequest:", error);
    throw error;
  }
}

// Exponer generateRoomCode globalmente
window.generateRoomCode = generateRoomCode;
window.navigateTo = navigateTo;
window.socket = socket;

export { navigateTo, socket, makeRequest, createRoom, joinRoom, memoryState, generateRoomCode };
