import { navigateTo, updateCoins } from "../app.js";

export default function renderShop() {
  const coins = window.memoryState.currentUserCoins || 1000;
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="screen active">
      <button class="back-button" id="back-shop"><div class="back-arrow"></div></button>
      <div class="main-content" style="gap:16px;">
        <div class="group4-container" style="margin-top:12px; text-align:center;">
          <img src="/assets/images/Group 4.png" alt="Espaiserman" class="group4-image" style="max-width:220px;">
        </div>
        <h1 class="form-title">Tienda</h1>
        <p style="text-align:center; opacity:.8; margin-top:-8px;">Con estos potenciadores vas a llegar más alto que Jaime</p>
        <div style="display:flex; justify-content:center; align-items:center; gap:8px; background:#FFE28A; padding:8px 16px; border-radius:16px; margin:0 auto 16px;">
          <img src="/assets/images/Group 19453.png" alt="coin" style="width:24px; height:24px;">
          <span style="font-weight:800; color:#1e3a8a;">${coins}</span>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <button class="shop-card" data-item="empanada" style="background:rgba(255,255,255,0.85); border-radius:20px; padding:12px; text-align:center; border:none;">
            <img src="/assets/images/empanada.png" alt="Empanadirri" style="width:100%; max-width:96px; margin:0 auto; display:block;">
            <div style="font-weight:800; margin-top:8px;">Empanadirri</div>
          </button>
          <button class="shop-card" data-item="guaro" style="background:rgba(255,255,255,0.85); border-radius:20px; padding:12px; text-align:center; border:none;">
            <img src="/assets/images/guaro.png" alt="Media" style="width:100%; max-width:96px; margin:0 auto; display:block;">
            <div style="font-weight:800; margin-top:8px;">Media</div>
          </button>
          <button class="shop-card" data-item="chicharron" style="background:rgba(255,255,255,0.85); border-radius:20px; padding:12px; text-align:center; border:none;">
            <img src="/assets/images/chicharron.png" alt="Chichaghrrrom" style="width:100%; max-width:96px; margin:0 auto; display:block;">
            <div style="font-weight:800; margin-top:8px;">Chichaghrrrom</div>
          </button>
          <button class="shop-card" data-item="cafe" style="background:rgba(255,255,255,0.85); border-radius:20px; padding:12px; text-align:center; border:none;">
            <img src="/assets/images/cafe.png" alt="Café" style="width:100%; max-width:96px; margin:0 auto; display:block;">
            <div style="font-weight:800; margin-top:8px;">Café</div>
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("back-shop").addEventListener("click", () => { navigateTo("/main"); });

  const modal = document.createElement("div");
  modal.style.cssText = "position:fixed; inset:0; display:none; align-items:center; justify-content:center; background:rgba(0,0,0,.55); z-index:999; backdrop-filter: blur(2px);";
  modal.innerHTML = `
    <div id="shop-modal" style="background:rgba(249,214,72,0.95); border-radius:24px; padding:20px; width:85%; max-width:320px; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,.4);">
      <h2 id="m-title" style="margin-bottom:4px; font-size:26px;">Título</h2>
      <div id="m-sub" style="opacity:.9; margin-bottom:12px;">Subtítulo</div>
      <div style="background:rgba(255,226,138,0.95); border-radius:16px; padding:12px; margin:12px 0;">
        <img id="m-img" src="" alt="item" style="width:110px; display:block; margin:0 auto;">
      </div>
      <div style="font-weight:800; margin:4px 0 2px 0;">"<span id=\"m-phrase\">Frase</span>"</div>
      <div id="m-desc" style="opacity:.9; margin-bottom:16px;">Descripción</div>
      <div style="display:flex; gap:12px; justify-content:center;">
        <button id="m-back" class="btn-primary" style="max-width:140px; background:#1E3A8A; border-color:#0E1A34;">←</button>
        <button id="m-buy" class="btn-primary" style="max-width:180px; background:#11A36B; border-color:#0C6E4A;">Comprar <img src="/assets/images/Group 19453.png" style="width:16px; height:16px; vertical-align:middle;">200</button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  function openModal(key) {
    const data = {
      empanada: { title: "Empanadirri", sub: "Potenciador de energía", img: "/assets/images/empanada.png", phrase: "Pa' aguantar el hambre", desc: "Recupera una vida" },
      guaro: { title: "Media", sub: "Aguardiente del tiempo", img: "/assets/images/guaro.png", phrase: "Emborrachar el reloj", desc: "Suma 5 segundos más al reloj" },
      chicharron: { title: "Chichaghrrrom", sub: "Peganito pero sabroso", img: "/assets/images/chicharron.png", phrase: "Calle y diente", desc: "Duplica tu próximo puntaje" },
      cafe: { title: "Café", sub: "Despiértese pues", img: "/assets/images/cafe.png", phrase: "Abra ese ojo", desc: "Acelera la siguiente pregunta" }
    }[key];
    if (!data) return;
    modal.querySelector('#m-title').textContent = data.title;
    modal.querySelector('#m-sub').textContent = data.sub;
    modal.querySelector('#m-img').src = data.img;
    modal.querySelector('#m-phrase').textContent = data.phrase;
    modal.querySelector('#m-desc').textContent = data.desc;
    modal.style.display = 'flex';
  }

  let currentItemKey = '';
  
  document.querySelectorAll('.shop-card').forEach(btn => {
    btn.addEventListener('click', () => {
      currentItemKey = btn.getAttribute('data-item');
      openModal(currentItemKey);
    });
  });
  
  modal.querySelector('#m-back').addEventListener('click', () => { modal.style.display = 'none'; });
  
  modal.querySelector('#m-buy').addEventListener('click', () => {
    const coins = window.memoryState.currentUserCoins || 0;
    if (coins >= 200) {
      updateCoins(200, 'subtract');
      
      if (currentItemKey) {
        const activePowerups = JSON.parse(localStorage.getItem('activePowerups') || '[]');
        activePowerups.push(currentItemKey);
        localStorage.setItem('activePowerups', JSON.stringify(activePowerups));
      }
      
      modal.style.display = 'none';
      alert('¡Compra exitosa! El potenciador estará disponible en tu próxima partida.');
      renderShop();
    } else {
      alert('No tienes suficientes monedas');
    }
  });
}


