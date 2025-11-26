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
  memoryState.currentUserAvatar = savedAvatar || '/assets/images/Group 4.png';
  memoryState.currentUserBgColor = savedBgColor || '#F9D648';

  // Cargar inventario desde el servidor al iniciar la app
  (async () => {
    try {
      const response = await fetch(`${window.location.origin}/users/${memoryState.currentUserId}/boosters`);
      if (response.ok) {
        const data = await response.json();
        if (data?.success && data.inventory) {
          memoryState.inventory = data.inventory;
          console.log('✅ Inventario cargado al iniciar app:', memoryState.inventory);
        }
      }
    } catch (error) {
      console.warn('⚠️ No se pudo cargar el inventario al iniciar:', error);
    }
  })();

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
  if (!memoryState.currentUserId) return;
  // Obtener el valor actual (que ya debería estar actualizado localmente)
  const currentLocalCoins = memoryState.currentUserCoins || 0;
  const response = await makeRequest(`/users/${memoryState.currentUserId}/coins`, "PATCH", { delta });
  if (response?.success && response.coins !== undefined) {
    // Usar el valor MÁS ALTO entre el local actual y el del servidor
    // NO sumar el delta de nuevo porque ya se sumó localmente
    const serverCoins = response.coins;
    const finalCoins = Math.max(currentLocalCoins, serverCoins);
    memoryState.currentUserCoins = finalCoins;
    localStorage.setItem('currentUserCoins', finalCoins.toString());
    console.log('🔄 updateCoins:', { delta, currentLocal: currentLocalCoins, server: serverCoins, final: finalCoins });
  }
  return response;
}

async function makeRequest(url, method = "GET", body) {
  const BASE_URL = window.location.origin;
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

export { navigateTo, makeRequest, createRoom, joinRoom, memoryState, updateCoins };
