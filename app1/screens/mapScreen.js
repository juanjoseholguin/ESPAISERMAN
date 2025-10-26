import { navigateTo, renderCoinCounter } from '../app.js';

export default function renderMapScreen() {
	const app = document.getElementById('app');
	app.innerHTML = `
    <div class="screen active">
      <div class="status-bar">
        <div class="time">9:41</div>
        <div class="status-icons">
          <div class="signal"></div>
          <div class="wifi"></div>
          <div class="battery"></div>
        </div>
      </div>
      ${renderCoinCounter()}

      <button class="back-button" onclick="navigateTo('/main')">
        <div class="back-arrow"></div>
      </button>

      <div class="map-container">
        <div class="map-header">
          <h2>Distribuye las preguntas en el área</h2>
          <p>Presiona el lugar en el mapa donde deseés poner una ubicación de pregunta</p>
        </div>

        <div id="map" class="map"></div>

        <div class="map-controls">
          <button id="scan-qr" class="btn-primary">Escanear QR</button>
          <button id="view-questions" class="btn-secondary">Ver Preguntas</button>
        </div>
      </div>
    </div>
  `;

	initMap();
	setupMapEvents();
}

function initMap() {
	const icesiCenter = { lat: 3.3412, lng: -76.5302 };

	const map = new google.maps.Map(document.getElementById('map'), {
		zoom: 17,
		center: icesiCenter,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		styles: [
			{
				featureType: 'all',
				elementType: 'geometry.fill',
				stylers: [{ color: '#1e3a8a' }],
			},
			{
				featureType: 'road',
				elementType: 'geometry',
				stylers: [{ color: '#3b82f6' }],
			},
			{
				featureType: 'poi',
				elementType: 'labels.text.fill',
				stylers: [{ color: '#ffffff' }],
			},
		],
	});

	const icesiPoints = [
		{ lat: 3.3412, lng: -76.5302, name: 'Edificio A', questionId: 1 },
		{ lat: 3.3408, lng: -76.5298, name: 'Biblioteca', questionId: 2 },
		{ lat: 3.3416, lng: -76.5306, name: 'Cafetería', questionId: 3 },
		{ lat: 3.3404, lng: -76.5304, name: 'Auditorio', questionId: 4 },
		{ lat: 3.3418, lng: -76.5296, name: 'Laboratorios', questionId: 5 },
		{ lat: 3.34, lng: -76.53, name: 'Parqueadero', questionId: 6 },
		{ lat: 3.342, lng: -76.53, name: 'Cancha Deportiva', questionId: 7 },
	];

	icesiPoints.forEach((point, index) => {
		const marker = new google.maps.Marker({
			position: { lat: point.lat, lng: point.lng },
			map: map,
			title: point.name,
			icon: {
				url:
					'data:image/svg+xml;charset=UTF-8,' +
					encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="#FFD700" stroke="#FF4444" stroke-width="2"/>
            <text x="20" y="25" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#000">?</text>
          </svg>
        `),
				scaledSize: new google.maps.Size(40, 40),
			},
		});

		marker.addListener('click', () => {
			showQuestionModal(point.questionId, point.name);
		});
	});

	window.currentMap = map;
}

function showQuestionModal(questionId, locationName) {
	const modal = document.createElement('div');
	modal.style.cssText =
		'position:fixed; inset:0; background:rgba(0,0,0,.7); display:flex; align-items:center; justify-content:center; z-index:1000;';
	modal.innerHTML = `
    <div style="background:#F9D648; border-radius:20px; padding:20px; width:90%; max-width:400px; text-align:center;">
      <h3 style="margin:0 0 10px 0; color:#1e3a8a;">Pregunta en ${locationName}</h3>
      <div id="question-content" style="background:#fff; border-radius:12px; padding:16px; margin:12px 0;">
        <div id="question-text">Cargando pregunta...</div>
        <div id="question-answers" style="margin-top:12px;"></div>
      </div>
      <button id="close-question" class="btn-primary" style="background:#1e3a8a;">Cerrar</button>
    </div>`;

	document.body.appendChild(modal);

	loadQuestion(questionId);

	modal.querySelector('#close-question').addEventListener('click', () => modal.remove());
}

async function loadQuestion(questionId) {
	try {
		const response = await fetch(`http://localhost:5050/questions/${questionId}`);
		const question = await response.json();

		const questionText = document.getElementById('question-text');
		const questionAnswers = document.getElementById('question-answers');

		questionText.textContent = question.question;

		const answers = JSON.parse(question.answer);
		questionAnswers.innerHTML = answers
			.map(
				(answer, index) => `
      <button class="answer-btn" data-answer="${answer}" style="
        width:100%; padding:12px; margin:4px 0; border:none; border-radius:8px;
        background:${['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][index]};
        color:white; font-weight:bold; cursor:pointer;
      ">${answer}</button>
    `
			)
			.join('');

		questionAnswers.querySelectorAll('.answer-btn').forEach((btn) => {
			btn.addEventListener('click', (e) => {
				const selectedAnswer = e.target.dataset.answer;
				const isCorrect = selectedAnswer === question.correct_answer;

				e.target.style.background = isCorrect ? '#11A36B' : '#FF4444';
				e.target.innerHTML = `${selectedAnswer} ${isCorrect ? '✓' : '✗'}`;

				setTimeout(() => {
					document.querySelector('[style*="position:fixed"]').remove();
				}, 2000);
			});
		});
	} catch (error) {
		console.error('Error loading question:', error);
		document.getElementById('question-text').textContent = 'Error cargando la pregunta';
	}
}

function setupMapEvents() {
	document.getElementById('scan-qr').addEventListener('click', () => {
		startQRScan();
	});

	document.getElementById('view-questions').addEventListener('click', () => {
		navigateTo('/questions');
	});
}

function startQRScan() {
	if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
		const modal = document.createElement('div');
		modal.style.cssText =
			'position:fixed; inset:0; background:rgba(0,0,0,.9); display:flex; align-items:center; justify-content:center; z-index:1000;';
		modal.innerHTML = `
      <div style="background:#fff; border-radius:16px; padding:20px; width:90%; max-width:300px; text-align:center;">
        <h3>Escanear QR</h3>
        <video id="qr-video" style="width:100%; border-radius:8px;"></video>
        <button id="close-scan" class="btn-primary" style="margin-top:12px;">Cerrar</button>
      </div>`;

		document.body.appendChild(modal);

		const video = modal.querySelector('#qr-video');
		const closeBtn = modal.querySelector('#close-scan');

		navigator.mediaDevices
			.getUserMedia({ video: { facingMode: 'environment' } })
			.then((stream) => {
				video.srcObject = stream;
				video.play();
			})
			.catch((err) => {
				console.error('Error accessing camera:', err);
				video.innerHTML = '<p>No se puede acceder a la cámara</p>';
			});

		closeBtn.addEventListener('click', () => {
			if (video.srcObject) {
				video.srcObject.getTracks().forEach((track) => track.stop());
			}
			modal.remove();
		});
	} else {
		alert('La cámara no está disponible en este dispositivo');
	}
}
