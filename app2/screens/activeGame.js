import { navigateTo } from '../app.js';

export default async function renderActiveGame({ roomCode } = {}) {
	const app = document.getElementById('app');
	
	// Verificar el estado de la sala antes de mostrar la pantalla de juego
	const { loadRoomState } = await import('../services/roomsRealtime.js');
	const roomState = await loadRoomState(roomCode);
	
	// Si la sala no ha iniciado, volver al lobby
	if (!roomState || !roomState.room_status) {
		console.warn('Room not started yet, redirecting to lobby');
		alert('La partida aún no ha iniciado. Espera a que el moderador la inicie.');
		navigateTo('/lobby', { code: roomCode });
		return;
	}
	
 	const activePowerups = JSON.parse(localStorage.getItem('activePowerups') || '[]');
	const powerupNames = {
		guaro: 'Media',
		chicharron: 'Chichaghrrrom',
		empanada: 'Empanadirri',
		cafe: 'Café',
	};

	const powerupsBanner =
		activePowerups.length > 0
			? `
    <div style="display:flex; gap:8px; padding:8px 16px; margin-bottom:8px; overflow-x:auto; background:rgba(255,226,138,0.3);">
      <div style="font-weight:bold; color:#1e3a8a; margin-right:8px; display:flex; align-items:center;">⚡ Potenciadores:</div>
      ${activePowerups
				.map(
					(powerup) => `
        <div style="background:rgba(255,226,138,0.95); padding:6px 10px; border-radius:10px; display:flex; align-items:center; gap:6px; min-width:fit-content; border:2px solid #1e3a8a;">
          <img src="assets/images/${powerup}.png" alt="${powerup}" style="width:28px; height:28px; object-fit:contain;">
          <span style="font-size:13px; font-weight:bold; color:#1e3a8a;">${powerupNames[powerup] || powerup}</span>
        </div>
      `
				)
				.join('')}
    </div>
  `
			: '';

	// Obtener el número de pregunta actual (por defecto 1)
	let currentQuestion = window.currentQuestionIndex || 1;
	if (roomCode) {
		const savedIndex = localStorage.getItem(`room_${roomCode}_questionIndex`);
		if (savedIndex) {
			currentQuestion = parseInt(savedIndex, 10);
			window.currentQuestionIndex = currentQuestion;
			console.log(`📖 Pregunta cargada desde localStorage: ${currentQuestion}`);
		}
	}
	const totalQuestions = window.roomQuestions?.length || 5;

	app.innerHTML = `
    <div class="screen active">
      <button class="back-button" id="back-active"><div class="back-arrow"></div></button>
      <div class="main-content" style="gap:16px;">
        <div class="group4-container" style="margin-top:12px; text-align:center;">
          <img src="assets/images/Group 4.png" alt="Espaiserman" class="group4-image" style="max-width:220px;">
        </div>

        ${powerupsBanner}

        <div style="display:flex; justify-content:center; margin-top:-12px;">
          <div style="background:rgba(255,226,138,0.95); padding:8px 16px; border-radius:16px;">
            <span id="question-progress" style="font-weight:800; color:#1e3a8a; font-size:18px;">Pregunta ${currentQuestion} de ${totalQuestions}</span>
          </div>
        </div>

        <div style="background:rgba(255,255,255,0.95); border-radius:16px; padding:12px; margin:0 16px;">
          <h3 style="text-align:center; color:#1e3a8a; font-size:18px; margin-bottom:8px; font-weight:800;">🗺️ Mapa en Tiempo Real</h3>
          <div id="moderator-map" style="width:100%; height:300px; border-radius:12px; overflow:hidden; background:#e5e7eb;"></div>
          <div id="player-proximity-alerts" style="margin-top:8px; min-height:40px;"></div>
        </div>

        <div style="background:rgba(255,255,255,0.95); border-radius:16px; padding:20px; margin:0 16px;">
          <p style="text-align:center; color:#666; margin:0; font-size:16px;">Los jugadores están respondiendo...</p>
        </div>

        <div style="background:rgba(255,255,255,0.95); border-radius:16px; padding:20px; margin:0 16px;">
          <h3 style="text-align:center; color:#1e3a8a; font-size:20px; margin-bottom:16px; font-weight:800;">📊 Tabla de Posiciones en Tiempo Real</h3>
          <ol id="live-scores" style="text-align:left; line-height:32px; margin:0; list-style-position: inside; font-size:16px;"></ol>
        </div>

        <button id="btn-end-game" class="btn-primary" style="background:#E34C43; border-color:#7E1E19; max-width:320px; margin:0 auto;">Finalizar Partida</button>
      </div>
    </div>
  `;

	let currentPlayers = [];
	let subscription = null;

	// Cargar estado inicial y suscribirse a cambios
	if (roomCode) {
		const { subscribeToRoom, loadRoomState } = await import('../services/roomsRealtime.js');
		
		// Cargar estado inicial
		const initialState = await loadRoomState(roomCode);
		if (initialState && initialState.players) {
			currentPlayers = initialState.players.map((p) => ({ 
				name: p.player_name || p.name || 'Jugador', 
				score: p.score || 0 
			}));
			renderScores(currentPlayers);
		}
		
			let lastQuestionIndex = currentQuestion;
		
		const updateQuestionDisplay = () => {
			let newQuestionIndex = window.currentQuestionIndex || 1;
			if (roomCode) {
				const savedIndex = localStorage.getItem(`room_${roomCode}_questionIndex`);
				if (savedIndex) {
					const parsedIndex = parseInt(savedIndex, 10);
					if (parsedIndex !== newQuestionIndex) {
						newQuestionIndex = parsedIndex;
						window.currentQuestionIndex = newQuestionIndex;
					}
				}
			}
			const totalQuestions = window.roomQuestions?.length || 5;
			if (newQuestionIndex !== lastQuestionIndex) {
				lastQuestionIndex = newQuestionIndex;
				const questionProgressEl = document.getElementById('question-progress');
				if (questionProgressEl) {
					questionProgressEl.textContent = `Pregunta ${newQuestionIndex} de ${totalQuestions}`;
					console.log(`🔄 Pregunta actualizada a ${newQuestionIndex} de ${totalQuestions}`);
				} else {
					const questionLabel = document.querySelector('[style*="Pregunta"]');
					if (questionLabel) {
						questionLabel.textContent = `Pregunta ${newQuestionIndex} de ${totalQuestions}`;
						console.log(`🔄 Pregunta actualizada a ${newQuestionIndex} de ${totalQuestions}`);
					}
				}
			}
		};
		
		// Listener para cambios en localStorage
		const storageListener = (e) => {
			if (e.key === `room_${roomCode}_questionIndex`) {
				console.log('📢 Cambio detectado en localStorage para pregunta:', e.newValue);
				updateQuestionDisplay();
			}
		};
		window.addEventListener('storage', storageListener);
		
		const questionCheckInterval = setInterval(updateQuestionDisplay, 500);
		
		subscription = subscribeToRoom(roomCode, async (state) => {
			console.log('🔄 Cambio detectado en sala (app2 activeGame), recargando estado...');
			const updatedState = await loadRoomState(roomCode);
			if (updatedState) {
				if (updatedState.players) {
					currentPlayers = updatedState.players.map((p) => ({ 
						name: p.player_name || p.name || 'Jugador', 
						score: p.score || 0 
					}));
					console.log('📊 Players updated:', currentPlayers);
					renderScores(currentPlayers);
				}
				updateQuestionDisplay();
			}
		});
		
		window.questionCheckInterval = questionCheckInterval;
		window.storageListener = storageListener;
		
		setTimeout(() => {
			document.getElementById('back-active').addEventListener('click', () => {
				if (subscription) subscription.unsubscribe();
				if (window.questionCheckInterval) clearInterval(window.questionCheckInterval);
				if (window.storageListener) window.removeEventListener('storage', window.storageListener);
				navigateTo('/lobby', { code: roomCode });
			});
		}, 100);
	}

	function renderScores(players = []) {
		const list = document.getElementById('live-scores');
		if (!list) return;

		if (players.length === 0) {
			list.innerHTML = "<li style='text-align:center; color:#666;'>Esperando jugadores...</li>";
			return;
		}

		const uniquePlayers = [...new Map(players.map((p) => [p.name, p])).values()];
		const sorted = uniquePlayers.sort((a, b) => b.score - a.score);

		list.innerHTML = '';
		sorted.forEach((p, idx) => {
			const li = document.createElement('li');
			li.style.padding = '4px 0';
			li.style.borderBottom = idx < sorted.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none';
			li.innerHTML = `${p.name} - <strong style="color:#11A36B;">${p.score}</strong> pts`;
			if (idx === 0) li.style.color = '#E34C43';
			list.appendChild(li);
		});
	}

	let locationSubscription = null;
	let map = null;
	let playerMarkers = {};
	let questionMarkers = [];

	setTimeout(async () => {
		renderScores(currentPlayers);

		if (window.L) {
			let mapPoints = window.roomMapPoints;
			if (!mapPoints && roomState && roomState.map_points) {
				mapPoints = roomState.map_points;
				window.roomMapPoints = mapPoints;
			}
			if (!mapPoints) {
				mapPoints = [
					{ name: 'Edificio A', coords: [3.3435, -76.533], questionNumber: 1 },
					{ name: 'Biblioteca', coords: [3.3438, -76.5332], questionNumber: 2 },
					{ name: 'Cafetería', coords: [3.3442, -76.5328], questionNumber: 3 },
					{ name: 'Auditorio', coords: [3.3439, -76.5325], questionNumber: 4 },
					{ name: 'Laboratorios', coords: [3.3445, -76.533], questionNumber: 5 },
				];
			}
			initModeratorMap(roomCode, mapPoints);
		}

		const { subscribeToPlayerLocations } = await import('../services/playerLocationsRealtime.js');
		locationSubscription = subscribeToPlayerLocations(roomCode, (locations) => {
			let mapPoints = window.roomMapPoints;
			if (!mapPoints) {
				mapPoints = [
					{ name: 'Edificio A', coords: [3.3435, -76.533], questionNumber: 1 },
					{ name: 'Biblioteca', coords: [3.3438, -76.5332], questionNumber: 2 },
					{ name: 'Cafetería', coords: [3.3442, -76.5328], questionNumber: 3 },
					{ name: 'Auditorio', coords: [3.3439, -76.5325], questionNumber: 4 },
					{ name: 'Laboratorios', coords: [3.3445, -76.533], questionNumber: 5 },
				];
			}
			updatePlayerMarkers(locations, mapPoints);
		});

		document.getElementById('back-active').addEventListener('click', () => {
			if (subscription) subscription.unsubscribe();
			if (locationSubscription) locationSubscription.unsubscribe();
			if (window.questionCheckInterval) clearInterval(window.questionCheckInterval);
			if (window.storageListener) window.removeEventListener('storage', window.storageListener);
			navigateTo('/lobby', { code: roomCode });
		});

		document.getElementById('btn-end-game').addEventListener('click', async () => {
			if (confirm('¿Estás seguro de que quieres finalizar la partida? Todos los jugadores serán redirigidos a los resultados.')) {
				try {
					const { endRoomAPI } = await import('../services/roomsRealtime.js');
					await endRoomAPI(roomCode, window.memoryState.currentUserId);
					if (locationSubscription) locationSubscription.unsubscribe();
					navigateTo('/results', { results: currentPlayers });
				} catch (error) {
					console.error('Error finalizando partida:', error);
					alert('Error al finalizar la partida. Redirigiendo de todas formas...');
					if (locationSubscription) locationSubscription.unsubscribe();
					navigateTo('/results', { results: currentPlayers });
				}
			}
		});
	}, 100);

	function initModeratorMap(roomCode, points) {
		const mapDiv = document.getElementById('moderator-map');
		if (!mapDiv || !window.L) return;

		const icesiCoords = [3.344, -76.5329];

		map = L.map(mapDiv, {
			dragging: true,
			touchZoom: true,
			scrollWheelZoom: true,
			doubleClickZoom: true,
			boxZoom: false,
			keyboard: false,
		}).setView(icesiCoords, 17);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap contributors',
		}).addTo(map);

		points.forEach((point, idx) => {
			const icon = L.divIcon({
				className: 'custom-question-marker',
				html: `<div style="background-color: #FFE28A; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #1e3a8a; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><span style="color: #1e3a8a; font-weight: bold; font-size: 16px;">${point.questionNumber || idx + 1}</span></div>`,
				iconSize: [40, 40],
				iconAnchor: [20, 20],
			});

			const marker = L.marker(point.coords, { icon: icon }).addTo(map);
			marker.bindPopup(`
				<div style="text-align:center; padding:8px; min-width:120px;">
					<strong style="font-size:16px; color:#1e3a8a;">${point.name}</strong><br/>
					<small style="color:#666;">Pregunta ${point.questionNumber || idx + 1}</small>
				</div>
			`);
			questionMarkers.push(marker);
		});
	}

	async function updatePlayerMarkers(locations, points) {
		if (!map || !window.L) return;

		const { isPlayerNearPoint, findNearestPoint } = await import('../services/playerLocationsRealtime.js');

		if (!locations || locations.length === 0) {
			Object.values(playerMarkers).forEach(marker => {
				map.removeLayer(marker);
			});
			playerMarkers = {};
			const alertsDiv = document.getElementById('player-proximity-alerts');
			if (alertsDiv) {
				alertsDiv.innerHTML = '<div style="color:#666; font-size:12px; text-align:center; padding:8px;">Esperando ubicaciones de jugadores...</div>';
			}
			return;
		}

		Object.values(playerMarkers).forEach(marker => {
			if (marker && map.hasLayer(marker)) {
				map.removeLayer(marker);
			}
		});
		playerMarkers = {};

		const alertsDiv = document.getElementById('player-proximity-alerts');
		if (alertsDiv) {
			alertsDiv.innerHTML = '';
		}

		const proximityAlerts = [];

		locations.forEach((location) => {
			if (!location.latitude || !location.longitude) return;

			const playerIcon = L.divIcon({
				className: 'player-marker',
				html: `<div style="background-color: #11A36B; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"><span style="color: white; font-weight: bold; font-size: 12px;">👤</span></div>`,
				iconSize: [32, 32],
				iconAnchor: [16, 16],
			});

			const marker = L.marker([location.latitude, location.longitude], { icon: playerIcon }).addTo(map);

			const nearestPoint = findNearestPoint(location.latitude, location.longitude, points);
			const isNear = nearestPoint && nearestPoint.distance <= 18;

			let popupContent = `
				<div style="text-align:center; padding:8px; min-width:150px;">
					<strong style="font-size:14px; color:#1e3a8a;">${location.player_name || 'Jugador'}</strong><br/>
			`;

			if (nearestPoint) {
				const distance = Math.round(nearestPoint.distance);
				if (isNear) {
					popupContent += `<span style="color:#11A36B; font-weight:bold;">📍 Cerca de: ${nearestPoint.name}</span><br/>`;
					popupContent += `<small style="color:#11A36B;">A ${distance}m (≤18m)</small>`;

					proximityAlerts.push({
						player: location.player_name || 'Jugador',
						point: nearestPoint.name,
						distance: distance
					});
				} else {
					popupContent += `<small style="color:#666;">Más cercano: ${nearestPoint.name}</small><br/>`;
					popupContent += `<small style="color:#666;">A ${distance}m</small>`;
				}
			}

			popupContent += `</div>`;
			marker.bindPopup(popupContent);

			playerMarkers[location.player_name] = marker;
		});

		if (alertsDiv && proximityAlerts.length > 0) {
			alertsDiv.innerHTML = proximityAlerts.map(alert => `
				<div style="background:#11A36B; color:white; padding:8px 12px; border-radius:8px; margin-bottom:4px; font-size:13px; font-weight:bold;">
					✅ ${alert.player} está cerca de ${alert.point} (${alert.distance}m)
				</div>
			`).join('');
		} else if (alertsDiv) {
			alertsDiv.innerHTML = '<div style="color:#666; font-size:12px; text-align:center; padding:8px;">Ningún jugador cerca de los puntos aún</div>';
		}
	}
}
