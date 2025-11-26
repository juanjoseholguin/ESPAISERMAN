import { navigateTo, makeRequest, memoryState, updateCoins } from '../app.js';
import {
	initGeolocation,
	onProximityChange,
	onLocationUpdate,
	stopGeolocation,
	getCurrentLocation,
	getPoints,
	setCustomPoints,
} from '../services/geolocation.service.js';

function calculateDistance(lat1, lon1, lat2, lon2) {
	const R = 6371e3;
	const φ1 = (lat1 * Math.PI) / 180;
	const φ2 = (lat2 * Math.PI) / 180;
	const Δφ = ((lat2 - lat1) * Math.PI) / 180;
	const Δλ = ((lon2 - lon1) * Math.PI) / 180;
	const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

function setupInventoryRealtime(userId) {
  if (typeof window.supabase === 'undefined' && typeof supabase === 'undefined') {
    console.warn('Supabase no está disponible para Realtime. Asegúrate de incluir el script en index.html');
    return null;
  }

  const SUPABASE_URL = window.SUPABASE_URL;
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ SUPABASE_URL o SUPABASE_ANON_KEY no están configurados en index.html');
    return null;
  }

  const supabaseLib = window.supabase || (typeof supabase !== 'undefined' ? supabase : null);
  if (!supabaseLib || !supabaseLib.createClient) {
    console.warn('⚠️ Supabase createClient no está disponible');
    return null;
  }

  const supabaseClient = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const channel = supabaseClient
    .channel(`inventory-game-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'boosters_per_user',
        filter: `user_id=eq.${userId}`
      },
      async (payload) => {
        console.log('🔄 Cambio en inventario durante el juego:', payload);

        try {
          const response = await makeRequest(`/users/${userId}/boosters`, 'GET');
          if (response?.success && response.inventory) {
            memoryState.inventory = response.inventory;
            console.log('✅ Inventario actualizado en juego:', memoryState.inventory);

            const inventoryResponse = memoryState.inventory;
            const formattedInventory = formatInventoryList(inventoryResponse);
            const powerupsBanner = renderPowerupsBar(formattedInventory);
            const existingBanner = document.querySelector('[style*="Potenciadores disponibles"]')?.closest('div[style*="padding:8px"]');
            if (existingBanner) {
              existingBanner.outerHTML = powerupsBanner;
            }
          }
        } catch (error) {
          console.error('Error actualizando inventario en juego:', error);
        }
      }
    )
    .subscribe();

  return channel;
}

const boosterAssets = {
	empanada: '/assets/images/empanada.png',
	guaro: '/assets/images/guaro.png',
	chicharron: '/assets/images/chicharron.png',
	cafe: '/assets/images/cafe.png',
};

const boosterSlugByName = {
	'Empanadirri': 'empanada',
	'Empanadirri legal': 'empanada',
	'Media': 'guaro',
	'Media de güaro temporal': 'guaro',
	'Chichaghrrrom': 'chicharron',
	'Chichaghrrom': 'chicharron',
	'Café': 'cafe',
	'Café cargado': 'cafe',
};

const boosterDescriptions = {
	empanada: 'Agrega 10 segundos directamente al reloj.',
	guaro: 'Suma 5 segundos y congela el reloj durante 5 segundos.',
	chicharron: 'Duplica las monedas del siguiente acierto (200 en vez de 100).',
	cafe: 'Reduce 10 segundos al reloj para apurarte.',
};

function renderIntermedioWithGeolocation({ app, roomCode, currentQuestion, totalQuestions, formattedInventory, playerName, playerScore, formattedQuestions, timePerQuestion }) {
	let isButtonEnabled = false;
	let distanceToPoint = null;
	let currentLocation = null;

	app.innerHTML = renderIntermedioScreen({
		roomCode,
		currentQuestion,
		totalQuestions,
		formattedInventory,
		playerName,
		playerScore,
		isButtonEnabled: false,
		distanceToPoint: null,
	});

	if (window.roomMapPoints && Array.isArray(window.roomMapPoints)) {
		setCustomPoints(window.roomMapPoints);
		console.log('📍 Usando puntos personalizados del mapa:', window.roomMapPoints);
	}

	const playerNameForGeo = memoryState.currentUser || 'Jugador';
	console.log('📍 Iniciando geolocalización para:', { roomCode, playerName: playerNameForGeo });

	setTimeout(() => {
		initGeolocation(roomCode, playerNameForGeo);
		window.geolocationActive = true;
		console.log('✅ Geolocalización iniciada');
	}, 500);

	let playerMap = null;
	let playerMarker = null;
	let questionMarkers = [];

	setTimeout(() => {
		if (window.L) {
			initPlayerMap(roomCode, currentQuestion);
		}
	}, 600);

	function initPlayerMap(roomCode, currentQuestionNum) {
		const mapDiv = document.getElementById('player-map');
		if (!mapDiv || !window.L) return;

		const points = window.roomMapPoints && Array.isArray(window.roomMapPoints)
			? window.roomMapPoints
			: getPoints();

		const icesiCoords = [3.344, -76.5329];

		playerMap = L.map(mapDiv, {
			dragging: true,
			touchZoom: true,
			scrollWheelZoom: true,
			doubleClickZoom: true,
			boxZoom: false,
			keyboard: false,
		}).setView(icesiCoords, 17);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap contributors',
		}).addTo(playerMap);

		points.forEach((point, idx) => {
			const isCurrentQuestion = point.questionNumber === currentQuestionNum;
			const iconColor = isCurrentQuestion ? '#8B5CF6' : '#FFE28A';
			const borderColor = isCurrentQuestion ? '#6D28D9' : '#1e3a8a';

			const icon = L.divIcon({
				className: 'question-marker-player',
				html: `<div style="background-color: ${iconColor}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid ${borderColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><span style="color: #1e3a8a; font-weight: bold; font-size: 16px;">${point.questionNumber || idx + 1}</span></div>`,
				iconSize: [40, 40],
				iconAnchor: [20, 20],
			});

			const marker = L.marker(point.coords, { icon: icon }).addTo(playerMap);
			marker.bindPopup(`
				<div style="text-align:center; padding:8px; min-width:120px;">
					<strong style="font-size:16px; color:#1e3a8a;">${point.name}</strong><br/>
					<small style="color:#666;">Pregunta ${point.questionNumber || idx + 1}</small>
					${isCurrentQuestion ? '<br/><small style="color:#8B5CF6; font-weight:bold;">📍 Siguiente</small>' : ''}
				</div>
			`);
			questionMarkers.push(marker);
		});
	}

	function updatePlayerLocationOnMap(latitude, longitude) {
		if (!playerMap || !window.L) return;

		if (playerMarker) {
			playerMap.removeLayer(playerMarker);
		}

		const playerIcon = L.divIcon({
			className: 'player-location-marker',
			html: `<div style="background-color: #11A36B; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"><span style="color: white; font-weight: bold; font-size: 16px;">👤</span></div>`,
			iconSize: [32, 32],
			iconAnchor: [16, 16],
		});

		playerMarker = L.marker([latitude, longitude], { icon: playerIcon }).addTo(playerMap);
		playerMarker.bindPopup(`
			<div style="text-align:center; padding:8px;">
				<strong style="font-size:14px; color:#1e3a8a;">Tu ubicación</strong>
			</div>
		`);

		playerMap.setView([latitude, longitude], 17);
	}

	onProximityChange(({ isNearPoint, nearestPoint, distance }) => {
		const expectedQuestionNumber = currentQuestion;
		const isCorrectPoint = nearestPoint && nearestPoint.questionNumber === expectedQuestionNumber;

		if (isCorrectPoint && isNearPoint) {
			isButtonEnabled = true;
			distanceToPoint = distance;
		} else {
			isButtonEnabled = false;
			if (nearestPoint && nearestPoint.questionNumber === expectedQuestionNumber) {
				distanceToPoint = distance;
			} else {
				const points = window.roomMapPoints && Array.isArray(window.roomMapPoints)
					? window.roomMapPoints
					: getPoints();
				const targetPoint = points.find(p => p.questionNumber === expectedQuestionNumber);

				if (targetPoint && currentLocation && currentLocation.latitude && currentLocation.longitude) {
					distanceToPoint = calculateDistance(
						currentLocation.latitude,
						currentLocation.longitude,
						targetPoint.coords[0],
						targetPoint.coords[1]
					);
				} else if (distance !== null) {
					distanceToPoint = distance;
				}
			}
		}

		const btn = document.getElementById('btn-answer-question');
		const distanceMessageEl = document.getElementById('distance-message');

		if (btn) {
			if (isButtonEnabled) {
				btn.disabled = false;
				btn.style.opacity = '1';
				btn.style.cursor = 'pointer';
				btn.style.background = '#8B5CF6';
				btn.style.borderColor = '#6D28D9';
			} else {
				btn.disabled = true;
				btn.style.opacity = '0.5';
				btn.style.cursor = 'not-allowed';
				btn.style.background = '#9CA3AF';
				btn.style.borderColor = '#6B7280';
			}
		}

		if (distanceMessageEl && distanceToPoint !== null) {
			const points = window.roomMapPoints && Array.isArray(window.roomMapPoints)
				? window.roomMapPoints
				: getPoints();
			const currentPoint = points.find(p => p.questionNumber === currentQuestion) || points[currentQuestion - 1] || points[0];

			if (isCorrectPoint && isNearPoint) {
				distanceMessageEl.innerHTML = `
					<p style="color:#11A36B; font-size:16px; font-weight:600; margin:0;">¡Estás cerca! A ${Math.round(distanceToPoint)}m de la siguiente pregunta (${currentQuestion}), panita</p>
					<p style="color:#1e3a8a; font-size:14px; font-weight:600; margin-top:4px;">📍 ${currentPoint.name}</p>
				`;
			} else {
				distanceMessageEl.innerHTML = `
					<p style="color:#1e3a8a; font-size:16px; font-weight:600; margin:0;">Estás a ${Math.round(distanceToPoint)}m de la siguiente pregunta (${currentQuestion}), panita</p>
					<p style="color:#1e3a8a; font-size:14px; font-weight:600; margin-top:4px;">📍 ${currentPoint.name}</p>
				`;
			}
		}

		if (currentLocation && currentLocation.latitude && currentLocation.longitude) {
			updatePlayerLocationOnMap(currentLocation.latitude, currentLocation.longitude);
		}
	});

	onLocationUpdate((location) => {
		currentLocation = location;
		if (location && location.latitude && location.longitude) {
			updatePlayerLocationOnMap(location.latitude, location.longitude);
		}
	});

	setTimeout(() => {
		const btn = document.getElementById('btn-answer-question');
		if (btn) {
			btn.addEventListener('click', () => {
				if (!isButtonEnabled) return;

				stopGeolocation();
				window.geolocationActive = false;

				window.showingQuestion = true;

				renderQuestionScreen({
					app,
					roomCode,
					currentQuestion,
					formattedQuestions,
					timePerQuestion,
					formattedInventory,
				});
			});
		}

		const locationBtn = document.getElementById('btn-enable-location');
		if (locationBtn) {
			locationBtn.addEventListener('click', () => {
				console.log('📍 Botón de ubicación presionado manualmente');
				const playerNameForGeo = memoryState.currentUser || 'Jugador';
				initGeolocation(roomCode, playerNameForGeo);
				window.geolocationActive = true;
				locationBtn.textContent = '📍 Ubicación activada';
				locationBtn.style.background = '#11A36B';
				setTimeout(() => {
					locationBtn.style.display = 'none';
				}, 2000);
			});
		}
	}, 100);
}

