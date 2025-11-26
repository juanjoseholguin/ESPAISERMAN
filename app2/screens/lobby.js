import { navigateTo, generateRoomCode, memoryState } from '../app.js';

export default async function renderLobby({ code, category, participants, timePerQuestion } = {}) {
	const app = document.getElementById('app');
	const roomCode = code;

	app.innerHTML = `
    <div class="screen active">
      <button class="back-button" id="back-lobby"><div class="back-arrow"></div></button>
      <div class="main-content" style="gap:16px;">
        <div class="group4-container" style="margin-top:12px; text-align:center;">
          <img src="assets/images/Group 4.png" alt="Espaiserman" class="group4-image" style="max-width:220px;">
        </div>
        <h1 class="form-title">Los que están en el parche</h1>
        <div class="form-container" style="text-align:center;">
          <div style="background:rgba(255,226,138,0.95); border-radius:16px; padding:12px 20px; margin:0 auto 16px; display:inline-block;">
            <div style="color:#666; font-size:14px; margin-bottom:4px;">Código de sala</div>
            <div id="lobby-code" style="font-weight:800; color:#1e3a8a; font-size:24px; letter-spacing:4px;">${roomCode || 'CARGANDO...'}</div>
          </div>
          <div style="background:rgba(255,255,255,0.95); border-radius:20px; padding:16px; min-height:200px;">
            <ul id="players-list" style="text-align:left; line-height:32px; margin:0; list-style:none; padding:0;"></ul>
          </div>
          <button id="btn-start" class="btn-primary" style="margin-top:16px; background:#11A36B; border-color:#0C6E4A; display:block; margin-left:auto; margin-right:auto; max-width:320px;">Empezar partida</button>
        </div>
      </div>
    </div>
  `;

	let subscription = null;

	function renderPlayers(state) {
		const list = document.getElementById('players-list');
		if (!list) return;

		console.log('🎮 Rendering players (app2) with state:', state);

		if (!state || !state.players || state.players.length === 0) {
			list.innerHTML = "<li style='text-align:center; color:#666;'>Esperando jugadores...</li>";
			return;
		}

		const uniquePlayers = [...new Map(state.players.map((p) => [p.id || p.user_id || p.name, p])).values()];

		console.log(`👥 Rendering ${uniquePlayers.length} unique players (app2):`, uniquePlayers);

		list.innerHTML = '';
		uniquePlayers.forEach((p, idx) => {
			const li = document.createElement('li');
			li.style.padding = '8px 0';
			li.style.borderBottom = idx < uniquePlayers.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none';
			li.style.fontSize = '16px';
			// Usar player_name si existe, sino name
			const playerName = p.player_name || p.name || 'Jugador';
			li.innerHTML = `${idx + 1}. ${playerName}`;
			list.appendChild(li);
		});
		const codeEl = document.getElementById('lobby-code');
		if (codeEl && state.code) codeEl.textContent = state.code;
	}

	// Cargar estado inicial
	const { subscribeToRoom, loadRoomState } = await import('../services/roomsRealtime.js');
	
	// Función para recargar el estado
	const reloadRoomState = async () => {
		console.log(`🔄 Reloading room state for: ${roomCode}`);
		const state = await loadRoomState(roomCode);
		if (state) {
			console.log(`✅ State reloaded:`, state);
			renderPlayers(state);
			return state;
		} else {
			console.warn(`⚠️ No state returned for room ${roomCode}`);
		}
		return null;
	};
	
	// Cargar estado inicial - esperar un poco si la sala acaba de crearse
	if (roomCode) {
		// Si la sala acaba de crearse, esperar un momento antes de cargar
		await new Promise(resolve => setTimeout(resolve, 500));
		await reloadRoomState();
	}

	// Suscribirse a cambios en tiempo real
	if (roomCode) {
		subscription = subscribeToRoom(roomCode, async (state) => {
			console.log('🔄 Cambio detectado en sala (app2), recargando estado...');
			// Recargar el estado completo cuando hay cambios
			const updatedState = await reloadRoomState();
			
			// Si la sala se inicia (room_status cambia a true), navegar automáticamente
			if (updatedState && updatedState.room_status && window.roomQuestions) {
				console.log('Room started detected via Realtime, navigating to active game');
				if (subscription) subscription.unsubscribe();
				navigateTo('/active', { roomCode });
			}
		});
	}

	setTimeout(async () => {
		document.getElementById('back-lobby').addEventListener('click', () => {
			if (subscription) subscription.unsubscribe();
			navigateTo('/create');
		});

		document.getElementById('btn-start').addEventListener('click', async () => {
			console.log('Starting game with code:', roomCode);
			try {
				const { startRoomAPI, loadRoomState } = await import('../services/roomsRealtime.js');
				await startRoomAPI(roomCode, window.memoryState.currentUserId);
				
				window.currentQuestionIndex = 1;
				localStorage.removeItem(`room_${roomCode}_questionIndex`);
				localStorage.setItem(`room_${roomCode}_questionIndex`, '1');
				console.log('🔄 Contador de preguntas reiniciado a 1 al iniciar partida');
				
				// Esperar un momento para que se actualice el estado
				await new Promise(resolve => setTimeout(resolve, 500));
				
				// Verificar que la sala realmente inició
				const roomState = await loadRoomState(roomCode);
				if (roomState && roomState.room_status && window.roomQuestions) {
					console.log('Room started successfully, navigating to active game');
					navigateTo('/active', { roomCode });
				} else {
					console.warn('Room status not updated yet or no questions available');
					alert('La sala se está iniciando. Por favor espera un momento e intenta de nuevo.');
				}
			} catch (error) {
				console.error('Error starting room:', error);
				alert(error.message || 'Error al iniciar la sala');
			}
		});

		if (roomCode) {
			console.log('Moderator joining room with code:', roomCode);
			try {
				const { joinRoomAPI } = await import('../services/roomsRealtime.js');
				await joinRoomAPI(
					roomCode,
					window.memoryState.currentUserId,
					window.memoryState.currentUser || 'Moderador',
					window.memoryState.currentUserAvatar,
					window.memoryState.currentUserBgColor,
					true
				);
				console.log('✅ Moderator joined successfully');
				
				// Recargar el estado después de unirse
				setTimeout(async () => {
					console.log('🔄 Recargando estado después de unirse (moderador)...');
					await reloadRoomState();
				}, 1000);
			} catch (error) {
				console.error('Error joining room:', error);
			}
		}
	}, 100);
}
