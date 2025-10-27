import { navigateTo } from "../app.js";

export default function renderLoginRegister() {
  const app = document.getElementById("app");
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
                <p class="register-text">No tienes cuenta? Hágase una</p>
                <button id="go-to-register" class="register-link">Registrarse</button>
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
                <p class="register-text">¿Ya tienes cuenta?</p>
                <button id="go-to-login" class="register-link">Inicia Sesión</button>
            </div>
        </div>
      </div>
      `;

  const splashScreen = document.getElementById("splash-screen");
  const loginScreen = document.getElementById("login-screen");
  const registerScreen = document.getElementById("register-screen");

  document.getElementById("splash-register").addEventListener("click", () => {
    splashScreen.classList.remove("active");
    registerScreen.classList.add("active");
  });
  document.getElementById("splash-login").addEventListener("click", () => {
    splashScreen.classList.remove("active");
    loginScreen.classList.add("active");
  });

  document.getElementById("go-to-register").addEventListener("click", () => {
    loginScreen.classList.remove("active");
    registerScreen.classList.add("active");
  });
  document.getElementById("go-to-login").addEventListener("click", () => {
    registerScreen.classList.remove("active");
    loginScreen.classList.add("active");
  });
  document.getElementById("back-from-register").addEventListener("click", () => {
    registerScreen.classList.remove("active");
    splashScreen.classList.add("active");
  });
  document.getElementById("back-from-login").addEventListener("click", () => {
    loginScreen.classList.remove("active");
    splashScreen.classList.add("active");
  });

  document.getElementById("login-btn").addEventListener("click", async () => {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    if (!username || !password) { alert("Por favor completa todos los campos"); return; }
    window.memoryState.currentUser = username;
    localStorage.setItem('currentUser', username);
    navigateTo("/create");
  });

  document.getElementById("register-btn").addEventListener("click", async () => {
    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-confirm-password").value;
    
    if (!name || !email || !password || !confirmPassword) {
      alert("Por favor completa todos los campos");
      return;
    }
    
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    
    try {
      window.memoryState.currentUser = name;
      localStorage.setItem('currentUser', name);
      alert("Cuenta creada exitosamente");
      navigateTo("/create");
    } catch (error) {
      alert("Error al conectar con el servidor");
    }
  });
}