function renderIntermedioScreen({ roomCode, currentQuestion, totalQuestions, formattedInventory, playerName, playerScore, isButtonEnabled = false, distanceToPoint = null }) {
	const points = window.roomMapPoints && Array.isArray(window.roomMapPoints)
		? window.roomMapPoints
		: getPoints();
	const currentPoint = points.find(p => p.questionNumber === currentQuestion) || points[currentQuestion - 1] || points[0];
	const powerupsBanner = renderPowerupsBar(formattedInventory);

	const buttonStyle = isButtonEnabled
		? 'background:#8B5CF6; border-color:#6D28D9; cursor:pointer; opacity:1;'
		: 'background:#9CA3AF; border-color:#6B7280; cursor:not-allowed; opacity:0.5;';

	const distanceText = distanceToPoint !== null
		? `Estás a ${Math.round(distanceToPoint)}m de la siguiente pregunta (${currentQuestion}), panita`
		: 'Buscando tu ubicación...';

	return `
    <div class="screen active">
      <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px;">
        <div style="display:flex; align-items:center; gap:6px; background:#FFE28A; padding:6px 12px; border-radius:12px;">
          <img src="/assets/images/Group 19453.png" alt="coin" style="width:20px; height:20px;">
          <span style="font-weight:800; color:#1e3a8a; font-size:15px;">${playerScore || 0}</span>
        </div>
        <div style="font-weight:800; color:#1e3a8a; font-size:14px;">${playerName || 'Jugador'}</div>
      </div>

      ${powerupsBanner}

      <div style="background:linear-gradient(135deg, #FFE28A 0%, #F9D648 100%); min-height:calc(100vh - 200px); padding:24px 16px; text-align:center;">
        <h1 style="color:#1e3a8a; font-size:28px; font-weight:800; margin-bottom:16px;">Así va la cosa, parceros</h1>

        <div style="background:rgba(255,255,255,0.95); border-radius:16px; padding:16px; margin-bottom:16px;">
          <p style="color:#1e3a8a; font-size:16px; font-weight:600; margin:0;">¡No sea aguevado, mijo! Póngase las pilas y vaya al siguiente punto</p>
        </div>

        <div style="background:rgba(255,255,255,0.95); border-radius:16px; padding:12px; margin-bottom:16px;">
          <h3 style="text-align:center; color:#1e3a8a; font-size:18px; margin-bottom:8px; font-weight:800;">🗺️ Mapa</h3>
          <div id="player-map" style="width:100%; height:250px; border-radius:12px; overflow:hidden; background:#e5e7eb;"></div>
        </div>

        <div id="distance-message" style="background:rgba(255,255,255,0.95); border-radius:16px; padding:12px; margin-bottom:16px;">
          <p style="color:#1e3a8a; font-size:16px; font-weight:600; margin:0;">${distanceText}</p>
          <p style="color:#1e3a8a; font-size:14px; font-weight:600; margin-top:4px;">📍 ${currentPoint.name}</p>
        </div>

        <button id="btn-answer-question" ${isButtonEnabled ? '' : 'disabled'} style="${buttonStyle} padding:16px 32px; border-radius:16px; color:white; font-size:18px; font-weight:bold; border:3px solid; width:100%; max-width:320px; margin:0 auto 16px; display:block;">
          Responder pregunta
        </button>

        <button id="btn-enable-location" style="background:#1e3a8a; color:white; padding:12px 24px; border-radius:12px; font-size:14px; font-weight:bold; border:none; width:100%; max-width:320px; margin:0 auto 8px; display:block; cursor:pointer;">
          📍 Activar Ubicación
        </button>

        <div style="background:rgba(255,255,255,0.95); border-radius:16px; padding:12px; margin-top:16px;">
          <p style="color:#1e3a8a; font-size:14px; margin:0;">¡Uy, qué nivel! Está en el segundo puesto, pero Lucho Portuano va punteando. ¡Esto se puso bueno, no afloje.</p>
        </div>
      </div>
    </div>
  `;
}

