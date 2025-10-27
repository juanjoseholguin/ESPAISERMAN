import { navigateTo } from "../app.js";

export default async function renderCreateRoom() {
  const app = document.getElementById("app");
  
  try {
    const response = await fetch("http://localhost:5050/categories");
    console.log('Response status:', response.status);
    const categories = await response.json();
    console.log('Categories received:', categories);
    
    if (!categories || categories.length === 0) {
      console.warn('No categories found');
    }
    
    const categoryOptions = categories.map(cat => 
      `<option value="${cat.id}">${cat.category}</option>`
    ).join('');

    app.innerHTML = `
    <div class="screen active">
      <button class="back-button" id="back-create"><div class="back-arrow"></div></button>
      <div class="main-content" style="gap:16px;">
        <div class="group4-container" style="margin-top:12px; text-align:center;">
          <img src="/assets/images/Group 4.png" alt="Espaiserman" class="group4-image" style="max-width:240px;">
        </div>
        <h1 class="form-title">Crear sala</h1>
        <div class="form-container">
          <div class="input-group">
            <select id="category" class="form-input">
              <option value="">Selecciona una categoría</option>
              ${categoryOptions}
            </select>
          </div>
          <div class="input-group">
            <input type="number" id="participants" placeholder="Escribe el número de participantes" class="form-input" min="2" max="10">
          </div>
          <div class="input-group">
          <h4>Tiempo por pregunta</h4>
            <input type="number" id="timePerQuestion" placeholder="Tiempo por pregunta" class="form-input" min="10" max="60" value="30">
          </div>
          <button id="btn-go-lobby" class="btn-primary" style="background:#11A36B; border-color:#0C6E4A;">Organizar preguntas</button>
        </div>
      </div>
    </div>
  `;

    document.getElementById("back-create").addEventListener("click", () => { 
      if (window.location.pathname.includes('/app2')) {
        window.location.href = '/app1/';
      } else {
        navigateTo("/");
      }
    });
    document.getElementById("btn-go-lobby").addEventListener("click", () => {
      const category = document.getElementById("category").value;
      const participants = parseInt(document.getElementById("participants").value || 0, 10);
      const timePerQuestion = parseInt(document.getElementById("timePerQuestion").value || 0, 10);
      if (!category || !participants || !timePerQuestion) { alert("Completa todos los campos"); return; }
      navigateTo("/distribute", { category, participants, timePerQuestion });
    });
  } catch (error) {
    console.error('Error loading categories:', error);
    app.innerHTML = `
      <div style="padding:20px; text-align:center;">
        <h2>Error cargando categorías</h2>
        <p>${error.message}</p>
        <p>Verifica que el servidor esté corriendo y el endpoint esté disponible.</p>
      </div>
    `;
  }
}

