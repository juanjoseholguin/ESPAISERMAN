import { navigateTo } from "../app.js";

export default function renderCreateRoom() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="screen active">
      <div class="status-bar"><div class="time">9:41</div><div class="status-icons"><div class="signal"></div><div class="wifi"></div><div class="battery"></div></div></div>
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
              <option value="cultura-general-colombiana">Cultura General Colombiana</option>
              <option value="deportes">Deportes</option>
              <option value="superheroes">Superhéroes</option>
            </select>
          </div>
          <div class="input-group">
            <input type="number" id="participants" placeholder="Escribe el número de participantes" class="form-input" min="2" max="10">
          </div>
          <div class="input-group">
            <input type="number" id="timePerQuestion" placeholder="Tiempo por pregunta" class="form-input" min="10" max="60" value="30">
          </div>
          <button id="btn-go-lobby" class="btn-primary" style="background:#11A36B; border-color:#0C6E4A;">Organizar preguntas</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("back-create").addEventListener("click", () => { navigateTo("/main"); });
  document.getElementById("btn-go-lobby").addEventListener("click", () => {
    const category = document.getElementById("category").value;
    const participants = parseInt(document.getElementById("participants").value || 0, 10);
    const timePerQuestion = parseInt(document.getElementById("timePerQuestion").value || 0, 10);
    if (!category || !participants || !timePerQuestion) { alert("Completa todos los campos"); return; }
    const socket = window.io("/", { path: "/real-time" });
    const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let code = ""; for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random()*alphabet.length)];
    socket.emit("room:create", { code, category, maxParticipants: participants, timePerQuestion, host: window.memoryState?.currentUser });
    socket.on("room:created", () => navigateTo("/lobby", { code }));
  });
}