export default async function renderActiveGame({ roomCode } = {}) {
	const app = document.getElementById('app');
	app.innerHTML = `
    <div class="screen active">
      <div class="main-content" style="padding:32px; text-align:center;">
        <p style="font-weight:600; color:#1e3a8a;">Cargando partida...</p>
      </div>
    </div>`;
	const currentQuestion = window.currentQuestionIndex || 1;

	let questions = window.roomQuestions || [];
	let timePerQuestion = window.roomTimePerQuestion || 30;
	let roomCategory = null;

	if (questions.length === 0 && roomCode) {
		console.log('📥 No hay preguntas en window.roomQuestions, obteniendo desde el servidor...');
		try {
			const roomResponse = await fetch(`${window.location.origin}/rooms/${roomCode}`);
			if (roomResponse.ok) {
				const roomData = await roomResponse.json();
				roomCategory = roomData.room_category_id;
				timePerQuestion = roomData.time_per_question || 30;

				console.log(`✅ Sala encontrada, categoría: ${roomCategory}, tiempo: ${timePerQuestion}`);

				if (roomCategory) {
					const questionsResponse = await fetch(`${window.location.origin}/questions/category/${roomCategory}`);
					if (questionsResponse.ok) {
						const allQuestions = await questionsResponse.json();
						questions = Array.isArray(allQuestions) ? allQuestions.slice(0, 5) : [];
						console.log(`✅ ${questions.length} preguntas cargadas desde el servidor`);
					}
				}
			}
		} catch (error) {
			console.error('Error cargando preguntas desde el servidor:', error);
		}
	}

	if (questions.length === 0) {
		app.innerHTML = `
      <div style="padding:20px; text-align:center;">
        <h2 style="color:#E34C43;">Error: No hay preguntas</h2>
        <p>No se encontraron preguntas para esta partida. Contacta al administrador.</p>
        <button onclick="location.reload()" style="margin-top:20px; padding:12px 24px; background:#1e3a8a; color:white; border:none; border-radius:12px;">Reintentar</button>
      </div>
    `;
		return;
	}

	window.roomQuestions = questions;
	window.roomTimePerQuestion = timePerQuestion;

	const formattedQuestions = questions.map((q) => {
		let answers = [];
		if (q.answer && Array.isArray(q.answer)) {
			answers = q.answer;
		} else {
			answers = [
				q.correct_answer,
				q.wrong_answer_1 || q.option_2,
				q.wrong_answer_2 || q.option_3,
				q.wrong_answer_3 || q.option_4,
			];
		}

		return {
			q: q.question || q.question_text,
			correct: q.correct_answer,
			options: answers,
			labels: answers.map((ans, idx) => `${String.fromCharCode(65 + idx)}) ${ans}`),
		};
	});

	if (formattedQuestions.length === 0) {
		app.innerHTML = `<div style="padding:20px; text-align:center;"><h2>Cargando preguntas...</h2></div>`;
		return;
	}

	const question = formattedQuestions[currentQuestion - 1];

	if (window.geolocationActive) {
		stopGeolocation();
	}

	if (window.inventoryGameChannel) {
		window.inventoryGameChannel.unsubscribe();
	}

	let inventoryResponse = [];
	try {
		inventoryResponse = await loadInventory();
		console.log('🎮 Inventario cargado del servidor:', inventoryResponse);
		console.log('🎮 Detalles:', inventoryResponse.map(i => `${i.booster_name}: x${i.quantity || 0}`));

		if (inventoryResponse && inventoryResponse.length > 0) {
			memoryState.inventory = inventoryResponse;
		}
	} catch (error) {
		console.error('Error cargando inventario:', error);
		if (memoryState.inventory && memoryState.inventory.length > 0) {
			inventoryResponse = memoryState.inventory;
			console.log('⚠️ Usando inventario de memoryState (fallback):', inventoryResponse);
		}
	}

	if (memoryState.currentUserId) {
		window.inventoryGameChannel = setupInventoryRealtime(memoryState.currentUserId);
	}

	const formattedInventory = formatInventoryList(inventoryResponse);
	console.log('🎮 Inventario formateado:', formattedInventory);

	const showIntermedio = window.showingQuestion !== true;

	if (showIntermedio) {
		renderIntermedioWithGeolocation({
			app,
			roomCode,
			currentQuestion,
			totalQuestions: formattedQuestions.length,
			formattedInventory,
			playerName: memoryState.currentUser || 'Jugador',
			playerScore: memoryState.currentUserCoins || 0,
			formattedQuestions,
			timePerQuestion,
		});
		return;
	}

	renderQuestionScreen({
		app,
		roomCode,
		currentQuestion,
		formattedQuestions,
		timePerQuestion,
		formattedInventory,
	});
}

