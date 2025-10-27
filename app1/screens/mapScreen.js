import { navigateTo } from "../app.js";

export default function renderMapScreen({ category, participants, timePerQuestion } = {}) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="screen active">
      <button class="back-button" id="map-back-btn">
        <div class="back-arrow"></div>
      </button>

      <div class="map-container">
        <div class="map-header">
          <h2 style="text-align:center; color:#1e3a8a; font-size:24px; margin-bottom:8px;">Distribuye las preguntas en el área</h2>
          <p style="text-align:center; color:#666; margin-bottom:16px;">Presiona el lugar en el mapa donde deseés poner una ubicación de pregunta</p>
        </div>
        
        <div id="map" style="width:100%; height:400px; background:#1e3a8a; border-radius:16px; position:relative; overflow:hidden; margin:16px 0;">
          <div style="position:absolute; inset:0; background:url('/assets/images/icesi-map.jpg') center/cover no-repeat;">
            <div style="position:absolute; top:20px; left:20px; right:20px; background:rgba(255,255,255,0.95); padding:12px; border-radius:12px;">
              <div style="font-weight:bold; color:#1e3a8a;">ICESI Campus Map</div>
              <div style="font-size:12px; color:#666;">Categoría: ${category || 'Seleccionar'}</div>
            </div>
          </div>
          
          <div style="position:absolute; top:80px; left:20px; background:rgba(255,226,138,0.95); padding:8px 12px; border-radius:8px;">
            <div style="font-weight:bold;">Edificio A</div>
            <div style="font-size:12px;">📍</div>
          </div>
          
          <div style="position:absolute; bottom:100px; right:40px; background:rgba(255,226,138,0.95); padding:8px 12px; border-radius:8px;">
            <div style="font-weight:bold;">Biblioteca</div>
            <div style="font-size:12px;">📍</div>
          </div>
          
          <div style="position:absolute; top:150px; left:40px; background:rgba(255,226,138,0.95); padding:8px 12px; border-radius:8px;">
            <div style="font-weight:bold;">Cafetería</div>
            <div style="font-size:12px;">📍</div>
          </div>
          
          <div style="position:absolute; bottom:80px; left:60px; background:rgba(255,226,138,0.95); padding:8px 12px; border-radius:8px;">
            <div style="font-weight:bold;">Auditorio</div>
            <div style="font-size:12px;">📍</div>
          </div>
          
          <div style="position:absolute; top:60px; right:60px; background:rgba(255,226,138,0.95); padding:8px 12px; border-radius:8px;">
            <div style="font-weight:bold;">Laboratorios</div>
            <div style="font-size:12px;">📍</div>
          </div>
        </div>
        
        <div style="margin:16px 0; text-align:center;">
          <button id="create-room-btn" class="btn-primary" style="background:#11A36B; border-color:#0C6E4A; max-width:320px;">Crear sala</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('map-back-btn').addEventListener('click', () => {
    navigateTo('/main');
  });
}