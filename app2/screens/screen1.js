import { navigateTo, makeRequest, memoryState } from "../app.js";

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

  const persistSession = (user, inventory = []) => {
    if (!user) return;
    memoryState.currentUser = user.username;
    memoryState.currentUserId = user.id;
    memoryState.currentUserCoins = user.coins;
    memoryState.inventory = inventory;
    memoryState.currentUserAvatar = user.avatar_url;
    memoryState.currentUserBgColor = user.avatar_bg;

    localStorage.setItem('currentUser', user.username);
    localStorage.setItem('currentUserId', user.id);
    localStorage.setItem('currentUserCoins', user.coins ?? 0);
    localStorage.setItem('currentUserAvatar', user.avatar_url ?? '');
    localStorage.setItem('currentUserBgColor', user.avatar_bg ?? '');
  };

  document.getElementById("login-btn").addEventListener("click", async () => {
    const identifier = document.getElementById("login-username").value?.trim();
    const password = document.getElementById("login-password").value;

    if (!identifier || !password) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      const response = await makeRequest("/auth/login", "POST", { email: identifier, password });
      if (response.error) {
        alert(response.error);
        return;
      }
      persistSession(response.user, response.inventory);
      navigateTo("/create");
    } catch (error) {
      console.error("Error logging in:", error);
      alert("No se pudo iniciar sesión. Intenta nuevamente.");
    }
  });

  document.getElementById("register-btn").addEventListener("click", async () => {
    const name = document.getElementById("register-name").value?.trim();
    const email = document.getElementById("register-email").value?.trim();
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
      const response = await makeRequest("/auth/register", "POST", {
        name,
        username: name,
        email,
        password,
      });

      if (response.error) {
        alert(response.error);
        return;
      }

      persistSession(response.user, []);
      alert("Cuenta creada exitosamente");
      navigateTo("/create");
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Error al conectar con el servidor");
    }
  });
}
