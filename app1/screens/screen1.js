import { makeRequest, navigateTo, memoryState } from '../app.js';

export default function renderScreen1() {
	const app = document.getElementById('app');
	app.innerHTML = `
      <div id="splash-screen" class="screen active">
        <div class="main-content" style="justify-content: space-between;">
            <div class="logo-section">
                <div class="group4-container">
                    <img src="/assets/images/Group 4.png" alt="Espaiserman Group 4" class="group4-image">
                </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:24px; padding: 0 20px 24px 20px;">
                <button id="splash-register" class="btn-primary">Registrarse</button>
                <button id="splash-login" class="btn-primary">Iniciar Sesión</button>
                <p style="text-align:center; opacity:.8; font-size:12px; margin-top:8px;">Copyright © 2025 Espaiserman.<br/>Todos los derechos reservados.</p>
            </div>
        </div>
      </div>

      <div id="login-screen" class="screen">
        <button class="back-button" id="back-from-login">
            <div class="back-arrow"></div>
        </button>

        <div class="main-content">
            <div class="logo-section">
                <div class="group4-container">
                    <img src="/assets/images/Group 4.png" alt="Espaiserman Group 4" class="group4-image">
                </div>
            </div>

            <div class="form-section">
                <h1 class="form-title">Iniciar Sesión</h1>
                <div class="form-container">
                    <div class="input-group">
                        <input type="text" id="login-username" placeholder="Nombre de usuario/email" class="form-input">
                    </div>
                    <div class="input-group">
                        <input type="password" id="login-password" placeholder="Contraseña" class="form-input">
                    </div>
                    <button id="login-btn" class="btn-primary">Iniciar Sesión</button>
                </div>
            </div>

            <div class="register-link-section">
                <p class="register-text">¿No tienes cuenta? ¡Hágase una, que es gratis!</p>
                <button id="go-to-register" class="register-link" style="background:none; border:none; color:#1E3A8A; text-decoration:underline; cursor:pointer; font-size:14px;">Registrarse</button>
            </div>
        </div>
      </div>

      <div id="register-screen" class="screen">
        <button class="back-button" id="back-from-register">
            <div class="back-arrow"></div>
        </button>
        <div class="main-content">
            <div class="logo-section">
                <div class="group4-container">
                    <img src="/assets/images/Group 4.png" alt="Espaiserman Group 4" class="group4-image">
                </div>
            </div>
            <div class="form-section">
                <h1 class="form-title">Crear Cuenta</h1>
                <div class="form-container">
                    <div class="input-group">
                        <input type="text" id="register-name" placeholder="Nombre completo" class="form-input">
                    </div>
                    <div class="input-group">
                        <input type="email" id="register-email" placeholder="Correo electrónico" class="form-input">
                    </div>
                    <div class="input-group">
                        <input type="password" id="register-password" placeholder="Contraseña" class="form-input">
                    </div>
                    <div class="input-group">
                        <input type="password" id="register-confirm-password" placeholder="Confirmar contraseña" class="form-input">
                    </div>
                    <button id="register-btn" class="btn-primary">Crear Cuenta</button>
                </div>
            </div>
            <div class="register-link-section">
                <p class="register-text">¿Ya tienes cuenta? ¡Póngale entonces!</p>
                <button id="go-to-login" class="register-link" style="background:none; border:none; color:#1E3A8A; text-decoration:underline; cursor:pointer; font-size:14px;">Inicia Sesión</button>
            </div>
        </div>
      </div>
      `;

	const splashScreen = document.getElementById('splash-screen');
	const loginScreen = document.getElementById('login-screen');
	const registerScreen = document.getElementById('register-screen');

	document.getElementById('splash-register').addEventListener('click', () => {
		const btn = document.getElementById('splash-register');
		btn.classList.add('btn-pressed');
		setTimeout(() => btn.classList.remove('btn-pressed'), 120);
		splashScreen.classList.remove('active');
		registerScreen.classList.add('active');
	});
	document.getElementById('splash-login').addEventListener('click', () => {
		const btn = document.getElementById('splash-login');
		btn.classList.add('btn-pressed');
		setTimeout(() => btn.classList.remove('btn-pressed'), 120);
		splashScreen.classList.remove('active');
		loginScreen.classList.add('active');
	});

	document.getElementById('go-to-register').addEventListener('click', () => {
		const btn = document.getElementById('go-to-register');
		btn.classList.add('btn-pressed');
		setTimeout(() => btn.classList.remove('btn-pressed'), 120);
		loginScreen.classList.remove('active');
		registerScreen.classList.add('active');
	});
	document.getElementById('go-to-login').addEventListener('click', () => {
		const btn = document.getElementById('go-to-login');
		btn.classList.add('btn-pressed');
		setTimeout(() => btn.classList.remove('btn-pressed'), 120);
		registerScreen.classList.remove('active');
		loginScreen.classList.add('active');
	});
	document.getElementById('back-from-register').addEventListener('click', () => {
		const btn = document.getElementById('back-from-register');
		btn.classList.add('btn-pressed');
		setTimeout(() => btn.classList.remove('btn-pressed'), 120);
		registerScreen.classList.remove('active');
		splashScreen.classList.add('active');
	});
	document.getElementById('back-from-login').addEventListener('click', () => {
		const btn = document.getElementById('back-from-login');
		btn.classList.add('btn-pressed');
		setTimeout(() => btn.classList.remove('btn-pressed'), 120);
		loginScreen.classList.remove('active');
		splashScreen.classList.add('active');
	});

	document.getElementById('login-btn').addEventListener('click', async () => {
		const username = document.getElementById('login-username').value;
		const password = document.getElementById('login-password').value;
		if (!username || !password) {
			alert('Por favor completa todos los campos');
			return;
		}
		try {
			const savedCoins = localStorage.getItem(`coins_${username}`) || '1000';
			memoryState.currentUser = username;
			memoryState.currentUserCoins = parseInt(savedCoins);
			localStorage.setItem('currentUser', username);
			localStorage.setItem('currentUserCoins', savedCoins);
			navigateTo('/main');
			const lu = document.getElementById('login-username');
			const lp = document.getElementById('login-password');
			if (lu) lu.value = '';
			if (lp) lp.value = '';
		} catch (error) {
			alert('Error al conectar con el servidor');
		}
	});

	document.getElementById('register-btn').addEventListener('click', async () => {
		const name = document.getElementById('register-name').value;
		const email = document.getElementById('register-email').value;
		const password = document.getElementById('register-password').value;
		const confirmPassword = document.getElementById('register-confirm-password').value;

		if (!name || !email || !password || !confirmPassword) {
			alert('Por favor completa todos los campos');
			return;
		}

		if (password !== confirmPassword) {
			alert('Las contraseñas no coinciden');
			return;
		}

		try {
			const response = await fetch('http://localhost:5050/users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: name,
					email: email,
					username: name,
					password: password,
				}),
			});

			const result = await response.json();

			if (result.success) {
				memoryState.currentUser = name;
				memoryState.currentUserCoins = 1000;
				localStorage.setItem('currentUser', name);
				localStorage.setItem(`coins_${name}`, '1000');
				localStorage.setItem('currentUserCoins', '1000');
				navigateTo('/main');

				const rn = document.getElementById('register-name');
				const re = document.getElementById('register-email');
				const rp = document.getElementById('register-password');
				const rcp = document.getElementById('register-confirm-password');
				if (rn) rn.value = '';
				if (re) re.value = '';
				if (rp) rp.value = '';
				if (rcp) rcp.value = '';
			} else {
				alert(result.error || 'Error al crear el usuario');
			}
		} catch (error) {
			console.error('Error al registrar usuario:', error);
			alert('Error al conectar con el servidor');
		}
	});
}
