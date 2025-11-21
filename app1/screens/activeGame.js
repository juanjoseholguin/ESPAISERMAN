import { navigateTo } from '../app.js';

export default function renderActiveGame({ roomCode } = {}) {
	const app = document.getElementById('app');
	const currentQuestion = window.currentQuestionIndex || 1;
	const timePerQuestion = window.roomTimePerQuestion || 30;

	const socket = window.socket;
	let questions = window.roomQuestions || [];

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

	const points = [
		{ name: 'Edificio A', coords: [3.3435, -76.533] },
		{ name: 'Biblioteca', coords: [3.3438, -76.5332] },
		{ name: 'Cafetería', coords: [3.3442, -76.5328] },
		{ name: 'Auditorio', coords: [3.3439, -76.5325] },
		{ name: 'Laboratorios', coords: [3.3445, -76.533] },
	];

	const currentPoint = points[currentQuestion - 1] || points[0];
	const activePowerups = JSON.parse(localStorage.getItem('activePowerups') || '[]');

	const powerupNames = {
		guaro: 'Media',
		chicharron: 'Chichaghrrrom',
		empanada: 'Empanadirri',
		cafe: 'Café'
	};

	app.innerHTML = `
    <div class="screen active">
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px;">
        <div style="display:flex; align-items:center; gap:8px; background:#FFE28A; padding:8px 16px; border-radius:16px;">
          <img src="/assets/images/Group 19453.png" alt="coin" style="width:24px; height:24px;">
          <span style="font-weight:800; color:#1e3a8a; font-size:16px;">${
						window.memoryState.currentUserCoins || 1000
					}</span>
        </div>
        <div style="font-weight:800; color:#1e3a8a;">${window.memoryState.currentUser || 'Jugador'}</div>
      </div>

      ${activePowerups.length > 0 ? `
      <div style="display:flex; gap:8px; padding:8px 16px; margin-bottom:8px; overflow-x:auto; background:rgba(255,226,138,0.3);">
        <div style="font-weight:bold; color:#1e3a8a; margin-right:8px; display:flex; align-items:center;">⚡ Potenciadores:</div>
        ${activePowerups.map(powerup => `
          <div style="background:rgba(255,226,138,0.95); padding:6px 10px; border-radius:10px; display:flex; align-items:center; gap:6px; min-width:fit-content; border:2px solid #1e3a8a;">
            <img src="/assets/images/${powerup}.png" alt="${powerup}" style="width:28px; height:28px; object-fit:contain;">
            <span style="font-size:13px; font-weight:bold; color:#1e3a8a;">${powerupNames[powerup] || powerup}</span>
          </div>
        `).join('')}
      </div>
      ` : ''}

      <div id="map-game" style="width:100%; height:300px; position:relative; margin:12px 16px; border-radius:16px; overflow:hidden; background:#1e3a8a;">
        <div style="position:absolute; top:20px; left:20px; right:20px; background:rgba(255,255,255,0.95); padding:12px; border-radius:12px; z-index:1000;">
          <div style="font-weight:bold; color:#1e3a8a;">Campus Icesi - Punto ${currentQuestion}/5</div>
        </div>
        <div style="position:absolute; bottom:20px; right:20px; background:rgba(255,226,138,0.95); padding:8px 12px; border-radius:8px; z-index:1000;">
          <div style="font-weight:bold;">📍 ${currentPoint.name}</div>
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.95); border-radius:16px; padding:20px; margin:0 16px;">
        <div style="background:#e5e7eb; border-radius:12px; overflow:hidden; margin-bottom:12px; height:32px; position:relative;">
          <div id="timer-bar" style="background:linear-gradient(90deg, #11A36B 0%, #FFB347 50%, #E34C43 100%); height:100%; width:100%; transition:width 0.1s linear; display:flex; align-items:center; justify-content:center;">
            <span id="timer-text" style="color:white; font-weight:bold; font-size:16px; position:relative; z-index:1;">${timePerQuestion}s</span>
          </div>
        </div>
        <h2 style="text-align:center; color:#1e3a8a; font-size:20px; margin-bottom:16px;">${question.q}</h2>

        <div style="display:flex; flex-direction:column; gap:10px;">
          ${question.options
						.map(
							(opt, idx) => `
            <button class="answer-btn" data-answer="${opt}" style="background:${
								['#E34C43', '#11A36B', '#FFB347', '#8FA6E0'][idx]
							}; padding:12px; border:none; border-radius:12px; text-align:left; color:white; font-size:16px;">
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

		let answered = false;
		let timeLeft = timePerQuestion;
		let currentActivePowerups = JSON.parse(localStorage.getItem('activePowerups') || '[]');
		let timeFrozen = false;
		let doublePoints = false;
		let freezeEndTime = 0;

		console.log('Potenciadores activos al inicio:', currentActivePowerups);

		if (currentActivePowerups.includes('guaro')) {
			timeLeft += 5;
			timeFrozen = true;
			freezeEndTime = Date.now() + 5000;
			currentActivePowerups = currentActivePowerups.filter(p => p !== 'guaro');
			localStorage.setItem('activePowerups', JSON.stringify(currentActivePowerups));
			console.log('Media activado: +5 segundos y tiempo congelado por 5s');
		}

		if (currentActivePowerups.includes('cafe')) {
			timeLeft = Math.max(10, timeLeft - 10);
			currentActivePowerups = currentActivePowerups.filter(p => p !== 'cafe');
			localStorage.setItem('activePowerups', JSON.stringify(currentActivePowerups));
			console.log('Café activado: tiempo reducido');
		}

		if (currentActivePowerups.includes('chicharron')) {
			doublePoints = true;
			console.log('Chichaghrrrom activado: puntos dobles');
		}

		if (currentActivePowerups.includes('empanada')) {
			currentActivePowerups = currentActivePowerups.filter(p => p !== 'empanada');
			localStorage.setItem('activePowerups', JSON.stringify(currentActivePowerups));
			console.log('Empanadirri usado');
		}

		const timerBar = document.getElementById('timer-bar');
		const timerText = document.getElementById('timer-text');
		timerText.textContent = `${timeLeft}s`;
		const initialPercentage = (timeLeft / timePerQuestion) * 100;
		timerBar.style.width = `${Math.min(100, initialPercentage)}%`;

		const timerInterval = setInterval(() => {
			if (answered) {
				clearInterval(timerInterval);
				return;
			}

			if (timeFrozen && Date.now() < freezeEndTime) {
				return;
			} else if (timeFrozen && Date.now() >= freezeEndTime) {
				timeFrozen = false;
			}

			timeLeft--;
			timerText.textContent = `${timeLeft}s`;
			const percentage = (timeLeft / timePerQuestion) * 100;
			timerBar.style.width = `${Math.max(0, percentage)}%`;

			if (timeLeft <= 0) {
				clearInterval(timerInterval);
				answered = true;
				document.querySelectorAll('.answer-btn').forEach((btn) => {
					btn.disabled = true;
					btn.style.opacity = '0.5';
				});

				setTimeout(() => {
					if (currentQuestion < formattedQuestions.length) {
						window.currentQuestionIndex = currentQuestion + 1;
						navigateTo('/active', { roomCode });
					} else {
						window.currentQuestionIndex = 1;
						navigateTo('/results', { roomCode });
					}
				}, 1000);
			}
		}, 1000);

		document.querySelectorAll('.answer-btn').forEach((btn) => {
			btn.addEventListener('click', (e) => {
				if (answered) return;
				answered = true;
				clearInterval(timerInterval);

				const answer = e.target.closest('.answer-btn').dataset.answer;
				const correct = answer === question.correct;

				const clickedBtn = e.target.closest('.answer-btn');
				clickedBtn.style.opacity = '0.7';
				clickedBtn.style.transform = 'scale(0.95)';

				if (correct) {
					clickedBtn.style.border = '3px solid #11A36B';
					const currentScore = window.memoryState.currentUserCoins || 1000;
					const pointsEarned = doublePoints ? 200 : 100;
					window.memoryState.currentUserCoins = currentScore + pointsEarned;
					localStorage.setItem('currentUserCoins', window.memoryState.currentUserCoins);

					if (doublePoints) {
						currentActivePowerups = currentActivePowerups.filter(p => p !== 'chicharron');
						localStorage.setItem('activePowerups', JSON.stringify(currentActivePowerups));
						console.log('Chichaghrrrom usado: puntos dobles aplicados');
					}

					if (socket) {
						socket.emit('player:answer', {
							roomCode,
							correct: true,
							playerName: window.memoryState.currentUser,
						});
					}
				} else {
					clickedBtn.style.border = '3px solid #E34C43';

					if (socket) {
						socket.emit('player:answer', {
							roomCode,
							correct: false,
							playerName: window.memoryState.currentUser,
						});
					}
				}

				setTimeout(() => {
					if (currentQuestion < formattedQuestions.length) {
						window.currentQuestionIndex = currentQuestion + 1;
						navigateTo('/active', { roomCode });
					} else {
						window.currentQuestionIndex = 1;
						navigateTo('/results', { roomCode });
					}
				}, 1500);
			});
		});
	}, 100);
}

