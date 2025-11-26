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

// Función para suscribirse a cambios en el inventario usando Supabase Realtime
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

	// Usar la función createClient de Supabase
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

						// Actualizar la barra de potenciadores si existe
						const inventoryResponse = memoryState.inventory;
						const formattedInventory = await formatInventoryList(inventoryResponse);
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
	empanada: 'assets/images/empanada.png',
	guaro: 'assets/images/guaro.png',
	chicharron: 'assets/images/chicharron.png',
	cafe: 'assets/images/cafe.png',
};

const boosterSlugByName = {
	'Empanadirri': 'empanada',
	'Empanadirri legal': 'empanada',
	'Media': 'guaro',
	'Media de güaro temporal': 'guaro',
	'Media de güaro tempo': 'guaro',
	'Chichaghrrrom': 'chicharron',
	'Chichaghrrom': 'chicharron',
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
          <img src="assets/images/Group 19453.png" alt="coin" style="width:20px; height:20px;">
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

export default async function renderActiveGame({ roomCode } = {}) {
	if (window.gameEnded) {
		navigateTo('/results', { roomCode });
		return;
	}

	const app = document.getElementById('app');
	app.innerHTML = `
    <div class="screen active">
      <div class="main-content" style="padding:32px; text-align:center;">
        <p style="font-weight:600; color:#1e3a8a;">Cargando partida...</p>
      </div>
    </div>`;

	if (roomCode) {
		const { checkRoomStatus } = await import('../services/roomsRealtime.js');
		const roomStatus = await checkRoomStatus(roomCode);
		if (!roomStatus.room_status) {
			window.gameEnded = true;
			navigateTo('/results', { roomCode });
			return;
		}
	}

	let currentQuestion = window.currentQuestionIndex || 1;
	if (roomCode) {
		const savedIndex = localStorage.getItem(`room_${roomCode}_questionIndex`);
		if (savedIndex) {
			currentQuestion = parseInt(savedIndex, 10);
			window.currentQuestionIndex = currentQuestion;
			console.log(`📖 Pregunta cargada desde localStorage: ${currentQuestion}`);
		}
	}

	// Obtener información de la sala para cargar las preguntas
	let questions = window.roomQuestions || [];
	let timePerQuestion = window.roomTimePerQuestion || 30;
	let roomCategory = null;

	// Si no hay preguntas, intentar obtenerlas desde el servidor usando el roomCode
	if (questions.length === 0 && roomCode) {
		console.log('📥 No hay preguntas en window.roomQuestions, obteniendo desde el servidor...');
		try {
			// Obtener información de la sala
			const roomResponse = await fetch(`${window.location.origin}/rooms/${roomCode}/players`);
			if (roomResponse.ok) {
				const roomData = await roomResponse.json();
				roomCategory = roomData.room_category_id;
				timePerQuestion = roomData.time_per_question || 30;

				// Cargar puntos del mapa personalizados
				if (roomData.map_points && Array.isArray(roomData.map_points)) {
					window.roomMapPoints = roomData.map_points;
					setCustomPoints(roomData.map_points);
					console.log('📍 Puntos del mapa cargados desde el servidor:', window.roomMapPoints);
				}

				console.log(`✅ Sala encontrada, categoría: ${roomCategory}, tiempo: ${timePerQuestion}`);

				// Obtener preguntas de la categoría
				if (roomCategory) {
					const questionsResponse = await fetch(`${window.location.origin}/questions/category/${roomCategory}`);
					if (questionsResponse.ok) {
						const allQuestions = await questionsResponse.json();
						// Tomar las primeras 5 preguntas (igual que el moderador)
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

	// Guardar las preguntas y tiempo en window para uso posterior
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

			const activePowerups = [];
			inventoryResponse.forEach(item => {
				const slug = boosterSlugByName[item.booster_name] || item.booster_name?.toLowerCase();
				if (slug && item.quantity > 0) {
					for (let i = 0; i < item.quantity; i++) {
						activePowerups.push(slug);
					}
				}
			});
			localStorage.setItem('activePowerups', JSON.stringify(activePowerups));
			console.log('✅ Potenciadores sincronizados a localStorage:', activePowerups);
		}
	} catch (error) {
		console.error('Error cargando inventario:', error);
		if (memoryState.inventory && memoryState.inventory.length > 0) {
			inventoryResponse = memoryState.inventory;
			console.log('⚠️ Usando inventario de memoryState (fallback):', inventoryResponse);
		}
	}

	const activePowerups = JSON.parse(localStorage.getItem('activePowerups') || '[]');
	if (activePowerups.length > 0 && (!inventoryResponse || inventoryResponse.length === 0)) {
		console.log('📦 Usando potenciadores de localStorage:', activePowerups);

		try {
			const boostersResponse = await makeRequest('/boosters', 'GET');
			let allBoosters = [];
			if (boostersResponse?.boosters && Array.isArray(boostersResponse.boosters)) {
				allBoosters = boostersResponse.boosters;
			} else if (Array.isArray(boostersResponse)) {
				allBoosters = boostersResponse;
			}

			const mappedInventory = activePowerups.reduce((acc, slug) => {
				const existing = acc.find(i => i.slug === slug);
				if (existing) {
					existing.quantity++;
				} else {
					let name = '';
					for (const [key, val] of Object.entries(boosterSlugByName)) {
						if (val === slug) {
							name = key;
							break;
						}
					}

					const boosterFromDB = allBoosters.find(b =>
						b.booster_name === name ||
						b.booster_name?.toLowerCase() === name?.toLowerCase()
					);

					acc.push({
						booster_id: boosterFromDB?.id || null,
						booster_name: name || slug,
						quantity: 1,
						slug: slug,
						icon: boosterAssets[slug] || 'assets/images/Group 4.png',
						description: boosterDescriptions[slug] || '',
					});
				}
				return acc;
			}, []);
			inventoryResponse = mappedInventory;
			console.log('✅ Inventario mapeado desde localStorage con IDs:', inventoryResponse);
		} catch (error) {
			console.error('Error cargando boosters para obtener IDs:', error);
			const mappedInventory = activePowerups.reduce((acc, slug) => {
				const existing = acc.find(i => i.slug === slug);
				if (existing) {
					existing.quantity++;
				} else {
					let name = '';
					for (const [key, val] of Object.entries(boosterSlugByName)) {
						if (val === slug) {
							name = key;
							break;
						}
					}
					acc.push({
						booster_id: null,
						booster_name: name || slug,
						quantity: 1,
						slug: slug
					});
				}
				return acc;
			}, []);
			inventoryResponse = mappedInventory;
		}
	}

	let roomSubscription = null;
	if (roomCode) {
		const { subscribeToRoom, loadRoomState } = await import('../services/roomsRealtime.js');
		roomSubscription = subscribeToRoom(roomCode, async (state) => {
			console.log('🔄 Cambio detectado en sala (activeGame):', state);
			if (state && !state.room_status && !window.gameEnded) {
				console.log('🛑 Partida finalizada detectada, redirigiendo...');
				window.gameEnded = true;
				if (roomSubscription) {
					roomSubscription.unsubscribe();
					window.roomSubscription = null;
				}
				if (window.inventoryGameChannel) {
					window.inventoryGameChannel.unsubscribe();
					window.inventoryGameChannel = null;
				}
				if (window.geolocationActive) {
					stopGeolocation();
					window.geolocationActive = false;
				}
				if (window.roomCheckInterval) {
					clearInterval(window.roomCheckInterval);
					window.roomCheckInterval = null;
				}
				if (state.timer) clearInterval(state.timer);
				navigateTo('/results', { roomCode });
			}
		});
		window.roomSubscription = roomSubscription;
	}

	if (memoryState.currentUserId) {
		window.inventoryGameChannel = setupInventoryRealtime(memoryState.currentUserId);
	}

	let formattedInventory = await formatInventoryList(inventoryResponse);
	console.log('🎮 Inventario formateado:', formattedInventory);

	if (formattedInventory.length === 0 && activePowerups.length > 0) {
		console.log('📦 Creando inventario desde localStorage...');
		formattedInventory = activePowerups.reduce((acc, slug) => {
			const existing = acc.find(i => i.slug === slug);
			if (existing) {
				existing.quantity++;
			} else {
				let name = '';
				for (const [key, val] of Object.entries(boosterSlugByName)) {
					if (val === slug) {
						name = key;
						break;
					}
				}
				acc.push({
					booster_name: name || slug,
					quantity: 1,
					slug: slug,
					icon: boosterAssets[slug] || 'assets/images/Group 4.png',
					description: boosterDescriptions[slug] || '',
				});
			}
			return acc;
		}, []);
		console.log('✅ Inventario creado desde localStorage:', formattedInventory);
	}

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
          <img src="assets/images/Group 19453.png" alt="coin" style="width:20px; height:20px; flex-shrink:0;">
          <span id="coins-balance" style="font-weight:800; color:#1e3a8a; font-size:15px; white-space:nowrap;">${(() => {
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
            <button class="answer-btn" data-answer="${opt}" style="background:${['#E34C43', '#11A36B', '#FFB347', '#8FA6E0'][idx]
					}; padding:14px 12px; border:none; border-radius:12px; text-align:left; color:white; font-size:15px; min-height:48px; word-wrap:break-word;">
              <span style="font-weight:bold;">${String.fromCharCode(65 + idx)})</span> ${question.labels[idx].split(') ')[1]
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
			window.gameMap = L.map(mapDiv, {
				dragging: false,
				touchZoom: false,
				scrollWheelZoom: false,
				doubleClickZoom: false,
				boxZoom: false,
				keyboard: false,
			}).setView(icesiCoords, 17);

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '© OpenStreetMap contributors',
			}).addTo(window.gameMap);

			const icon = L.divIcon({
				className: 'custom-question-marker',
				html: `<div style="background-color: #FFE28A; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 4px solid #1e3a8a; box-shadow: 0 4px 12px rgba(0,0,0,0.4);"><span style="color: #1e3a8a; font-weight: bold; font-size: 20px;">${currentQuestion}</span></div>`,
				iconSize: [48, 48],
				iconAnchor: [24, 24],
			});

			window.questionMarker = L.marker(currentPoint.coords, { icon: icon }).addTo(window.gameMap);
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

		// Asegurar que las monedas estén inicializadas correctamente
		const savedCoins = parseInt(localStorage.getItem('currentUserCoins') || '0', 10);
		// Siempre usar el valor más alto entre memoryState y localStorage
		const currentCoins = Math.max(
			memoryState.currentUserCoins || 0,
			savedCoins || 0
		);
		memoryState.currentUserCoins = currentCoins;
		localStorage.setItem('currentUserCoins', currentCoins.toString());

		// Sincronizar siempre con localStorage para mantener consistencia
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
			console.log('🔄 Avanzando de pregunta:', { currentQuestion, total: formattedQuestions.length });
			if (currentQuestion < formattedQuestions.length) {
				const nextQuestion = currentQuestion + 1;
				window.currentQuestionIndex = nextQuestion;
				window.showingQuestion = false;
				if (roomCode) {
					localStorage.setItem(`room_${roomCode}_questionIndex`, nextQuestion.toString());
					console.log(`💾 Guardado en localStorage: room_${roomCode}_questionIndex = ${nextQuestion}`);
				}
				console.log('➡️ Volviendo a pantalla intermedia bloqueada para pregunta:', window.currentQuestionIndex);
				navigateTo('/active', { roomCode });
			} else {
				console.log('🏁 Partida terminada, navegando a resultados');
				window.currentQuestionIndex = 1;
				window.showingQuestion = false;
				if (roomCode) {
					localStorage.removeItem(`room_${roomCode}_questionIndex`);
				}
						if (window.inventoryGameChannel) {
							window.inventoryGameChannel.unsubscribe();
							window.inventoryGameChannel = null;
						}
						if (window.geolocationActive) {
							stopGeolocation();
							window.geolocationActive = false;
						}
						navigateTo('/results', { roomCode });
			}
		};

		const applyPowerupEffect = (slug) => {
			console.log('🎯 Aplicando efecto de potenciador:', { slug, timeLeft: state.timeLeft, doublePoints: state.doublePoints });

			switch (slug) {
				case 'guaro':
					state.timeLeft += 5;
					state.timeFrozen = true;
					state.freezeEndTime = Date.now() + 5000;
					updateTimerUI();
					showFeedback('Media activada: +5s y reloj congelado.');
					console.log('✅ Efecto Media aplicado:', { newTimeLeft: state.timeLeft, timeFrozen: state.timeFrozen });
					break;
				case 'cafe':
					state.timeLeft = Math.max(5, state.timeLeft - 10);
					updateTimerUI();
					showFeedback('Café activado: reloj más rápido.');
					console.log('✅ Efecto Café aplicado:', { newTimeLeft: state.timeLeft });
					break;
				case 'chicharron':
					state.doublePoints = true;
					if (doublePointsPill) {
						doublePointsPill.style.display = 'block';
						console.log('✅ Pill de doble puntos mostrado');
					}
					showFeedback('Chichaghrrrom: tus puntos serán x2.');
					console.log('✅ Efecto Chicharron aplicado:', { doublePoints: state.doublePoints });
					break;
				case 'empanada':
					state.timeLeft += 10;
					updateTimerUI();
					showFeedback('Empanadirri activada: +10 segundos de tiempo.');
					console.log('✅ Efecto Empanada aplicado:', { newTimeLeft: state.timeLeft });
					break;
				default:
					console.warn('⚠️ Slug de potenciador no reconocido:', slug);
					showFeedback(`Potenciador ${slug} activado (efecto no implementado)`);
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

			if (!boosterId || boosterId === 0 || boosterId === 'null' || boosterId === 'undefined') {
				console.error('❌ boosterId inválido:', boosterId);

				if (!boosterId || boosterId === 'null' || boosterId === 'undefined') {
					const card = button.closest('.power-card');
					const boosterName = card?.querySelector('[style*="font-weight:800"]')?.textContent;
					console.log('🔍 Buscando booster por nombre:', boosterName);

					try {
						const boostersResponse = await makeRequest('/boosters', 'GET');
						let allBoosters = [];
						if (boostersResponse?.boosters && Array.isArray(boostersResponse.boosters)) {
							allBoosters = boostersResponse.boosters;
						} else if (Array.isArray(boostersResponse)) {
							allBoosters = boostersResponse;
						}

						const foundBooster = allBoosters.find(b =>
							b.booster_name === boosterName ||
							b.booster_name?.toLowerCase() === boosterName?.toLowerCase()
						);

						if (foundBooster && foundBooster.id) {
							boosterId = foundBooster.id;
							card.setAttribute('data-booster-id', boosterId);
							console.log('✅ Booster ID encontrado:', boosterId);
						} else {
							alert('Error: No se pudo encontrar el ID del potenciador. Por favor recarga la página.');
							return;
						}
					} catch (error) {
						console.error('Error buscando booster:', error);
						alert('Error: No se pudo usar el potenciador. Por favor recarga la página.');
						return;
					}
				} else {
					alert('Error: ID de potenciador inválido');
					return;
				}
			}

		button.disabled = true;
		try {
			const numericBoosterId = Number(boosterId);
			if (!numericBoosterId || isNaN(numericBoosterId) || numericBoosterId <= 0) {
				console.error('❌ boosterId inválido después de conversión:', { boosterId, numericBoosterId });
				alert('Error: ID de potenciador inválido. Por favor recarga la página.');
				button.disabled = false;
				return;
			}

			console.log('🎮 Usando potenciador:', { boosterId: numericBoosterId, slug, userId: memoryState.currentUserId });
			const response = await makeRequest(`/users/${memoryState.currentUserId}/boosters/consume`, 'POST', {
				boosterId: numericBoosterId,
			});

			console.log('📦 Respuesta del servidor al consumir:', response);

			if (response.error) {
				console.error('❌ Error del servidor:', response.error);
				alert(response.error);
				button.disabled = false;
				return;
			}

			if (response.success) {
				console.log('✅ Potenciador consumido exitosamente, aplicando efecto...');
				if (response.inventory) {
					memoryState.inventory = response.inventory;
					updatePowerupQuantities(response.inventory);

					const formattedInventory = await formatInventoryList(response.inventory);
					const powerupsBanner = renderPowerupsBar(formattedInventory);
					const existingBanner = document.querySelector('[style*="Potenciadores disponibles"]')?.closest('div[style*="padding:8px"]');
					if (existingBanner) {
						existingBanner.outerHTML = powerupsBanner;
						setTimeout(() => {
							document.querySelectorAll('.power-card .use-power').forEach((btn) => {
								const card = btn.closest('.power-card');
								const boosterId = Number(card?.getAttribute('data-booster-id'));
								const slug = card?.getAttribute('data-booster-slug');
								if (boosterId && slug) {
									btn.addEventListener('click', () => handlePowerupUse(boosterId, slug, btn));
								}
							});
						}, 100);
					}
				}
				applyPowerupEffect(slug);
				showFeedback(`✅ Activaste ${boosterNameBySlug[slug] || 'tu potenciador'}.`);
				console.log('✅ Potenciador usado y efecto aplicado');
			} else {
				console.error('❌ Respuesta inválida del servidor:', response);
				alert(response.error || 'Error al usar el potenciador');
			}
			} catch (error) {
				console.error('❌ Error usando potenciador:', error);
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
					const scoreEarned = 100;

					// Obtener monedas actuales desde múltiples fuentes para asegurar consistencia
					const currentCoinsFromMemory = memoryState.currentUserCoins || 0;
					const currentCoinsFromStorage = parseInt(localStorage.getItem('currentUserCoins') || '0', 10);
					const currentCoins = Math.max(currentCoinsFromMemory, currentCoinsFromStorage);

					// Calcular nuevas monedas
					const newCoins = currentCoins + coinsEarned;

					// Actualizar en ambos lugares
					memoryState.currentUserCoins = newCoins;
					localStorage.setItem('currentUserCoins', newCoins.toString());

					// Actualizar UI inmediatamente
					if (coinsLabel) {
						coinsLabel.textContent = newCoins;
					}

					console.log('✅ Respuesta correcta!', {
						coinsEarned,
						scoreEarned,
						before: currentCoins,
						after: newCoins,
						doublePoints: state.doublePoints
					});

					showFeedback(`¡Correcto! +${coinsEarned} monedas`);

					// Actualizar score usando API PRIMERO
					if (window.memoryState.currentUserId && roomCode) {
						try {
							const { updatePlayerScoreAPI } = await import('../services/roomsRealtime.js');
							await updatePlayerScoreAPI(roomCode, window.memoryState.currentUserId, scoreEarned);
							console.log('✅ Score actualizado:', scoreEarned);
						} catch (error) {
							console.error('Error updating score:', error);
						}
					}

					// Sincronizar monedas con el servidor DESPUÉS
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
					}

					if (state.doublePoints) {
						state.doublePoints = false;
						if (doublePointsPill) doublePointsPill.style.display = 'none';
					}
				} else {
					clickedBtn.style.border = '3px solid #E34C43';
					// No se actualiza score para respuestas incorrectas
				}

				lockAnswers();
				// Asegurar que las monedas se guarden antes de navegar
				if (isCorrect) {
					// Forzar sincronización final antes de navegar
					const finalCoins = memoryState.currentUserCoins || parseInt(localStorage.getItem('currentUserCoins') || '0', 10);
					memoryState.currentUserCoins = finalCoins;
					localStorage.setItem('currentUserCoins', finalCoins.toString());
					console.log('💾 Monedas guardadas antes de navegar:', finalCoins);
				}
				setTimeout(() => goToNextStep(), 800);
			});
		});

		startTimer();

		// Verificación periódica de estado de sala (backup)
		if (roomCode) {
			const roomCheckInterval = setInterval(async () => {
				try {
					if (window.gameEnded) {
						clearInterval(roomCheckInterval);
						return;
					}
					const { checkRoomStatus } = await import('../services/roomsRealtime.js');
					const roomStatus = await checkRoomStatus(roomCode);
					console.log('🔍 Verificando estado de sala (backup):', roomStatus);
					if (!roomStatus.room_status) {
						window.gameEnded = true;
						clearInterval(roomCheckInterval);
						if (state.timer) clearInterval(state.timer);
					if (window.roomCheckInterval) {
						clearInterval(window.roomCheckInterval);
						window.roomCheckInterval = null;
					}
					if (window.roomSubscription) {
						window.roomSubscription.unsubscribe();
						window.roomSubscription = null;
					}
					if (window.inventoryGameChannel) {
						window.inventoryGameChannel.unsubscribe();
						window.inventoryGameChannel = null;
					}
					if (window.geolocationActive) {
						stopGeolocation();
						window.geolocationActive = false;
					}
					navigateTo('/results', { roomCode });
					}
				} catch (error) {
					console.error('Error verificando estado de sala:', error);
				}
			}, 3000);

			window.roomCheckInterval = roomCheckInterval;
		}
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

		console.log('📦 Respuesta completa del servidor:', JSON.stringify(response, null, 2));

		let inventory = [];
		if (response?.success && response.inventory && Array.isArray(response.inventory)) {
			inventory = response.inventory;
		} else if (Array.isArray(response)) {
			inventory = response;
		} else if (response?.inventory && Array.isArray(response.inventory)) {
			inventory = response.inventory;
		} else if (response?.data && Array.isArray(response.data)) {
			inventory = response.data;
		}

		console.log('📦 Inventario extraído:', inventory);

		if (inventory.length === 0) {
			console.warn('⚠️ Inventario vacío del servidor');
			if (memoryState.inventory && memoryState.inventory.length > 0) {
				console.log('📦 Usando inventario de memoryState (fallback):', memoryState.inventory);
				return memoryState.inventory;
			}
			return [];
		}

			inventory = inventory.map(item => {
				const processed = {
					booster_id: item.booster_id || item.id || null,
					booster_name: item.booster_name || item.name || '',
					quantity: Number(item.quantity) || 0,
					booster_hability: item.booster_hability || item.booster_habili || '',
					booster_description: item.booster_description || item.booster_descr || '',
					booster_price: item.booster_price || 0,
				};
				console.log(`📦 Item procesado:`, processed);
				return processed;
			});

			if (inventory.some(item => !item.booster_id)) {
				console.log('⚠️ Algunos items no tienen booster_id, buscando en BD...');
				try {
					const boostersResponse = await makeRequest('/boosters', 'GET');
					let allBoosters = [];
					if (boostersResponse?.boosters && Array.isArray(boostersResponse.boosters)) {
						allBoosters = boostersResponse.boosters;
					} else if (Array.isArray(boostersResponse)) {
						allBoosters = boostersResponse;
					}

					inventory = inventory.map(item => {
						if (!item.booster_id && allBoosters.length > 0) {
							const found = allBoosters.find(b =>
								(b.booster_name || '').toLowerCase() === (item.booster_name || '').toLowerCase()
							);
							if (found && found.id) {
								item.booster_id = found.id;
								console.log(`✅ ID asignado a "${item.booster_name}": ${found.id}`);
							}
						}
						return item;
					});
				} catch (error) {
					console.error('Error cargando boosters para asignar IDs:', error);
				}
			}

			inventory = inventory.filter(item => {
				const hasValidData = item.booster_id && item.booster_name && item.quantity > 0;
				if (!hasValidData) {
					console.warn(`⚠️ Item inválido filtrado:`, item);
				}
				return hasValidData;
			});

		console.log('✅ Inventario procesado y validado:', inventory);
		console.log('📊 Items con quantity > 0:', inventory.map(i => `${i.booster_name}: x${i.quantity} (id: ${i.booster_id})`));

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


async function formatInventoryList(inventory = []) {
	if (!inventory || inventory.length === 0) {
		console.log('⚠️ formatInventoryList: inventario vacío');
		return [];
	}

	console.log('📦 Inventario recibido para formatear:', inventory);

	let allBoosters = [];
	try {
		const boostersResponse = await makeRequest('/boosters', 'GET');
		if (boostersResponse?.boosters && Array.isArray(boostersResponse.boosters)) {
			allBoosters = boostersResponse.boosters;
		} else if (Array.isArray(boostersResponse)) {
			allBoosters = boostersResponse;
		}
		console.log('✅ Boosters cargados para obtener IDs:', allBoosters.length);
	} catch (error) {
		console.warn('⚠️ No se pudieron cargar boosters para obtener IDs:', error);
	}

	const formatted = inventory
		.map((item) => {
			const boosterName = item.booster_name || item.name || '';
			let slug = boosterSlugByName[boosterName];

			if (!slug) {
				for (const [key, value] of Object.entries(boosterSlugByName)) {
					if (boosterName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(boosterName.toLowerCase())) {
						slug = value;
						break;
					}
				}
			}

			if (!slug) {
				slug = boosterName.toLowerCase().replace(/\s+/g, '_');
			}

			let boosterId = item.booster_id || item.id;
			if (!boosterId || boosterId === null || boosterId === undefined) {
				if (allBoosters.length > 0) {
					const foundBooster = allBoosters.find(b => {
						const dbName = b.booster_name || '';
						return dbName === boosterName ||
							dbName.toLowerCase() === boosterName.toLowerCase() ||
							dbName.toLowerCase().includes(boosterName.toLowerCase()) ||
							boosterName.toLowerCase().includes(dbName.toLowerCase());
					});
					if (foundBooster && foundBooster.id) {
						boosterId = foundBooster.id;
						console.log(`✅ ID encontrado para "${boosterName}": ${boosterId} (de BD: ${foundBooster.booster_name})`);
					} else {
						console.warn(`⚠️ No se encontró ID para "${boosterName}" en ${allBoosters.length} boosters disponibles`);
					}
				} else {
					console.warn(`⚠️ No hay boosters cargados para buscar ID de "${boosterName}"`);
				}
			}

			const formattedItem = {
				...item,
				booster_id: boosterId,
				booster_name: boosterName,
				quantity: item.quantity || 0,
				slug,
				icon: boosterAssets[slug] || 'assets/images/Group 4.png',
				description: boosterDescriptions[slug] || '',
			};
			console.log(`📦 Formateando: "${boosterName}" -> quantity: ${formattedItem.quantity}, slug: ${slug}, booster_id: ${formattedItem.booster_id}`);
			return formattedItem;
		})
		.filter((item) => {
			const hasQuantity = (item.quantity || 0) > 0;
			if (!hasQuantity) {
				console.log(`❌ Filtrando "${item.booster_name}" porque quantity es ${item.quantity}`);
			}
			return hasQuantity;
		});

	console.log(`✅ Inventario formateado: ${formatted.length} items con quantity > 0`);
	console.log('📦 Items finales:', formatted.map(i => `${i.booster_name}: x${i.quantity} (id: ${i.booster_id})`));
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