function renderQuestionScreen({ app, roomCode, currentQuestion, formattedQuestions, timePerQuestion, formattedInventory }) {
	const question = formattedQuestions[currentQuestion - 1];

	const points = window.roomMapPoints && Array.isArray(window.roomMapPoints)
		? window.roomMapPoints
		: getPoints();
	const currentPoint = points.find(p => p.questionNumber === currentQuestion) || points[currentQuestion - 1] || points[0];
	const powerupsBanner = renderPowerupsBar(formattedInventory);

	app.innerHTML = `
    <div class="screen active">
      <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 12px; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; gap:6px; background:#FFE28A; padding:6px 12px; border-radius:12px; min-width:fit-content;">
          <img src="/assets/images/Group 19453.png" alt="coin" style="width:20px; height:20px; flex-shrink:0;">
          <span id="coins-balance" style="font-weight:800; color:#1e3a8a; font-size:15px; white-space:nowrap;">${
						(() => {
							const fromMemory = memoryState.currentUserCoins;
							const fromStorage = parseInt(localStorage.getItem('currentUserCoins') || '0', 10);
							return fromMemory || fromStorage || 0;
						})()
					}</span>
        </div>
        <div style="font-weight:800; color:#1e3a8a; font-size:14px; text-overflow:ellipsis; overflow:hidden; max-width:150px;">${memoryState.currentUser || 'Jugador'}</div>
      </div>

      ${powerupsBanner}

      <div id="powerup-feedback" style="text-align:center; color:#1e3a8a; font-weight:600; min-height:20px;"></div>

      <div id="map-game" style="width:100%; max-width:100%; height:250px; min-height:200px; position:relative; margin:8px 12px; border-radius:12px; overflow:hidden; background:#1e3a8a;">
        <div style="position:absolute; top:12px; left:12px; right:12px; background:rgba(255,255,255,0.95); padding:8px 10px; border-radius:10px; z-index:1000; font-size:14px;">
          <div style="font-weight:bold; color:#1e3a8a;">Campus Icesi - Punto ${currentQuestion}/5</div>
        </div>
        <div style="position:absolute; bottom:12px; right:12px; background:rgba(255,226,138,0.95); padding:6px 10px; border-radius:8px; z-index:1000; font-size:13px;">
          <div style="font-weight:bold;">📍 ${currentPoint.name}</div>
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.95); border-radius:16px; padding:16px; margin:0 12px;">
        <div style="background:#e5e7eb; border-radius:12px; overflow:hidden; margin-bottom:12px; height:32px; min-height:32px; position:relative;">
          <div id="timer-bar" style="background:linear-gradient(90deg, #11A36B 0%, #FFB347 50%, #E34C43 100%); height:100%; width:100%; transition:width 0.1s linear; display:flex; align-items:center; justify-content:center;">
            <span id="timer-text" style="color:white; font-weight:bold; font-size:15px; position:relative; z-index:1;">${timePerQuestion}s</span>
          </div>
          <div id="double-points-pill" style="position:absolute; top:-10px; right:8px; background:#E34C43; color:white; font-weight:bold; padding:3px 8px; border-radius:999px; font-size:11px; display:none; box-shadow:0 2px 8px rgba(0,0,0,0.2);">x2 activo</div>
        </div>
        <h2 style="text-align:center; color:#1e3a8a; font-size:18px; margin-bottom:14px; line-height:1.3; padding:0 4px;">${question.q}</h2>

        <div style="display:flex; flex-direction:column; gap:8px;">
          ${question.options
						.map(
							(opt, idx) => `
            <button class="answer-btn" data-answer="${opt}" style="background:${
								['#E34C43', '#11A36B', '#FFB347', '#8FA6E0'][idx]
							}; padding:14px 12px; border:none; border-radius:12px; text-align:left; color:white; font-size:15px; min-height:48px; word-wrap:break-word;">
              <span style="font-weight:bold;">${String.fromCharCode(65 + idx)})</span> ${
								question.labels[idx].split(') ')[1]
							}
            </button>
          `
						)
						.join('')}
        </div>
      </div>
    </div>
  `;

	setTimeout(() => {
		if (window.L) {
			const mapDiv = document.getElementById('map-game');
			const icesiCoords = [3.344, -76.5329];
			const map = L.map(mapDiv, {
				dragging: false,
				touchZoom: false,
				scrollWheelZoom: false,
				doubleClickZoom: false,
				boxZoom: false,
				keyboard: false,
			}).setView(icesiCoords, 17);

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '© OpenStreetMap contributors',
			}).addTo(map);

			const icon = L.divIcon({
				className: 'custom-question-marker',
				html: `<div style="background-color: #FFE28A; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 4px solid #1e3a8a; box-shadow: 0 4px 12px rgba(0,0,0,0.4);"><span style="color: #1e3a8a; font-weight: bold; font-size: 20px;">${currentQuestion}</span></div>`,
				iconSize: [48, 48],
				iconAnchor: [24, 24],
			});

			L.marker(currentPoint.coords, { icon: icon }).addTo(map);
		}

		const state = {
			answered: false,
			timeLeft: timePerQuestion,
			timeFrozen: false,
			doublePoints: false,
			autoCorrect: false,
			freezeEndTime: 0,
			timer: null,
		};

		const timerBar = document.getElementById('timer-bar');
		const timerText = document.getElementById('timer-text');
		const coinsLabel = document.getElementById('coins-balance');
		const feedbackEl = document.getElementById('powerup-feedback');
		const doublePointsPill = document.getElementById('double-points-pill');
		const answerButtons = Array.from(document.querySelectorAll('.answer-btn'));

		const savedCoins = parseInt(localStorage.getItem('currentUserCoins') || '0', 10);
		const currentCoins = Math.max(
			memoryState.currentUserCoins || 0,
			savedCoins || 0
		);
		memoryState.currentUserCoins = currentCoins;
		localStorage.setItem('currentUserCoins', currentCoins.toString());

		if (coinsLabel) {
			coinsLabel.textContent = currentCoins;
		}
		console.log('💰 Monedas inicializadas en pregunta', currentQuestion, ':', {
			memoryState: memoryState.currentUserCoins,
			localStorage: savedCoins,
			final: currentCoins,
			displayed: coinsLabel?.textContent
		});

		const showFeedback = (message) => {
			if (!feedbackEl) return;
			feedbackEl.textContent = message;
			setTimeout(() => {
				if (feedbackEl.textContent === message) feedbackEl.textContent = '';
			}, 3500);
		};

		const updateTimerUI = () => {
			if (!timerBar || !timerText) return;
			timerText.textContent = `${state.timeLeft}s`;
			const percentage = (state.timeLeft / timePerQuestion) * 100;
			timerBar.style.width = `${Math.max(0, percentage)}%`;
		};

		const lockAnswers = () => {
			answerButtons.forEach((btn) => {
				btn.disabled = true;
				btn.style.opacity = '0.5';
			});
		};

		const goToNextStep = () => {
			if (currentQuestion < formattedQuestions.length) {
				window.currentQuestionIndex = currentQuestion + 1;
				window.showingQuestion = false;
				navigateTo('/active', { roomCode });
			} else {
				window.currentQuestionIndex = 1;
				navigateTo('/results', { roomCode });
			}
		};

		const applyPowerupEffect = (slug) => {
			switch (slug) {
				case 'guaro':
					state.timeLeft += 5;
					state.timeFrozen = true;
					state.freezeEndTime = Date.now() + 5000;
					updateTimerUI();
					showFeedback('Media activada: +5s y reloj congelado.');
					break;
				case 'cafe':
					state.timeLeft = Math.max(5, state.timeLeft - 10);
					updateTimerUI();
					showFeedback('Café activado: reloj más rápido.');
					break;
				case 'chicharron':
					state.doublePoints = true;
					if (doublePointsPill) doublePointsPill.style.display = 'block';
					showFeedback('Chichaghrrrom: tus puntos serán x2.');
					break;
				case 'empanada':
					state.timeLeft += 10;
					updateTimerUI();
					showFeedback('Empanadirri activada: +10 segundos de tiempo.');
					break;
				default:
					break;
			}
		};

		const startTimer = () => {
			updateTimerUI();
			state.timer = setInterval(() => {
				if (state.answered) {
					clearInterval(state.timer);
					return;
				}

				if (state.timeFrozen && Date.now() < state.freezeEndTime) {
					return;
				} else if (state.timeFrozen && Date.now() >= state.freezeEndTime) {
					state.timeFrozen = false;
				}

				state.timeLeft -= 1;
				updateTimerUI();

				if (state.timeLeft <= 0) {
					clearInterval(state.timer);
					state.answered = true;
					lockAnswers();
					setTimeout(() => goToNextStep(), 1000);
				}
			}, 1000);
		};

		const boosterNameBySlug = {
			empanada: 'Empanadirri',
			guaro: 'Media',
			chicharron: 'Chichaghrrrom',
			cafe: 'Café',
		};

		const handlePowerupUse = async (boosterId, slug, button) => {
			if (!memoryState.currentUserId) {
				alert('Debes iniciar sesión para usar potenciadores.');
				return;
			}

			button.disabled = true;
			try {
				const response = await makeRequest(`/users/${memoryState.currentUserId}/boosters/consume`, 'POST', {
					boosterId,
				});
				if (response.error) {
					alert(response.error);
					return;
				}
				memoryState.inventory = response.inventory;
				updatePowerupQuantities(response.inventory);
				applyPowerupEffect(slug);
				showFeedback(`Activaste ${boosterNameBySlug[slug] || 'tu potenciador'}.`);
			} catch (error) {
				console.error('Error usando potenciador:', error);
				alert('No se pudo usar el potenciador, intenta de nuevo.');
			} finally {
				button.disabled = false;
			}
		};

		document.querySelectorAll('.power-card .use-power').forEach((btn) => {
			const card = btn.closest('.power-card');
			const boosterId = Number(card?.getAttribute('data-booster-id'));
			const slug = card?.getAttribute('data-booster-slug');
			if (!boosterId || !slug) return;
			btn.addEventListener('click', () => handlePowerupUse(boosterId, slug, btn));
		});

		answerButtons.forEach((btn) => {
			btn.addEventListener('click', async (e) => {
				if (state.answered) return;
				state.answered = true;
				if (state.timer) clearInterval(state.timer);

				const clickedBtn = e.currentTarget;
				const answer = clickedBtn.dataset.answer;
				const isCorrect = answer === question.correct;

				clickedBtn.style.opacity = '0.7';
				clickedBtn.style.transform = 'scale(0.95)';

				if (isCorrect) {
					clickedBtn.style.border = '3px solid #11A36B';
					const coinsEarned = state.doublePoints ? 200 : 100;

					const currentCoinsFromMemory = memoryState.currentUserCoins || 0;
					const currentCoinsFromStorage = parseInt(localStorage.getItem('currentUserCoins') || '0', 10);
					const currentCoins = Math.max(currentCoinsFromMemory, currentCoinsFromStorage);

					const newCoins = currentCoins + coinsEarned;

					memoryState.currentUserCoins = newCoins;
					localStorage.setItem('currentUserCoins', newCoins.toString());

					if (coinsLabel) {
						coinsLabel.textContent = newCoins;
					}

					console.log('✅ Respuesta correcta!', {
						coinsEarned,
						before: currentCoins,
						after: newCoins,
						doublePoints: state.doublePoints
					});

					showFeedback(`¡Correcto! +${coinsEarned} monedas`);

					if (memoryState.currentUserId) {
						try {
							const response = await updateCoins(coinsEarned);
							if (response?.success && response.coins !== undefined) {
								const serverCoins = response.coins;
								const localCoins = memoryState.currentUserCoins;
								const finalCoins = Math.max(localCoins, serverCoins);

								memoryState.currentUserCoins = finalCoins;
								localStorage.setItem('currentUserCoins', finalCoins.toString());
								if (coinsLabel) {
									coinsLabel.textContent = finalCoins;
								}
								console.log('✅ Monedas sincronizadas con servidor:', {
									server: serverCoins,
									local: localCoins,
									final: finalCoins
								});
							}
						} catch (error) {
							console.warn('⚠️ No se pudo sincronizar monedas con el servidor:', error);
						}
					} else {
						console.warn('⚠️ No hay currentUserId, monedas solo guardadas localmente');
					}

					if (state.doublePoints) {
						state.doublePoints = false;
						if (doublePointsPill) doublePointsPill.style.display = 'none';
					}

					if (window.memoryState.currentUserId) {
						try {
							const { updatePlayerScoreAPI } = await import('../services/roomsRealtime.js');
							await updatePlayerScoreAPI(roomCode, window.memoryState.currentUserId, 100);
						} catch (error) {
							console.error('Error updating score:', error);
						}
					}
				} else {
					clickedBtn.style.border = '3px solid #E34C43';
				}

				lockAnswers();
				if (isCorrect) {
					const finalCoins = memoryState.currentUserCoins || parseInt(localStorage.getItem('currentUserCoins') || '0', 10);
					memoryState.currentUserCoins = finalCoins;
					localStorage.setItem('currentUserCoins', finalCoins.toString());
					console.log('💾 Monedas guardadas antes de navegar:', finalCoins);
				}
				setTimeout(() => goToNextStep(), 800);
			});
		});

		startTimer();
	}, 120);
}

