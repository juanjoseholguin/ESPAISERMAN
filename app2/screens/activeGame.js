import { navigateTo } from "../app.js";

export default function renderActiveGame({ roomCode } = {}) {
  const app = document.getElementById("app");
  
  app.innerHTML = `
    <div class="screen active">
      <button class="back-button" id="back-active"><div class="back-arrow"></div></button>
      <div class="main-content" style="gap:16px;">
        <div class="group4-container" style="margin-top:12px; text-align:center;">
          <img src="/assets/images/Group 4.png" alt="Espaiserman" class="group4-image" style="max-width:220px;">
        </div>
        
        <div style="display:flex; justify-content:center; margin-top:-12px;">
          <div style="background:rgba(255,226,138,0.95); padding:8px 16px; border-radius:16px;">
            <span style="font-weight:800; color:#1e3a8a; font-size:18px;">Pregunta 1 de 5</span>
          </div>
        </div>
        
        <div style="background:rgba(255,255,255,0.95); border-radius:16px; padding:20px; margin:0 16px;">
          <p style="text-align:center; color:#666; margin:0; font-size:16px;">Los jugadores están respondiendo...</p>
        </div>
        
        <div style="background:rgba(255,255,255,0.95); border-radius:16px; padding:20px; margin:0 16px;">
          <h3 style="text-align:center; color:#1e3a8a; font-size:20px; margin-bottom:16px; font-weight:800;">📊 Tabla de Posiciones en Tiempo Real</h3>
          <ol id="live-scores" style="text-align:left; line-height:32px; margin:0; list-style-position: inside; font-size:16px;"></ol>
        </div>
        
        <button id="btn-end-game" class="btn-primary" style="background:#E34C43; border-color:#7E1E19; max-width:320px; margin:0 auto;">Finalizar Partida</button>
      </div>
    </div>
  `;

  let currentPlayers = [];
  
  const socket = window.socket;
  
  socket.off("room:state");
  
  socket.on("room:state", (state) => {
    console.log("Room state received in app2 activeGame:", state);
    if (state.players && state.players.length > 0) {
      currentPlayers = state.players.map(p => ({ name: p.name, score: p.score || 0 }));
    } else {
      currentPlayers = [];
    }
    renderScores(currentPlayers);
  });
  
  if (roomCode) {
    socket.emit("room:state-request", { code: roomCode });
  }

  function renderScores(players = []) {
    const list = document.getElementById("live-scores");
    if (!list) return;
    
    if (players.length === 0) {
      list.innerHTML = "<li style='text-align:center; color:#666;'>Esperando jugadores...</li>";
      return;
    }
    
    const uniquePlayers = [...new Map(players.map(p => [p.name, p])).values()];
    const sorted = uniquePlayers.sort((a, b) => b.score - a.score);
    
    list.innerHTML = "";
    sorted.forEach((p, idx) => {
      const li = document.createElement("li");
      li.style.padding = "4px 0";
      li.style.borderBottom = idx < sorted.length - 1 ? "1px solid rgba(0,0,0,0.1)" : "none";
      li.innerHTML = `<strong>${idx + 1}.</strong> ${p.name} - <strong style="color:#11A36B;">${p.score}</strong> pts`;
      if (idx === 0) li.style.color = "#E34C43";
      list.appendChild(li);
    });
  }

  setTimeout(() => {
    renderScores(currentPlayers);
    
    document.getElementById("back-active").addEventListener("click", () => {
      navigateTo("/lobby");
    });
    
    document.getElementById("btn-end-game").addEventListener("click", () => {
      navigateTo('/results', { results: currentPlayers });
    });
  }, 100);
}

