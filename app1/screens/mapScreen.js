import { navigateTo, renderCoinCounter } from '../app.js';

export default function renderMapScreen() {
	const app = document.getElementById('app');
	app.innerHTML = `
    <div class="screen active">
      ${renderCoinCounter()}

      <button class="back-button" onclick="navigateTo('/main')">
        <div class="back-arrow"></div>
      </button>

      <div class="map-container">
        <div class="map-header">
          <h2>Distribuye las preguntas en el área</h2>
          <p>Presiona el lugar en el mapa donde deseés poner una ubicación de pregunta</p>
        </div>

        <div id="map" class="map" style="display: flex; align-items: center; justify-content: center; overflow: auto; background: #f3f4f6;">
          <img src="/assets/images/mapaicesi.png" alt="Mapa ICESI" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px;">
        </div>

        <div class="map-controls">
          <button id="view-questions" class="btn-primary">Ver Preguntas</button>
        </div>
      </div>
    </div>
  `;

	setupMapEvents();
}

function setupMapEvents() {
	document.getElementById('view-questions').addEventListener('click', () => {
		navigateTo('/questions');
	});
}
