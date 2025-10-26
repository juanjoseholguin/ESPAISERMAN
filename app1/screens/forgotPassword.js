import { navigateTo } from '../app.js';

export default function renderForgotPassword() {
	const app = document.getElementById('app');
	app.innerHTML = `
    <div class="screen active">
      <button class="back-button" id="back-forgot"><div class="back-arrow"></div></button>
      <div class="main-content" style="gap:16px;">
        <div class="group4-container" style="margin-top:12px; text-align:center;">
          <img src="/assets/images/Group 4.png" alt="Espaiserman" class="group4-image" style="max-width:220px;">
        </div>
        <h1 class="form-title">¿Olvidaste tu contraseña?</h1>
        <div class="form-container">
          <div class="input-group"><input type="text" id="forgot-user" placeholder="Nombre de usuario/email" class="form-input"></div>
          <button id="btn-forgot" class="btn-primary">Cambiar Contraseña</button>
        </div>
      </div>
    </div>
  `;

	document.getElementById('back-forgot').addEventListener('click', () => {
		navigateTo('/');
	});
	document.getElementById('btn-forgot').addEventListener('click', () => {
		navigateTo('/change-password');
	});
}
