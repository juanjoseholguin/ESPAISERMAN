import { navigateTo, makeRequest, renderCoinCounter } from '../app.js';

export default function renderCreateRoom() {
	const app = document.getElementById('app');
	app.innerHTML = `
    <div class="screen active">
      <div class="status-bar"><div class="time">9:41</div><div class="status-icons"><div class="signal"></div><div class="wifi"></div><div class="battery"></div></div></div>
      ${renderCoinCounter()}
      <button class="back-button" id="back-create"><div class="back-arrow"></div></button>
      <div class="main-content" style="gap:16px;">
        <div class="group4-container" style="margin-top:12px; text-align:center;">
          <img src="/assets/images/Group 4.png" alt="Espaiserman" class="group4-image" style="max-width:240px;">
        </div>
        <h1 class="form-title">Crear sala</h1>
        <div class="form-container">
          <div class="input-group">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Selecciona una categoría</label>
            <select id="category" class="form-input">
              <option value="">Cargando categorías...</option>
            </select>
          </div>
          <div class="input-group">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Número de participantes (2-10)</label>
            <input type="number" id="participants" placeholder="Ej: 4 participantes" class="form-input" min="2" max="10">
          </div>
          <div class="input-group">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Tiempo por pregunta</label>
            <select id="timePerQuestion" class="form-input">
              <option value="15">15 segundos (rápido)</option>
              <option value="30" selected>30 segundos (normal)</option>
              <option value="60">60 segundos (lento)</option>
            </select>
          </div>
          <div class="input-group">
            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">Número de preguntas (5-50)</label>
            <input type="number" id="numQuestions" placeholder="Ej: 10 preguntas" class="form-input" min="5" max="50" value="10">
          </div>
          <button id="btn-go-lobby" class="btn-primary" style="background:#11A36B; border-color:#0C6E4A;">Crear sala</button>
        </div>
      </div>
    </div>
  `;

	// Cargar categorías al inicializar
	loadCategories();

	document.getElementById('back-create').addEventListener('click', () => {
		navigateTo('/main');
	});

	document.getElementById('btn-go-lobby').addEventListener('click', async () => {
		const categoryId = document.getElementById('category').value;
		const participants = parseInt(document.getElementById('participants').value || 0, 10);
		const timePerQuestion = parseInt(document.getElementById('timePerQuestion').value || 0, 10);
		const numQuestions = parseInt(document.getElementById('numQuestions').value || 0, 10);

		if (!categoryId || !participants || !timePerQuestion || !numQuestions) {
			alert('Completa todos los campos');
			return;
		}

		try {
			// Verificar que hay suficientes preguntas en la categoría
			const questionsResponse = await makeRequest(`/categories/${categoryId}/questions`, 'GET');

			if (questionsResponse.length < numQuestions) {
				alert(
					`Esta categoría solo tiene ${questionsResponse.length} preguntas disponibles. Selecciona un número menor.`
				);
				return;
			}

			// Crear sala
			const socket = window.io('/', { path: '/real-time' });
			const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
			let code = '';
			for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];

			socket.emit('room:create', {
				code,
				categoryId,
				maxParticipants: participants,
				timePerQuestion,
				numQuestions,
				host: window.memoryState?.currentUser,
			});

			socket.on('room:created', () => navigateTo('/lobby', { code }));
		} catch (error) {
			console.error('Error creando sala:', error);
			alert('Error al crear la sala. Inténtalo de nuevo.');
		}
	});

	async function loadCategories() {
		try {
			console.log('📂 Cargando categorías desde http://localhost:5050/categories...');
			const categories = await makeRequest('/categories', 'GET');

			console.log('📊 Respuesta del servidor:', categories);

			if (!categories || !Array.isArray(categories)) {
				console.error('❌ Respuesta inválida:', typeof categories, categories);
				throw new Error('Respuesta inválida del servidor');
			}

			const categorySelect = document.getElementById('category');
			categorySelect.innerHTML = '<option value="">Selecciona una categoría</option>';

			if (categories.length === 0) {
				console.warn('⚠️ No hay categorías en la base de datos');
				categorySelect.innerHTML = '<option value="">No hay categorías disponibles</option>';
				alert('No hay categorías disponibles en la base de datos. Contacta al administrador.');
				return;
			}

			categories.forEach((category) => {
				const option = document.createElement('option');
				option.value = category.id;
				option.textContent = category.name;
				categorySelect.appendChild(option);
				console.log(`   ✓ Agregada: ${category.name} (ID: ${category.id})`);
			});

			console.log(`✅ ${categories.length} categorías cargadas exitosamente`);
		} catch (error) {
			console.error('❌ Error cargando categorías:', error);
			console.error('   Detalles:', error.message);
			const categorySelect = document.getElementById('category');
			categorySelect.innerHTML = '<option value="">Error cargando categorías</option>';
			alert(`Error al cargar las categorías: ${error.message}`);
		}
	}
}
