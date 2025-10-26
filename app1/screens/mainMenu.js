import { navigateTo, renderCoinCounter } from '../app.js';

export default function renderMainMenu() {
	const app = document.getElementById('app');
	app.innerHTML = `
    <div id="main-menu" class="screen active">
      ${renderCoinCounter()}

      <div class="main-content" style="gap:24px; align-items:center;">
        <div class="group4-container" style="margin-top:12px;">
          <img src="/assets/images/Group 4.png" alt="Espaiserman Group 4" class="group4-image" style="max-width:260px;">
        </div>

        <button id="btn-join" class="btn-primary" style="max-width:320px;">Unirme a una sala</button>
        <button id="btn-create" class="btn-primary" style="background:#11A36B; border-color:#0C6E4A; max-width:320px;">Crear una sala</button>
        <button id="btn-map" class="btn-primary" style="background:#FF6B35; border-color:#E55A2B; max-width:320px;">Mapa Icesi</button>
        <button id="btn-shop" class="btn-primary" style="background:#E34C43; border-color:#7E1E19; max-width:320px;">Tienda</button>
        <button id="btn-profile" class="btn-primary" style="background:#8FA6E0; border-color:#5A7BC7; max-width:320px;">Perfil</button>
      </div>
    </div>
  `;

	document.getElementById('btn-join').addEventListener('click', () => {
		const b = document.getElementById('btn-join');
		b.classList.add('btn-pressed');
		setTimeout(() => b.classList.remove('btn-pressed'), 120);
		navigateTo('/join');
	});
	document.getElementById('btn-create').addEventListener('click', () => {
		const b = document.getElementById('btn-create');
		b.classList.add('btn-pressed');
		setTimeout(() => b.classList.remove('btn-pressed'), 120);
		navigateTo('/create');
	});
	document.getElementById('btn-profile').addEventListener('click', () => {
		const b = document.getElementById('btn-profile');
		b.classList.add('btn-pressed');
		setTimeout(() => b.classList.remove('btn-pressed'), 120);
		navigateTo('/profile');
	});
	document.getElementById('btn-map').addEventListener('click', () => {
		const b = document.getElementById('btn-map');
		b.classList.add('btn-pressed');
		setTimeout(() => b.classList.remove('btn-pressed'), 120);
		navigateTo('/map');
	});
	const shopBtn = document.getElementById('btn-shop');
	if (shopBtn) {
		shopBtn.addEventListener('click', () => {
			shopBtn.classList.add('btn-pressed');
			setTimeout(() => shopBtn.classList.remove('btn-pressed'), 120);
			navigateTo('/shop');
		});
	}
}
