import { navigateTo } from "../app.js";

export default function renderJoinRoom() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="screen active">
      <div class="status-bar"><div class="time">9:41</div><div class="status-icons"><div class="signal"></div><div class="wifi"></div><div class="battery"></div></div></div>
      <button class="back-button" id="back-join"><div class="back-arrow"></div></button>
      <div class="main-content" style="gap:16px;">
        <div class="group4-container" style="margin-top:12px; text-align:center;">
          <img src="/assets/images/Group 4.png" alt="Espaiserman" class="group4-image" style="max-width:240px;">
        </div>
        <h1 class="form-title">Unirme a una sala</h1>
        <div class="form-container">
          <div class="input-group"><input type="text" id="room-code" placeholder="Escribe el ID de la sala" class="form-input"></div>
          <button id="btn-join-room" class="btn-primary">Unirme a una sala</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("back-join").addEventListener("click", () => { navigateTo("/main"); });
  document.getElementById("btn-join-room").addEventListener("click", () => {
    const code = (document.getElementById("room-code").value || "").toUpperCase().trim();
    if (!code) { alert("Ingresa el código"); return; }
    const socket = window.io("/", { path: "/real-time" });
    const playerName = window.memoryState?.currentUser || "Jugador";
    socket.emit("room:join", { 
      code, 
      playerName,
      avatar_url: window.memoryState.currentUserAvatar,
      avatar_bg: window.memoryState.currentUserBgColor
    });
    socket.on("room:error", (e) => alert(e.message));
    socket.on("room:joined", () => navigateTo("/lobby", { code }));
  });
}


