import { navigateTo, updateCoins } from "../app.js";

export default function renderCorrectAnswer() {
  const app = document.getElementById("app");
  
  app.innerHTML = `
    <div class="screen active" style="justify-content: center;">
      <div style="text-align:center;">
        <div style="width:120px; height:120px; border-radius:50%; background:#11A36B; margin:40px auto 24px; display:flex; align-items:center; justify-content:center;">
          <span style="font-size:64px;">✓</span>
        </div>
        <div style="background:rgba(255,226,138,0.95); border-radius:20px; padding:24px; margin:0 20px; max-width:360px; margin-left:auto; margin-right:auto;">
          <h2 style="color:#11A36B; font-size:28px; margin:0 0 12px 0;">¡Así es!</h2>
          <p style="color:#11A36B; font-size:20px; margin:0 0 12px 0; font-weight:bold;">Le pegó al perro.</p>
          <p style="color:#1e3a8a; font-size:32px; margin:0 0 12px 0; font-weight:800;">+1000 pts</p>
          <p style="color:#1e3a8a; font-size:16px; margin:0;">¡Subidón!</p>
          <p style="color:#666; font-size:14px; margin-top:8px; margin-bottom:0;">Ahora sí lo ven de atrás.</p>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    updateCoins(100, 'add');
    setTimeout(() => {
      navigateTo('/active');
    }, 2000);
  }, 500);
}

