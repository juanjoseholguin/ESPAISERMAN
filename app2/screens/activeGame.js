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
          <img src="/assets/images/${powerup}.png" alt="${powerup}" style="width:28px; height:28px; object-fit:contain;">
          <span style="font-size:13px; font-weight:bold; color:#1e3a8a;">${powerupNames[powerup] || powerup}</span>
        </div>
      `
				)
				.join('')}
    </div>
  `
			: '';

	// Inicializar jugadores desde el estado de la sala
	let currentPlayers = (roomState && roomState.players)
		? roomState.players.map((p) => ({
			name: p.player_name || p.name || 'Jugador',
			score: p.score || 0
		}))
		: [];

	// Calcular pregunta actual basado en el score de los jugadores
	// Cada pregunta correcta = 100 puntos, así que score/100 = preguntas correctas
	// La pregunta actual es la siguiente (preguntas correctas + 1)
	const totalQuestions = window.roomQuestions?.length || 5;

	function calculateCurrentQuestion(players) {
		if (!players || players.length === 0) return 1;

		// Obtener el jugador con más progreso (más score)
		const maxScore = Math.max(...players.map(p => p.score || 0));
		const questionsAnswered = Math.floor(maxScore / 100);
		const currentQuestion = Math.min(questionsAnswered + 1, totalQuestions);
		return currentQuestion;
	}

	let currentQuestion = calculateCurrentQuestion(currentPlayers);

	// Cargar puntos del mapa desde el estado de la sala
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

	app.innerHTML = `
    <div class="screen active">
      <button class="back-button" id="back-active"><div class="back-arrow"></div></button>
      <div class="main-content" style="gap:16px;">
        <div class="group4-container" style="margin-top:12px; text-align:center;">
          <img src="/assets/images/Group 4.png" alt="Espaiserman" class="group4-image" style="max-width:220px;">
        </div>

        ${powerupsBanner}

        <div style="display:flex; justify-content:center; margin-top:-12px;">
          <div style="background:rgba(255,226,138,0.95); padding:8px 16px; border-radius:16px;">
            <span style="font-weight:800; color:#1e3a8a; font-size:18px;">Pregunta ${currentQuestion} de ${totalQuestions}</span>
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

	let subscription = null;

	// Cargar estado inicial y suscribirse a cambios
	if (roomCode) {
		const { subscribeToRoom, loadRoomState } = await import('../services/roomsRealtime.js');

		// Cargar estado inicial (ya tenemos currentPlayers inicializado arriba)
		const initialState = await loadRoomState(roomCode);
		if (initialState && initialState.players) {
			currentPlayers = initialState.players.map((p) => ({
				name: p.player_name || p.name || 'Jugador',
				score: p.score || 0
			}));
			renderScores(currentPlayers);
		}

		// Suscribirse a cambios en tiempo real
		subscription = subscribeToRoom(roomCode, async (updatedState) => {
			console.log('🔄 Cambio detectado en sala (app2 activeGame), actualizando estado...');
			// El estado ya viene actualizado del callback
			if (updatedState && updatedState.players) {
				currentPlayers = updatedState.players.map((p) => ({
					name: p.player_name || p.name || 'Jugador',
					score: p.score || 0
				}));
				console.log('📊 Players updated:', currentPlayers);
				renderScores(currentPlayers);
			}
		});

		// Actualizar contador de pregunta inicialmente
		updateQuestionCounter();
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

		// Calcular pregunta actual basado en el progreso
		const maxScore = sorted.length > 0 ? Math.max(...sorted.map(p => p.score || 0)) : 0;
		const questionsAnswered = Math.floor(maxScore / 100);
		const newCurrentQuestion = Math.min(questionsAnswered + 1, totalQuestions);

		// Actualizar pregunta actual si cambió
		if (newCurrentQuestion !== currentQuestion) {
			currentQuestion = newCurrentQuestion;
			updateQuestionCounter();
		}

		list.innerHTML = '';
		sorted.forEach((p, idx) => {
			const li = document.createElement('li');
			li.style.padding = '4px 0';
			li.style.borderBottom = idx < sorted.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none';

			// Calcular progreso del jugador
			const playerQuestionsAnswered = Math.floor((p.score || 0) / 100);
			const playerCurrentQuestion = Math.min(playerQuestionsAnswered + 1, totalQuestions);

			li.innerHTML = `${p.name} - <strong style="color:#11A36B;">${p.score}</strong> pts <small style="color:#666;">(Pregunta ${playerCurrentQuestion}/${totalQuestions})</small>`;
			if (idx === 0) li.style.color = '#E34C43';
			list.appendChild(li);
		});
	}

	function updateQuestionCounter() {
		// Buscar el span que contiene "Pregunta X de Y"
		const allSpans = document.querySelectorAll('.main-content span');
		allSpans.forEach(el => {
			if (el.textContent.includes('Pregunta') && el.textContent.includes('de')) {
				el.textContent = `Pregunta ${currentQuestion} de ${totalQuestions}`;
			}
		});
	}

	let locationSubscription = null;
	let map = null;
	let playerMarkers = {};
	let questionMarkers = [];

	setTimeout(async () => {
		renderScores(currentPlayers);

		// Inicializar mapa
		if (window.L) {
			initModeratorMap(roomCode, mapPoints);
		}

		// Suscribirse a ubicaciones de jugadores
		const { subscribeToPlayerLocations } = await import('../services/playerLocationsRealtime.js');
		locationSubscription = subscribeToPlayerLocations(roomCode, (locations) => {
			updatePlayerMarkers(locations, mapPoints);
		});

		document.getElementById('back-active').addEventListener('click', () => {
			if (subscription) subscription.unsubscribe();
			if (locationSubscription) locationSubscription.unsubscribe();
			navigateTo('/lobby', { code: roomCode });
		});

		document.getElementById('btn-end-game').addEventListener('click', () => {
			if (locationSubscription) locationSubscription.unsubscribe();
			navigateTo('/results', { results: currentPlayers });
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

		// Agregar marcadores de preguntas
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

		// Si no hay ubicaciones, limpiar todo
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

		// Limpiar marcadores de jugadores anteriores
		Object.values(playerMarkers).forEach(marker => {
			if (marker && map.hasLayer(marker)) {
				map.removeLayer(marker);
			}
		});
		playerMarkers = {};

		// Limpiar alertas anteriores
		const alertsDiv = document.getElementById('player-proximity-alerts');
		if (alertsDiv) {
			alertsDiv.innerHTML = '';
		}

		const proximityAlerts = [];

		// Agregar marcadores de jugadores
		locations.forEach((location) => {
			if (!location.latitude || !location.longitude) return;

			const playerIcon = L.divIcon({
				className: 'player-marker',
				html: `<div style="background-color: #11A36B; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"><span style="color: white; font-weight: bold; font-size: 12px;">👤</span></div>`,
				iconSize: [32, 32],
				iconAnchor: [16, 16],
			});

			const marker = L.marker([location.latitude, location.longitude], { icon: playerIcon }).addTo(map);

			// Encontrar punto más cercano
			const nearestPoint = findNearestPoint(location.latitude, location.longitude, points);
			const isNear = nearestPoint && nearestPoint.distance <= 18;

			// Crear popup con información
			let popupContent = `
				<div style="text-align:center; padding:8px; min-width:150px;">
					<strong style="font-size:14px; color:#1e3a8a;">${location.player_name || 'Jugador'}</strong><br/>
			`;

			if (nearestPoint) {
				const distance = Math.round(nearestPoint.distance);
				if (isNear) {
					popupContent += `<span style="color:#11A36B; font-weight:bold;">📍 Cerca de: ${nearestPoint.name}</span><br/>`;
					popupContent += `<small style="color:#11A36B;">A ${distance}m (≤10m)</small>`;

					// Agregar alerta
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

		// Mostrar alertas de proximidad
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
