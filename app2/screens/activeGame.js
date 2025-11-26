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

	// Obtener el número de pregunta actual (por defecto 1)
	const currentQuestion = window.currentQuestionIndex || 1;
	const totalQuestions = window.roomQuestions?.length || 5;

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
		
		// Suscribirse a cambios en tiempo real
		subscription = subscribeToRoom(roomCode, async (state) => {
			console.log('🔄 Cambio detectado en sala (app2 activeGame), recargando estado...');
			// Recargar el estado completo para obtener los scores actualizados
			const updatedState = await loadRoomState(roomCode);
			if (updatedState && updatedState.players) {
				currentPlayers = updatedState.players.map((p) => ({ 
					name: p.player_name || p.name || 'Jugador', 
					score: p.score || 0 
				}));
				console.log('📊 Players updated:', currentPlayers);
				renderScores(currentPlayers);
			}
		});
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

	setTimeout(() => {
		renderScores(currentPlayers);

		document.getElementById('back-active').addEventListener('click', () => {
			if (subscription) subscription.unsubscribe();
			navigateTo('/lobby', { code: roomCode });
		});

		document.getElementById('btn-end-game').addEventListener('click', () => {
			navigateTo('/results', { results: currentPlayers });
		});
	}, 100);
}
