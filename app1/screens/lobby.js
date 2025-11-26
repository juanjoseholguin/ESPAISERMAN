import { navigateTo } from '../app.js';

export default async function renderLobby({ code } = {}) {
	const app = document.getElementById('app');
	app.innerHTML = `
    <div class="screen active">
      <button class="back-button" id="back-lobby"><div class="back-arrow"></div></button>
      <div class="main-content" style="gap:16px;">
        <div class="group4-container" style="margin-top:12px; text-align:center;">
          <img src="/assets/images/Group 4.png" alt="Espaiserman" class="group4-image" style="max-width:220px;">
        </div>
        <h1 class="form-title">Los que están en el parche</h1>
        <div class="form-container" style="text-align:center;">
          <div id="lobby-code" style="margin:8px auto 16px; display:inline-block; padding:8px 16px; background:#FFE28A; border-radius:12px; font-weight:800;">${
						code || 'SAM 000'
					}</div>
          <div style="background:rgba(255,255,255,0.95); border-radius:20px; padding:16px; min-height:200px;">
            <ul id="players-list" style="text-align:left; line-height:32px; margin:0; list-style:none; padding:0;"></ul>
          </div>
          <p id="waiting-message" style="color:#666; margin-top:16px; font-size:14px;">Esperando a que el moderador inicie la partida...</p>
        </div>
      </div>
    </div>
  `;

	let subscription = null;
	let hasJoined = false;

	function renderPlayers(state) {
		const list = document.getElementById('players-list');
		if (!list) return;

		console.log('🎮 Rendering players with state:', state);

		if (!state || !state.players || state.players.length === 0) {
			list.innerHTML = "<li style='text-align:center; color:#666;'>Esperando jugadores...</li>";
			return;
		}

		const uniquePlayers = [...new Map(state.players.map((p) => [p.id || p.user_id || p.name, p])).values()];

		console.log(`👥 Rendering ${uniquePlayers.length} unique players:`, uniquePlayers);

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

		// Actualizar mensaje de espera
		const waitingMsg = document.getElementById('waiting-message');
		if (waitingMsg) {
			if (state.room_status) {
				waitingMsg.textContent = '¡La partida está iniciando...!';
				waitingMsg.style.color = '#11A36B';
			} else {
				waitingMsg.textContent = 'Esperando a que el moderador inicie la partida...';
				waitingMsg.style.color = '#666';
			}
		}

		// Cargar puntos personalizados si están disponibles
		if (state.map_points && Array.isArray(state.map_points) && state.map_points.length > 0) {
			window.roomMapPoints = state.map_points;
			console.log('📍 Puntos personalizados cargados:', window.roomMapPoints);
		} else if (!window.roomMapPoints) {
			// Usar puntos por defecto si no hay personalizados
			window.roomMapPoints = [
				{ name: 'Edificio A', coords: [3.3435, -76.533], questionNumber: 1 },
				{ name: 'Biblioteca', coords: [3.3438, -76.5332], questionNumber: 2 },
				{ name: 'Cafetería', coords: [3.3442, -76.5328], questionNumber: 3 },
				{ name: 'Auditorio', coords: [3.3439, -76.5325], questionNumber: 4 },
				{ name: 'Laboratorios', coords: [3.3445, -76.533], questionNumber: 5 },
			];
		}

		// Verificar si la sala inició (los jugadores no necesitan roomQuestions, solo verificar room_status)
		if (state.room_status) {
			console.log('🎮 Game started, navigating to active game');
			if (subscription) subscription.unsubscribe();
			// Pequeño delay para que el usuario vea el mensaje de "iniciando"
			setTimeout(() => {
				navigateTo('/active', { roomCode: code });
			}, 500);
		}
	}

	// Cargar estado inicial
	const { subscribeToRoom, loadRoomState } = await import('../services/roomsRealtime.js');

	// Función para recargar el estado
	const reloadRoomState = async () => {
		console.log(`🔄 Reloading room state for: ${code}`);
		const state = await loadRoomState(code);
		if (state) {
			console.log(`✅ State reloaded:`, state);
			renderPlayers(state);
		} else {
			console.warn(`⚠️ No state returned for room ${code}`);
		}
	};

	// Cargar estado inicial
	if (code) {
		await reloadRoomState();
	}

	// Suscribirse a cambios en tiempo real
	if (code) {
		subscription = subscribeToRoom(code, async (state) => {
			console.log('🔄 Cambio detectado en sala, recargando estado...');
			// Recargar el estado completo cuando hay cambios
			const updatedState = await reloadRoomState();

			// Si la sala se inicia (room_status cambia a true), navegar automáticamente
			if (updatedState && updatedState.room_status) {
				console.log('🎮 Room started detected via Realtime, navigating to active game');
				// Actualizar mensaje antes de navegar
				const waitingMsg = document.getElementById('waiting-message');
				if (waitingMsg) {
					waitingMsg.textContent = '¡La partida está iniciando...!';
					waitingMsg.style.color = '#11A36B';
				}
				if (subscription) subscription.unsubscribe();
				// Guardar información de la sala antes de navegar
				const roomState = await reloadRoomState();
				if (roomState) {
					window.roomTimePerQuestion = roomState.timePerQuestion;
					window.roomCategory = roomState.category;

					// Cargar puntos personalizados desde la base de datos
					if (roomState.map_points && Array.isArray(roomState.map_points) && roomState.map_points.length > 0) {
						window.roomMapPoints = roomState.map_points;
						console.log('📍 Puntos personalizados cargados desde la base de datos:', window.roomMapPoints);
					} else {
						// Usar puntos por defecto si no hay personalizados
						window.roomMapPoints = [
							{ name: 'Edificio A', coords: [3.3435, -76.533], questionNumber: 1 },
							{ name: 'Biblioteca', coords: [3.3438, -76.5332], questionNumber: 2 },
							{ name: 'Cafetería', coords: [3.3442, -76.5328], questionNumber: 3 },
							{ name: 'Auditorio', coords: [3.3439, -76.5325], questionNumber: 4 },
							{ name: 'Laboratorios', coords: [3.3445, -76.533], questionNumber: 5 },
						];
						console.log('📍 Usando puntos por defecto (no hay personalizados)');
					}
				}

				// Pequeño delay para que el usuario vea el mensaje de "iniciando"
				setTimeout(() => {
					navigateTo('/active', { roomCode: code });
				}, 500);
			}
		});
	}

	setTimeout(async () => {
		const backBtn = document.getElementById('back-lobby');
		if (backBtn) {
			backBtn.addEventListener('click', () => {
				if (subscription) subscription.unsubscribe();
				navigateTo('/main');
			});
		}

		if (code && !hasJoined) {
			hasJoined = true;
			console.log('Joining room with code:', code);
			try {
				const { joinRoomAPI } = await import('../services/roomsRealtime.js');
				const result = await joinRoomAPI(
					code,
					window.memoryState.currentUserId,
					window.memoryState.currentUser || 'Jugador',
					window.memoryState.currentUserAvatar,
					window.memoryState.currentUserBgColor,
					false
				);
				console.log('✅ Successfully joined room:', result);

				// Recargar el estado después de unirse para ver el jugador en la lista
				// Esperar un poco más para que Supabase procese el INSERT
				setTimeout(async () => {
					console.log('🔄 Recargando estado después de unirse...');
					await reloadRoomState();
				}, 1000);
			} catch (error) {
				console.error('Error joining room:', error);
				alert(error.message || 'Error al unirse a la sala');
			}
		}
	}, 100);
}
