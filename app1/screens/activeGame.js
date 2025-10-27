import { navigateTo } from '../app.js';

export default function renderActiveGame({ roomCode } = {}) {
	const app = document.getElementById('app');
	const currentQuestion = window.currentQuestionIndex || 1;

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

      <div id="map-game" style="width:100%; height:300px; background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); position:relative; margin:12px 16px; border-radius:16px; overflow:hidden;">
        <div style="position:absolute; top:20px; left:20px; right:20px; background:rgba(255,255,255,0.95); padding:12px; border-radius:12px;">
          <div style="font-weight:bold; color:#1e3a8a;">Campus Icesi - Punto ${currentQuestion}/5</div>
        </div>
        <div style="position:absolute; bottom:20px; right:20px; background:rgba(255,226,138,0.95); padding:8px 12px; border-radius:8px;">
          <div style="font-weight:bold;">📍 Edificio A</div>
        </div>
      </div>

      <div style="background:rgba(255,255,255,0.95); border-radius:16px; padding:20px; margin:0 16px;">
        <div style="background:#1e3a8a; border-radius:12px; padding:4px 12px; margin-bottom:12px; text-align:center; color:white; font-weight:bold;">10s</div>
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
		let answered = false;

		document.querySelectorAll('.answer-btn').forEach((btn) => {
			btn.addEventListener('click', (e) => {
				if (answered) return;
				answered = true;

				const answer = e.target.closest('.answer-btn').dataset.answer;
				const correct = answer === question.correct;

				const clickedBtn = e.target.closest('.answer-btn');
				clickedBtn.style.opacity = '0.7';
				clickedBtn.style.transform = 'scale(0.95)';

				if (correct) {
					clickedBtn.style.border = '3px solid #11A36B';
					const currentScore = window.memoryState.currentUserCoins || 1000;
					window.memoryState.currentUserCoins = currentScore + 100;
					localStorage.setItem('currentUserCoins', window.memoryState.currentUserCoins);

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
