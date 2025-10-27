import { navigateTo, generateRoomCode, memoryState } from "../app.js";

export default function renderLobby({ code, category, participants, timePerQuestion } = {}) {
  const app = document.getElementById("app");
  const roomCode = code || generateRoomCode();
  
  app.innerHTML = `
    <div class="screen active">
      <button class="back-button" id="back-lobby"><div class="back-arrow"></div></button>
      <div class="main-content" style="gap:16px;">
        <div class="group4-container" style="margin-top:12px; text-align:center;">
          <img src="/assets/images/Group 4.png" alt="Espaiserman" class="group4-image" style="max-width:220px;">
        </div>
        <h1 class="form-title">Los que están en el parche</h1>
        <div class="form-container" style="text-align:center;">
          <div style="background:rgba(255,226,138,0.95); border-radius:16px; padding:12px 20px; margin:0 auto 16px; display:inline-block;">
            <div style="color:#666; font-size:14px; margin-bottom:4px;">Código de sala</div>
            <div id="lobby-code" style="font-weight:800; color:#1e3a8a; font-size:24px; letter-spacing:4px;">${roomCode}</div>
          </div>
          <div style="background:rgba(255,255,255,0.95); border-radius:20px; padding:16px; min-height:200px;">
            <ol id="players-list" style="text-align:left; line-height:32px; margin:0; list-style-position: inside;"></ol>
          </div>
          <button id="btn-start" class="btn-primary" style="margin-top:16px; background:#11A36B; border-color:#0C6E4A; display:block; margin-left:auto; margin-right:auto; max-width:320px;">Empezar partida</button>
        </div>
      </div>
    </div>
  `;

  const socket = window.socket || window.io("/", { path: "/real-time" });

  function renderPlayers(state) {
    const list = document.getElementById("players-list");
    if (!list) return;
    
    if (!state.players || state.players.length === 0) {
      list.innerHTML = "<li style='text-align:center; color:#666;'>Esperando jugadores...</li>";
      return;
    }
    
    list.innerHTML = "";
    state.players.forEach((p, idx) => {
      const li = document.createElement("li");
      li.style.padding = "8px 0";
      li.style.borderBottom = idx < state.players.length - 1 ? "1px solid rgba(0,0,0,0.1)" : "none";
      li.style.fontSize = "16px";
      li.innerHTML = `<strong>${idx + 1}.</strong> ${p.name}`;
      list.appendChild(li);
    });
    const codeEl = document.getElementById("lobby-code");
    if (codeEl && state.code) codeEl.textContent = state.code;
  }

  socket.off("room:state");
  socket.on("room:state", renderPlayers);
  
  setTimeout(() => {
    document.getElementById("back-lobby").addEventListener("click", () => { navigateTo("/create"); });
    
    document.getElementById("btn-start").addEventListener("click", () => {
      console.log('Starting game with code:', roomCode);
      socket.emit("room:start", { code: roomCode });
      setTimeout(() => {
        navigateTo("/active", { roomCode });
      }, 100);
    });
    
    if (code) {
      console.log("Moderator joining room with code:", code);
      socket.emit("room:join", { 
        code, 
        playerName: window.memoryState.currentUser || "Moderador",
        avatar_url: window.memoryState.currentUserAvatar,
        avatar_bg: window.memoryState.currentUserBgColor,
        isModerator: true
      });
    }
  }, 100);
}