async function loadInventory() {
	try {
		if (!memoryState.currentUserId) {
			console.log('⚠️ No hay currentUserId, retornando inventario vacío');
			return [];
		}

		console.log(`📥 Cargando inventario para usuario ${memoryState.currentUserId}...`);
		const response = await makeRequest(`/users/${memoryState.currentUserId}/boosters`, 'GET');

		console.log('📦 Respuesta del servidor:', response);

		let inventory = [];
		if (response?.success && response.inventory) {
			inventory = response.inventory;
		} else if (Array.isArray(response)) {
			inventory = response;
		} else if (response?.inventory && Array.isArray(response.inventory)) {
			inventory = response.inventory;
		}

		inventory = inventory.map(item => ({
			...item,
			quantity: item.quantity || 0
		}));

		console.log('✅ Inventario procesado:', inventory);
		console.log('📊 Items con quantity > 0:', inventory.filter(i => i.quantity > 0).map(i => `${i.booster_name}: x${i.quantity}`));

		memoryState.inventory = inventory;

		return inventory;
	} catch (error) {
		console.error('❌ Error cargando inventario:', error);
		if (memoryState.inventory && memoryState.inventory.length > 0) {
			console.log('📦 Usando inventario de memoryState (fallback):', memoryState.inventory);
			return memoryState.inventory;
		}
		return [];
	}
}

