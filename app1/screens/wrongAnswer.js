import { navigateTo } from "../app.js";

export default function renderWrongAnswer() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="screen active" style="justify-content: center;">
      <div style="text-align:center;">
        <div style="width:120px; height:120px; border-radius:50%; background:#E34C43; margin:40px auto 24px; display:flex; align-items:center; justify-content:center;">
          <span style="font-size:64px; color:white;">✗</span>
        </div>
        <div style="background:rgba(255,226,138,0.95); border-radius:20px; padding:24px; margin:0 20px; max-width:360px; margin-left:auto; margin-right:auto;">
          <h2 style="color:#E34C43; font-size:28px; margin:0 0 12px 0;">Se la cambiaron en el camino, cierto?</h2>
          <p style="color:#1e3a8a; font-size:20px; margin:0 0 12px 0; font-weight:bold;">No suma, llorelo</p>
          <p style="color:#666; font-size:14px; margin-top:8px; margin-bottom:0;">Se dejó tumbar, parcero... bajó un puesto.</p>
          <div style="background:#8FA6E0; margin-top:16px; border-radius:8px; padding:8px;">
            <p style="color:white; font-size:14px; margin:0; font-weight:bold;">La partida terminará en 3, 2, 1...</p>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    navigateTo('/active');
  }, 2000);
}

