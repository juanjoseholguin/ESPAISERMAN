/* ========================================
   ESPAISERMAN TRIVIA - LÓGICA MÓVIL
   ======================================== */

class EspaisermanMobileApp {
    constructor() {
        this.currentScreen = 'login-screen';
        this.user = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showScreen('login-screen');
        this.setupMobileOptimizations();
    }

    setupEventListeners() {
        document.getElementById('login-btn').addEventListener('click', () => this.handleLogin());
        document.getElementById('go-to-register').addEventListener('click', () => this.showScreen('register-screen'));

        document.getElementById('register-btn').addEventListener('click', () => this.handleRegister());
        document.getElementById('go-to-login').addEventListener('click', () => this.showScreen('login-screen'));

        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (this.currentScreen === 'login-screen') {
                    this.handleLogin();
                } else if (this.currentScreen === 'register-screen') {
                    this.handleRegister();
                }
            }
        });
    }

    setupMobileOptimizations() {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                if (window.innerHeight < 500) {
                    setTimeout(() => {
                        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                }
            });
        });

        document.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'INPUT') {
                document.body.classList.add('no-scroll');
            }
        });

        document.addEventListener('touchend', () => {
            document.body.classList.remove('no-scroll');
        });

        this.updateStatusBar();
        setInterval(() => this.updateStatusBar(), 60000);
    }

    showScreen(screenId) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });

        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }

        this.handleScreenEffects(screenId);
    }

    handleScreenEffects(screenId) {
        window.scrollTo(0, 0);

        switch(screenId) {
            case 'login-screen':
                this.focusFirstInput('login-username');
                break;
            case 'register-screen':
                this.focusFirstInput('register-name');
                break;
        }
    }

    focusFirstInput(inputId) {
        setTimeout(() => {
            const input = document.getElementById(inputId);
            if (input) {
                input.focus();
            }
        }, 500);
    }

    handleLogin() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        if (!username || !password) {
            this.showAlert('Error', 'Por favor completa todos los campos');
            return;
        }
        this.showLoading(true);
        const email = username.includes('@') ? username : `${username}@example.com`;
        fetch('http://localhost:5050/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, email: email })
        })
        .then(r => r.json())
        .then(res => {
            this.showLoading(false);
            if (res && res.success && res.user) {
                this.user = { username, name: username.split('@')[0] || username, email };
                this.showAlert('Éxito', 'Inicio de sesión exitoso');
                console.log('Usuario logueado:', this.user);
            } else {
                const msg = (res && (res.error || res.message)) || 'Credenciales inválidas';
                this.showAlert('Error', msg);
            }
        })
        .catch(() => {
            this.showLoading(false);
            this.showAlert('Error', 'No se pudo conectar al servidor');
        });
    }

    handleRegister() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (!name || !email || !password || !confirmPassword) {
            this.showAlert('Error', 'Por favor completa todos los campos');
            return;
        }

        if (password !== confirmPassword) {
            this.showAlert('Error', 'Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            this.showAlert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showAlert('Error', 'Por favor ingresa un email válido');
            return;
        }

        this.showLoading(true);

        setTimeout(() => {
            this.user = {
                name,
                email,
                username: email.split('@')[0]
            };
            this.showLoading(false);
            this.showAlert('Éxito', 'Cuenta creada exitosamente');
            console.log('Usuario registrado:', this.user);
        }, 1500);
    }

    showAlert(title, message) {
        const modal = document.createElement('div');
        modal.className = 'alert-modal';
        modal.innerHTML = `
            <div class="alert-content">
                <h3>${title}</h3>
                <p>${message}</p>
                <button class="alert-btn" onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        const content = modal.querySelector('.alert-content');
        content.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            max-width: 300px;
            margin: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;

        const btn = modal.querySelector('.alert-btn');
        btn.style.cssText = `
            background: #FF4444;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 15px;
        `;

        document.body.appendChild(modal);

        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 3000);
    }

    showLoading(show) {
        const btn = this.currentScreen === 'login-screen'
            ? document.getElementById('login-btn')
            : document.getElementById('register-btn');

        if (show) {
            btn.textContent = 'Cargando...';
            btn.disabled = true;
            btn.classList.add('loading');
        } else {
            btn.textContent = this.currentScreen === 'login-screen' ? 'Iniciar Sesión' : 'Crear Cuenta';
            btn.disabled = false;
            btn.classList.remove('loading');
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    updateStatusBar() {
        const now = new Date();
        const time = now.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        const timeElement = document.querySelector('.time');
        if (timeElement) {
            timeElement.textContent = time;
        }
    }

    goBack() {
        if (this.currentScreen === 'register-screen') {
            this.showScreen('login-screen');
        } else {
            console.log('Volver a pantalla anterior');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.espaisermanApp = new EspaisermanMobileApp();
});

window.goBack = () => {
    if (window.espaisermanApp) {
        window.espaisermanApp.goBack();
    }
};

window.showScreen = (screenId) => {
    if (window.espaisermanApp) {
        window.espaisermanApp.showScreen(screenId);
    }
};

document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
});

let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

document.addEventListener('touchmove', (e) => {
    if (document.body.classList.contains('no-scroll')) {
        e.preventDefault();
    }
}, { passive: false });
