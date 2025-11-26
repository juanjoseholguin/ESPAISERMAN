import { navigateTo } from "../app.js";

export default function renderMainMenu() {
  const coins = window.memoryState.currentUserCoins || 1000;
  const app = document.getElementById("app");
  app.innerHTML = `
    <div id="main-menu" class="screen active">
      <div class="main-content" style="gap:24px; align-items:center;">
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:360px;">
          <div style="display:flex; align-items:center; gap:8px; background:#FFE28A; padding:8px 16px; border-radius:16px;">
            <img src="assets/images/Group 19453.png" alt="coin" style="width:24px; height:24px;">
            <span style="font-weight:800; color:#1e3a8a;">${coins}</span>
          </div>
        </div>

        <div class="group4-container" style="margin-top:12px;">
          <img src="assets/images/Group 4.png" alt="Espaiserman Group 4" class="group4-image" style="max-width:360px;">
        </div>

        <button id="btn-join" class="btn-primary" style="max-width:360px;">Unirme a una sala</button>
        <button id="btn-create" class="btn-primary" style="background:#11A36B; border-color:#0C6E4A; max-width:360px;">Crear una sala</button>
        <button id="btn-shop" class="btn-primary" style="background:#E34C43; border-color:#7E1E19; max-width:360px;">Tienda</button>
        <button id="btn-profile" class="btn-primary" style="background:#8FA6E0; border-color:#5A7BC7; max-width:360px;">Perfil</button>
      </div>
    </div>
  `;

  document.getElementById("btn-join").addEventListener("click", () => {
    const b = document.getElementById("btn-join"); b.classList.add("btn-pressed"); setTimeout(()=>b.classList.remove("btn-pressed"),120);
    navigateTo("/join");
  });
  document.getElementById("btn-create").addEventListener("click", () => {
    const b = document.getElementById("btn-create"); b.classList.add("btn-pressed"); setTimeout(()=>b.classList.remove("btn-pressed"),120);
    window.location.href = '/app2/create';
  });
  document.getElementById("btn-profile").addEventListener("click", () => {
    const b = document.getElementById("btn-profile"); b.classList.add("btn-pressed"); setTimeout(()=>b.classList.remove("btn-pressed"),120);
    navigateTo("/profile");
  });
  const shopBtn = document.getElementById("btn-shop");
  if (shopBtn) {
    shopBtn.addEventListener("click", () => {
      shopBtn.classList.add("btn-pressed"); setTimeout(()=>shopBtn.classList.remove("btn-pressed"),120);
      navigateTo("/shop");
    });
  }
}


