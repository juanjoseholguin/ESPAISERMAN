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

        <div style="background:rgba(255,255,255,0.95); border-radius:16px; padding:16px; margin:0 16px 16px;">
          <label style="display:block; color:#1e3a8a; font-weight:600; margin-bottom:8px; font-size:14px;">Cantidad de preguntas:</label>
          <select id="num-questions" class="form-input" style="width:100%; padding:12px; border:2px solid #1e3a8a; border-radius:12px; font-size:16px; background:white;">
            <option value="2">2 preguntas</option>
            <option value="3">3 preguntas</option>
            <option value="4">4 preguntas</option>
            <option value="5" selected>5 preguntas</option>
            <option value="6">6 preguntas</option>
            <option value="7">7 preguntas</option>
            <option value="8">8 preguntas</option>
            <option value="9">9 preguntas</option>
            <option value="10">10 preguntas</option>
          </select>
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
				response = await fetch(`https://espaiserman-2yll.vercel.app/questions/category/${category}`);
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

			const numQuestions = parseInt(document.getElementById('num-questions')?.value || '5', 10);
			const selectedQuestions = Array.isArray(questions) ? questions.slice(0, numQuestions) : [];

			console.log('Selected questions count:', selectedQuestions.length);

			try {
				const { createRoomAPI } = await import('../services/roomsRealtime.js');

				let mapPoints = window.customMapPoints;
				if (!mapPoints || mapPoints.length !== numQuestions) {
					const defaultNames = [
						'Edificio A', 'Biblioteca', 'Cafetería', 'Auditorio', 'Laboratorios',
						'Gimnasio', 'Parqueadero', 'Oficinas', 'Aulas', 'Comedor'
					];
					const defaultCoords = [
						[3.3435, -76.533], [3.3438, -76.5332], [3.3442, -76.5328], [3.3439, -76.5325], [3.3445, -76.533],
						[3.3440, -76.5335], [3.3430, -76.5325], [3.3448, -76.5322], [3.3432, -76.5338], [3.3443, -76.5320]
					];
					mapPoints = [];
					for (let i = 0; i < numQuestions; i++) {
						mapPoints.push({
							name: defaultNames[i] || `Punto ${i + 1}`,
							coords: defaultCoords[i] || [3.344 + (i * 0.0005), -76.533 + (i * 0.0005)],
							questionNumber: i + 1
						});
					}
				}

				const roomData = await createRoomAPI(
					window.memoryState.currentUserId,
					parseInt(category, 10),
					participants,
					timePerQuestion,
					mapPoints
				);

				if (!roomData || !roomData.room_pin) {
					throw new Error('La sala se creó pero no se recibió el código');
				}

				const code = roomData.room_pin;
				console.log(`✅ Sala creada con código: ${code}`);
				console.log(`📦 Guardando ${selectedQuestions.length} preguntas`);

				window.roomQuestions = selectedQuestions;
				window.roomTimePerQuestion = timePerQuestion;

				window.roomMapPoints = mapPoints;
				console.log(`📍 ${mapPoints.length} puntos guardados:`, window.roomMapPoints);

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

	let currentMap = null;
	let currentMarkers = [];
	let currentPoints = [];

	setTimeout(() => {
		const numQuestions = parseInt(document.getElementById('num-questions')?.value || '5', 10);
		initMap(category, numQuestions);

		const numQuestionsSelect = document.getElementById('num-questions');
		if (numQuestionsSelect) {
			numQuestionsSelect.addEventListener('change', (e) => {
				const newNum = parseInt(e.target.value, 10);
				updateMapPoints(newNum);
			});
		}
	}, 200);

	function generateDefaultPoints(numPoints) {
		const defaultNames = [
			'Edificio A', 'Biblioteca', 'Cafetería', 'Auditorio', 'Laboratorios',
			'Gimnasio', 'Parqueadero', 'Oficinas', 'Aulas', 'Comedor'
		];

		const defaultCoords = [
			[3.3435, -76.533], [3.3438, -76.5332], [3.3442, -76.5328], [3.3439, -76.5325], [3.3445, -76.533],
			[3.3440, -76.5335], [3.3430, -76.5325], [3.3448, -76.5322], [3.3432, -76.5338], [3.3443, -76.5320]
		];

		const points = [];
		for (let i = 0; i < numPoints; i++) {
			points.push({
				name: defaultNames[i] || `Punto ${i + 1}`,
				coords: defaultCoords[i] || [3.344 + (i * 0.0005), -76.533 + (i * 0.0005)],
				questionNumber: i + 1
			});
		}
		return points;
	}

	function updateMapPoints(numPoints) {
		if (!currentMap || !window.L) return;

		currentMarkers.forEach(marker => {
			currentMap.removeLayer(marker);
		});
		currentMarkers = [];

		currentPoints = generateDefaultPoints(numPoints);
		window.customMapPoints = currentPoints.map(p => ({ ...p }));

		currentPoints.forEach((point, idx) => {
			const icon = L.divIcon({
				className: 'custom-question-marker',
				html: `<div style="background-color: #FFE28A; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #1e3a8a; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: move;"><span style="color: #1e3a8a; font-weight: bold; font-size: 16px;">${
					idx + 1
				}</span></div>`,
				iconSize: [36, 36],
				iconAnchor: [18, 18],
			});

			const marker = L.marker(point.coords, {
				icon: icon,
				draggable: true
			}).addTo(currentMap);

			setupMarker(marker, point, idx);
			currentMarkers.push(marker);
		});

		window.mapMarkers = currentMarkers;
		window.mapPoints = currentPoints;
	}

	function initMap(category, numQuestions = 5) {
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
		currentMap = map;

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap contributors',
		}).addTo(map);

		currentPoints = generateDefaultPoints(numQuestions);
		window.customMapPoints = currentPoints.map(p => ({ ...p }));

		currentPoints.forEach((point, idx) => {
			const icon = L.divIcon({
				className: 'custom-question-marker',
				html: `<div style="background-color: #FFE28A; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #1e3a8a; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: move;"><span style="color: #1e3a8a; font-weight: bold; font-size: 16px;">${
					idx + 1
				}</span></div>`,
				iconSize: [36, 36],
				iconAnchor: [18, 18],
			});

			const marker = L.marker(point.coords, {
				icon: icon,
				draggable: true
			}).addTo(map);

			setupMarker(marker, point, idx);
			currentMarkers.push(marker);
		});

		window.mapMarkers = currentMarkers;
		window.mapPoints = currentPoints;
	}

	function setupMarker(marker, point, idx) {

		const popupContent = document.createElement('div');
		popupContent.style.cssText = 'text-align:center; padding:8px; min-width:180px;';
		popupContent.innerHTML = `
			<strong style="font-size:16px; color:#1e3a8a; display:block; margin-bottom:8px;">Pregunta ${idx + 1}</strong>
			<input type="text" id="point-name-${idx}" value="${point.name}" style="width:100%; padding:6px; border:2px solid #1e3a8a; border-radius:8px; font-size:14px; margin-bottom:8px; text-align:center;">
			<button id="save-name-${idx}" style="background:#11A36B; color:white; border:none; padding:6px 12px; border-radius:8px; font-size:12px; cursor:pointer; width:100%;">Guardar nombre</button>
			<small style="color:#666; display:block; margin-top:8px;">Arrastra el punto para moverlo</small>
		`;

		marker.bindPopup(popupContent);

		setTimeout(() => {
			const saveBtn = document.getElementById(`save-name-${idx}`);
			const nameInput = document.getElementById(`point-name-${idx}`);

			if (saveBtn && nameInput) {
				saveBtn.addEventListener('click', () => {
					const newName = nameInput.value.trim() || point.name;
					currentPoints[idx].name = newName;
					window.customMapPoints[idx].name = newName;
					marker.getPopup().setContent(createPopupContent(idx, newName));
					marker.openPopup();
				});
			}
		}, 100);

		marker.on('dragend', (e) => {
			const newCoords = marker.getLatLng();
			currentPoints[idx].coords = [newCoords.lat, newCoords.lng];
			window.customMapPoints[idx].coords = [newCoords.lat, newCoords.lng];
			console.log(`Punto ${idx + 1} movido a:`, newCoords.lat, newCoords.lng);
		});
	}

	function createPopupContent(idx, name) {
		return `
			<div style="text-align:center; padding:8px; min-width:180px;">
				<strong style="font-size:16px; color:#1e3a8a; display:block; margin-bottom:8px;">Pregunta ${idx + 1}</strong>
				<input type="text" id="point-name-${idx}" value="${name}" style="width:100%; padding:6px; border:2px solid #1e3a8a; border-radius:8px; font-size:14px; margin-bottom:8px; text-align:center;">
				<button id="save-name-${idx}" style="background:#11A36B; color:white; border:none; padding:6px 12px; border-radius:8px; font-size:12px; cursor:pointer; width:100%;">Guardar nombre</button>
				<small style="color:#666; display:block; margin-top:8px;">Arrastra el punto para moverlo</small>
			</div>
		`;
	}
}