function formatInventoryList(inventory = []) {
	if (!inventory || inventory.length === 0) {
		console.log('⚠️ formatInventoryList: inventario vacío');
		return [];
	}

	const formatted = inventory
		.map((item) => {
			const slug = boosterSlugByName[item.booster_name] || item.booster_name?.toLowerCase();
			const formattedItem = {
				...item,
				slug,
				icon: boosterAssets[slug] || '/assets/images/Group 4.png',
				description: boosterDescriptions[slug] || '',
			};
			console.log(`📦 Formateando: ${item.booster_name} -> quantity: ${item.quantity}, slug: ${slug}`);
			return formattedItem;
		})
		.filter((item) => {
			const hasQuantity = item.quantity > 0;
			if (!hasQuantity) {
				console.log(`❌ Filtrando ${item.booster_name} porque quantity es ${item.quantity}`);
			}
			return hasQuantity;
		});

	console.log(`✅ Inventario formateado: ${formatted.length} items con quantity > 0`);
	console.log('📦 Items finales:', formatted.map(i => `${i.booster_name}: x${i.quantity}`));
	return formatted;
}

function renderPowerupsBar(list = []) {
	if (!list || list.length === 0) {
		return `<div style="padding:12px 16px; margin:0 16px 8px 16px; background:rgba(255,226,138,0.25); border-radius:12px; color:#1e3a8a; font-weight:600; text-align:center;">
      No tienes potenciadores activos. Visita la tienda para conseguirlos.
    </div>`;
	}

	return `
    <div style="padding:8px 12px; margin-bottom:8px; overflow-x:auto; background:rgba(255,226,138,0.3); -webkit-overflow-scrolling:touch;">
      <div style="font-weight:bold; color:#1e3a8a; margin-bottom:8px; display:flex; align-items:center; gap:6px; font-size:14px;">
        ⚡ Potenciadores disponibles
      </div>
      <div style="display:flex; gap:10px; min-width:fit-content;">
        ${list
					.map(
						(item) => `
          <div class="power-card" data-booster-id="${item.booster_id}" data-booster-slug="${item.slug}" style="background:rgba(255,255,255,0.95); padding:8px 10px; border-radius:10px; min-width:140px; max-width:160px; border:2px solid #1e3a8a; display:flex; flex-direction:column; gap:6px; flex-shrink:0;">
            <div style="display:flex; align-items:center; gap:6px;">
              <img src="${item.icon}" alt="${item.booster_name}" style="width:28px; height:28px; object-fit:contain; flex-shrink:0;">
              <div style="min-width:0; flex:1;">
                <div style="font-weight:800; color:#1e3a8a; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.booster_name}</div>
                <div class="power-qty" style="font-size:12px; color:#666;">x${item.quantity}</div>
              </div>
            </div>
            <button class="use-power" ${item.quantity <= 0 ? 'disabled' : ''} style="margin-top:auto; border:none; border-radius:8px; padding:6px 8px; font-weight:600; background:#11A36B; color:white; cursor:pointer; font-size:12px; width:100%;">
              Usar ahora
            </button>
          </div>`
					)
					.join('')}
      </div>
    </div>
  `;
}

function updatePowerupQuantities(inventory = []) {
	const map = {};
	inventory.forEach((item) => {
		const slug = boosterSlugByName[item.booster_name] || item.booster_name?.toLowerCase();
		map[slug] = item.quantity;
	});

	document.querySelectorAll('.power-card').forEach((card) => {
		const slug = card.getAttribute('data-booster-slug');
		const qtyEl = card.querySelector('.power-qty');
		const btn = card.querySelector('.use-power');
		const qty = map[slug] || 0;
		if (qtyEl) qtyEl.textContent = `x${qty}`;
		if (btn) btn.disabled = qty <= 0;
	});
}
