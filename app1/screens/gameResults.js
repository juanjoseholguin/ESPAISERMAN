import { navigateTo } from '../app.js';

export default async function renderGameResults({ roomCode } = {}) {
	const app = document.getElementById('app');

	app.innerHTML = `
    <div class="screen active">
      <div class="main-content" style="gap:16px; justify-content:center;">
        <div class="group4-container" style="text-align:center;">
          <img src="/assets/images/Group 4.png" alt="Espaiserman" class="group4-image" style="max-width:200px;">
        </div>
        <h1 style="color:#1e3a8a; text-align:center; font-size:32px; margin-bottom:8px;">¡Se acabó esta vuelta!</h1>
        <p style="text-align:center; font-size:18px; margin-top:-16px; margin-bottom:8px; color:#1e3a8a; font-weight:bold;">"¡Rosca! ¡Rosca!"<br/>El ganador es...</p>
        <div class="form-container" style="text-align:center; background:rgba(255,255,255,0.95); border-radius:20px; padding:16px;">
          <ol id="results-list" style="text-align:left; line-height:32px; margin:0; font-size:16px; font-weight:bold; color:#1e3a8a;"></ol>
        </div>
        <button id="btn-back" class="btn-primary" style="background:#1E3A8A; border-color:#0E1A34; max-width:240px; margin:0 auto;">Volver al Menú</button>
      </div>
    </div>
  `;

	// Cargar resultados desde la API
	let results = [];
	try {
		const { getRoomResultsAPI } = await import('../services/roomsRealtime.js');
		const apiResults = await getRoomResultsAPI(roomCode);
		results = apiResults.map(r => ({ name: r.player_name, score: r.score || 0 }));
	} catch (error) {
		console.error('Error loading results:', error);
	}

	function renderResults(playerResults = []) {
		const list = document.getElementById('results-list');
		if (!list) return;

		if (playerResults.length === 0) {
			list.innerHTML = "<li style='text-align:center; color:#666;'>Esperando resultados...</li>";
			return;
		}

		const sorted = [...playerResults].sort((a, b) => b.score - a.score);
		list.innerHTML = '';

		sorted.forEach((player, idx) => {
			const li = document.createElement('li');
			li.style.padding = '8px 0';
			li.style.borderBottom = idx < sorted.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none';
			if (idx === 0) {
				li.style.color = '#E34C43';
				li.style.fontSize = '18px';
			}
			li.innerHTML = `${player.name} - ${player.score} pts`;
			list.appendChild(li);
		});
	}

	setTimeout(() => {
		renderResults(results);

		document.getElementById('btn-back').addEventListener('click', () => {
			window.currentQuestionIndex = 1;
			navigateTo('/main');
		});
	}, 100);
}
