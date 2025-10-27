import { navigateTo } from '../app.js';

export default function renderGameResults({ results = [] }) {
	const app = document.getElementById('app');

	app.innerHTML = `
    <div class="screen active">
      <div class="main-content" style="gap:16px;">
        <div class="group4-container" style="margin-top:12px; text-align:center;">
          <img src="/assets/images/Group 4.png" alt="Espaiserman" class="group4-image" style="max-width:220px;">
        </div>
        <h1 class="form-title">¡Se acabó esta vuelta!</h1>
        <p style="text-align:center; font-size:18px; margin-top:-16px; margin-bottom:8px; color:#1e3a8a; font-weight:bold;">"¡Rosca! ¡Rosca!"<br/>El ganador es...</p>
        <div class="form-container" style="text-align:center;">
          <div style="background:rgba(255,255,255,0.95); border-radius:20px; padding:16px;">
            <ol id="results-list" style="text-align:left; line-height:32px; margin:0; font-size:16px; font-weight:bold; color:#1e3a8a;"></ol>
          </div>
          <button id="btn-finish" class="btn-primary" style="background:#11A36B; border-color:#0C6E4A; margin-top:16px;">Finalizar partida</button>
        </div>
      </div>
    </div>
  `;

	const mockResults =
		results.length > 0 ? results : [{ name: window.memoryState?.currentUser || 'Usuario', score: 0, highlight: true }];

	const sorted = mockResults.sort((a, b) => b.score - a.score);
	const list = document.getElementById('results-list');

	sorted.forEach((player, idx) => {
		const li = document.createElement('li');
		li.style.padding = '8px 0';
		li.style.borderBottom = idx < sorted.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none';
		if (idx === 0) {
			li.style.color = '#E34C43';
			li.style.fontSize = '18px';
		}
		li.innerHTML = `${player.name} - ${player.score.toLocaleString('es-CO')} pts`;
		list.appendChild(li);
	});

	setTimeout(() => {
		document.getElementById('btn-finish').addEventListener('click', () => {
			alert('¡Gracias por jugar! La partida ha finalizado.');
			navigateTo('/create');
		});
	}, 100);
}
