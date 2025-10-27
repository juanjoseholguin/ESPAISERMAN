import { navigateTo } from '../app.js';

export default function renderLobby({ code } = {}) {
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
            <ol id="players-list" style="text-align:left; line-height:32px; margin:0; list-style-position: inside;"></ol>
          </div>
          <p style="color:#666; margin-top:16px; font-size:14px;">Esperando a que el moderador inicie la partida...</p>
        </div>
      </div>
    </div>
  `;

	const socket = window.socket || window.io('/', { path: '/real-time' });
	let hasJoined = false;

	function renderPlayers(state) {
		const list = document.getElementById('players-list');
		if (!list) return;

		if (!state.players || state.players.length === 0) {
			list.innerHTML = "<li style='text-align:center; color:#666;'>Esperando jugadores...</li>";
			return;
		}

		const uniquePlayers = [...new Map(state.players.map((p) => [p.id || p.name, p])).values()];

		list.innerHTML = '';
		uniquePlayers.forEach((p, idx) => {
			const li = document.createElement('li');
			li.style.padding = '8px 0';
			li.style.borderBottom = idx < uniquePlayers.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none';
			li.style.fontSize = '16px';
			li.innerHTML = `${p.name || 'Jugador'}`;
			list.appendChild(li);
		});
		const codeEl = document.getElementById('lobby-code');
		if (codeEl && state.code) codeEl.textContent = state.code;
	}

	socket.off('room:state');
	socket.off('room:started');
	socket.off('room:error');
	socket.off('room:joined');

	socket.on('room:state', renderPlayers);

	socket.on('room:started', async (data) => {
		console.log('Game started, navigating to active game');
		console.log('Question IDs:', data.questionIds);

		try {
			const questionPromises = data.questionIds.map((id) =>
				fetch(`http://localhost:5050/questions/${id}`).then((res) => res.json())
			);

			const questions = await Promise.all(questionPromises);
			window.roomQuestions = questions;
			console.log('Questions loaded:', questions);

			navigateTo('/active', { roomCode: code });
		} catch (error) {
			console.error('Error loading questions:', error);
			alert('Error cargando las preguntas. Intenta de nuevo.');
		}
	});

	socket.on('room:error', (error) => {
		console.error('Room error:', error);
		alert(error.message || 'Error al unirse a la sala');
	});

	setTimeout(() => {
		const backBtn = document.getElementById('back-lobby');
		if (backBtn) {
			backBtn.addEventListener('click', () => {
				navigateTo('/main');
			});
		}

		if (code && !hasJoined) {
			hasJoined = true;
			console.log('Joining room with code:', code);
			socket.emit('room:join', {
				code,
				playerName: window.memoryState.currentUser || 'Jugador',
				avatar_url: window.memoryState.currentUserAvatar,
				avatar_bg: window.memoryState.currentUserBgColor,
			});
		}
	}, 100);
}
