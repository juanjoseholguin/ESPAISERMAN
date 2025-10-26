import { navigateTo, renderCoinCounter } from '../app.js';

export default function renderLobby({ code } = {}) {
	const app = document.getElementById('app');
	app.innerHTML = `
    <div class="screen active">
      ${renderCoinCounter()}
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
          <div style="background:rgba(255,255,255,0.95); border-radius:20px; padding:16px;">
            <ol id="players-list" style="text-align:left; line-height:28px; margin:0;"></ol>
          </div>
          <button id="btn-start" class="btn-primary" style="margin-top:16px; background:#11A36B; border-color:#0C6E4A;">Empezar partida</button>
        </div>
      </div>
    </div>
  `;

	document.getElementById('back-lobby').addEventListener('click', () => {
		navigateTo('/main');
	});

	const socket = window.io('/', { path: '/real-time' });
	if (code)
		socket.emit('room:join', {
			code,
			playerName: window.memoryState.currentUser || 'Jugador',
			avatar_url: window.memoryState.currentUserAvatar,
			avatar_bg: window.memoryState.currentUserBgColor,
		});

	function renderPlayers(state) {
		const list = document.getElementById('players-list');
		if (!list) return;
		list.innerHTML = '';
		(state.players || []).forEach((p, idx) => {
			const li = document.createElement('li');
			li.className = 'player-item';

			const avatarDiv = document.createElement('div');
			avatarDiv.className = 'player-avatar';
			avatarDiv.style.backgroundColor = p.avatar_bg || '#F9D648';

			const avatarImg = document.createElement('img');
			avatarImg.src = p.avatar_url || '/assets/images/Group 4.png';
			avatarImg.alt = p.name;
			avatarImg.className = 'avatar-img';

			avatarDiv.appendChild(avatarImg);

			const nameSpan = document.createElement('span');
			nameSpan.textContent = p.name;
			nameSpan.className = 'player-name';

			li.appendChild(avatarDiv);
			li.appendChild(nameSpan);
			list.appendChild(li);
		});
		const btn = document.getElementById('btn-start');
		if (btn) btn.style.display = state.hostId === socket.id ? 'inline-block' : 'none';
		const codeEl = document.getElementById('lobby-code');
		if (codeEl && state.code) codeEl.textContent = state.code;
	}

	socket.on('room:state', renderPlayers);
	document.getElementById('btn-start').addEventListener('click', () => {
		const currentCode = (document.getElementById('lobby-code')?.textContent || code || '').trim();
		socket.emit('room:start', { code: currentCode });
	});
	socket.on('room:started', () => {
		alert('¡La partida comenzó!');
	});
}
