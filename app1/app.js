import renderSplashLoginRegister from './screens/screen1.js';
import renderMainMenu from './screens/mainMenu.js';
import renderJoinRoom from './screens/joinRoom.js';
import renderCreateRoom from './screens/createRoom.js';
import renderLobby from './screens/lobby.js';
import { renderCategorySelection } from './screens/categorySelection.js';
import { renderProfileEdit } from './screens/profileEdit.js';
import renderShop from './screens/shop.js';
import renderMapScreen from './screens/mapScreen.js';

const socket = io('/', { path: '/real-time' });

const savedCoins = localStorage.getItem('espaiserman_coins');
const initialCoins = savedCoins !== null ? parseInt(savedCoins, 10) : 1000;

const savedUsername = localStorage.getItem('espaiserman_username');
const savedAvatar = localStorage.getItem('espaiserman_avatar');
const savedBgColor = localStorage.getItem('espaiserman_bg_color');
const savedPassword = localStorage.getItem('espaiserman_password');

const memoryState = {
	rooms: new Map(),
	currentUser: savedUsername || null,
	currentUserAvatar: savedAvatar || null,
	currentUserBgColor: savedBgColor || null,
	currentUserPassword: savedPassword || null,
	currentUserCoins: initialCoins,
	roomConfig: null,
};
window.memoryState = memoryState;

function clearScripts() {
	document.getElementById('app').innerHTML = '';
}

let route = { path: '/', data: {} };
renderRoute(route);

function renderRoute(currentRoute) {
	switch (currentRoute?.path) {
		case '/':
			clearScripts();
			renderSplashLoginRegister(currentRoute?.data);
			break;
		case '/main':
			clearScripts();
			renderMainMenu(currentRoute?.data);
			break;
		case '/join':
			clearScripts();
			renderJoinRoom(currentRoute?.data);
			break;
		case '/create':
			clearScripts();
			renderCreateRoom(currentRoute?.data);
			break;
		case '/profile':
			clearScripts();
			renderProfileEdit(currentRoute?.data);
			break;
		case '/shop':
			clearScripts();
			renderShop(currentRoute?.data);
			break;
		case '/lobby':
			clearScripts();
			renderLobby(currentRoute?.data);
			break;
		case '/map':
			clearScripts();
			renderMapScreen(currentRoute?.data);
			break;
		default:
			const app = document.getElementById('app');
			app.innerHTML = `<h1>404 - Not Found</h1><p>The page you are looking for does not exist.</p>`;
	}
}

function navigateTo(path, data) {
	route = { path, data };
	renderRoute(route);
}

function generateRoomCode() {
	const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
	let code = '';
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
	if (!room) return { ok: false, error: 'Sala no existe' };
	room.players.push(playerName || 'Invitado');
	return { ok: true, room };
}

async function makeRequest(url, method, body) {
	const BASE_URL = 'http://localhost:5050';
	try {
		let response = await fetch(`${BASE_URL}${url}`, {
			method: method,
			headers: {
				'Content-Type': 'application/json',
			},
			body: body ? JSON.stringify(body) : undefined,
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
			console.error(`❌ Error HTTP ${response.status}:`, errorData);
			throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('❌ Error en makeRequest:', error);
		throw error;
	}
}

function renderCoinCounter() {
	const coins = memoryState.currentUserCoins || 0;
	return `
    <div class="coin-counter">
      <span class="coin-icon">🪙</span>
      <span class="coin-amount">${coins}</span>
    </div>
  `;
}

function updateCoins(amount) {
	memoryState.currentUserCoins = amount;
	localStorage.setItem('espaiserman_coins', amount.toString());

	const coinAmountEl = document.querySelector('.coin-amount');
	if (coinAmountEl) {
		coinAmountEl.textContent = amount;
	}
}

function addCoins(amount) {
	const newTotal = memoryState.currentUserCoins + amount;
	updateCoins(newTotal);
	return newTotal;
}

function subtractCoins(amount) {
	const newTotal = Math.max(0, memoryState.currentUserCoins - amount);
	updateCoins(newTotal);
	return newTotal;
}

function updateUsername(username) {
	memoryState.currentUser = username;
	localStorage.setItem('espaiserman_username', username);
}

function updateAvatar(avatarUrl) {
	memoryState.currentUserAvatar = avatarUrl;
	localStorage.setItem('espaiserman_avatar', avatarUrl);
}

function updateBgColor(color) {
	memoryState.currentUserBgColor = color;
	localStorage.setItem('espaiserman_bg_color', color);
}

function updatePassword(password) {
	memoryState.currentUserPassword = password;
	localStorage.setItem('espaiserman_password', password);
}
window.generateRoomCode = generateRoomCode;
window.navigateTo = navigateTo;
window.socket = socket;
window.updateCoins = updateCoins;
window.addCoins = addCoins;
window.subtractCoins = subtractCoins;
window.updateUsername = updateUsername;
window.updateAvatar = updateAvatar;
window.updateBgColor = updateBgColor;
window.updatePassword = updatePassword;

export {
	navigateTo,
	socket,
	makeRequest,
	createRoom,
	joinRoom,
	memoryState,
	generateRoomCode,
	renderCoinCounter,
	updateCoins,
	addCoins,
	subtractCoins,
	updateUsername,
	updateAvatar,
	updateBgColor,
	updatePassword,
};
