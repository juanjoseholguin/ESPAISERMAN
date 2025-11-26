import { navigateTo, generateRoomCode } from '../app.js';

export default async function renderDistributeQuestions({ category, participants, timePerQuestion } = {}) {
	const app = document.getElementById('app');

	app.innerHTML = `
    <div class="screen active">
      <button class="back-button" id="distribute-back-btn">
        <div class="back-arrow"></div>
      </button>

      <div class="map-container">
        <div class="map-header">
          <h2 style="text-align:center; color:#1e3a8a; font-size:24px; margin-bottom:8px;">Distribuye las preguntas en el área</h2>
          <p style="text-align:center; color:#666; margin-bottom:16px;">Visualiza el campus de Icesi</p>
        </div>

        <div id="map" style="width:100%; height:400px; border-radius:16px; overflow:hidden; margin:16px 0; touch-action: pan-x pan-y;"></div>

        <div style="margin:16px 0; text-align:center;">
          <button id="create-room-btn" class="btn-primary" style="background:#11A36B; border-color:#0C6E4A; max-width:320px;">Crear sala</button>
        </div>
      </div>
    </div>
  `;

	document.getElementById('distribute-back-btn').addEventListener('click', () => {
		navigateTo('/create');
	});

	document.getElementById('create-room-btn').addEventListener('click', async () => {
		if (!category || !participants || !timePerQuestion) {
			alert('Por favor completa todos los campos en la pantalla anterior');
			return;
		}

		try {
			let questions;
			let response;

			try {
				response = await fetch(`http://localhost:5050/questions/category/${category}`);
				questions = await response.json();
			} catch (fetchError) {
				console.warn('Failed to fetch questions from server, using mock:', fetchError);
				questions = [];
			}

			if (!Array.isArray(questions) || questions.length === 0) {
				alert(
					'No hay preguntas disponibles para esta categoría en Supabase. Asegúrate de que la tabla questions tenga datos.'
				);
				return;
			}

			console.log(`Found ${questions.length} questions for category ${category}`);

			const selectedQuestions = Array.isArray(questions) ? questions.slice(0, 5) : [];

			console.log('Selected questions count:', selectedQuestions.length);

			// Crear sala usando API
			try {
				const { createRoomAPI } = await import('../services/roomsRealtime.js');
				const roomData = await createRoomAPI(
					window.memoryState.currentUserId,
					parseInt(category, 10),
					participants,
					timePerQuestion
				);

				if (!roomData || !roomData.room_pin) {
					throw new Error('La sala se creó pero no se recibió el código');
				}

				const code = roomData.room_pin;
				console.log(`✅ Sala creada con código: ${code}`);
				console.log(`📦 Guardando ${selectedQuestions.length} preguntas`);
				
				window.roomQuestions = selectedQuestions;
				window.roomTimePerQuestion = timePerQuestion;
				window.currentQuestionIndex = 1;
				localStorage.removeItem(`room_${code}_questionIndex`);
				localStorage.setItem(`room_${code}_questionIndex`, '1');
				console.log('🔄 Contador de preguntas reiniciado a 1 para nueva sala');
				
				// Esperar un momento para que la sala se guarde completamente
				await new Promise(resolve => setTimeout(resolve, 300));
				
				navigateTo('/lobby', { code, category, participants, timePerQuestion });
			} catch (error) {
				console.error('Error creating room:', error);
				alert(`Error al crear la sala: ${error.message}`);
			}
		} catch (error) {
			console.error('Error loading questions:', error);
			alert(`Error al cargar las preguntas: ${error.message}`);
		}
	});

	setTimeout(() => {
		initMap(category);
	}, 200);
}

function initMap(category) {
	const mapDiv = document.getElementById('map');
	if (!mapDiv || !window.L) return;

	const icesiCoords = [3.344, -76.5329];

	const map = L.map(mapDiv, {
		dragging: true,
		touchZoom: true,
		scrollWheelZoom: false,
		doubleClickZoom: true,
		boxZoom: false,
		keyboard: false,
	}).setView(icesiCoords, 17);

	map.leaflet = true;

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '© OpenStreetMap contributors',
	}).addTo(map);

	const points = [
		{ name: 'Edificio A', coords: [3.3435, -76.533] },
		{ name: 'Biblioteca', coords: [3.3438, -76.5332] },
		{ name: 'Cafetería', coords: [3.3442, -76.5328] },
		{ name: 'Auditorio', coords: [3.3439, -76.5325] },
		{ name: 'Laboratorios', coords: [3.3445, -76.533] },
	];

	points.forEach((point, idx) => {
		const icon = L.divIcon({
			className: 'custom-question-marker',
			html: `<div style="background-color: #FFE28A; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #1e3a8a; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><span style="color: #1e3a8a; font-weight: bold; font-size: 16px;">${
				idx + 1
			}</span></div>`,
			iconSize: [36, 36],
			iconAnchor: [18, 18],
		});

		const marker = L.marker(point.coords, { icon: icon }).addTo(map).bindPopup(`
        <div style="text-align:center; padding:8px; min-width:120px;">
          <strong style="font-size:16px; color:#1e3a8a;">${point.name}</strong><br/>
          <small style="color:#666;">Pregunta ${idx + 1}</small><br/>
          <small style="color:#666;">${category || 'Sin categoría'}</small>
        </div>
      `);
	});
}
