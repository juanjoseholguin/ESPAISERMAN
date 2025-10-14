// Aplicación Espaiserman Trivia
class EspaisermanApp {
    constructor() {
        this.currentScreen = 'login-screen';
        this.user = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showScreen('login-screen');
    }

    setupEventListeners() {
        // Login Screen
        document.getElementById('login-btn').addEventListener('click', () => this.handleLogin());
        document.getElementById('go-to-register').addEventListener('click', () => this.showScreen('register-screen'));

        // Register Screen
        document.getElementById('register-btn').addEventListener('click', () => this.handleRegister());
        document.getElementById('go-to-login').addEventListener('click', () => this.showScreen('login-screen'));

        // Main Menu
        document.getElementById('create-room-btn').addEventListener('click', () => this.showScreen('create-room-screen'));
        document.getElementById('join-room-btn').addEventListener('click', () => this.showScreen('join-room-screen'));
        document.getElementById('shop-btn').addEventListener('click', () => this.showScreen('shop-screen'));
        document.getElementById('profile-btn').addEventListener('click', () => this.showScreen('profile-screen'));

        // Profile Screen
        document.getElementById('back-to-menu').addEventListener('click', () => this.showScreen('main-menu-screen'));

        // Shop Screen
        document.getElementById('back-to-menu-shop').addEventListener('click', () => this.showScreen('main-menu-screen'));

        // Create Room Screen
        document.getElementById('create-room-btn-confirm').addEventListener('click', () => this.handleCreateRoom());
        document.getElementById('back-to-menu-create').addEventListener('click', () => this.showScreen('main-menu-screen'));

        // Join Room Screen
        document.getElementById('scan-qr-btn').addEventListener('click', () => this.showScreen('qr-screen'));
        document.getElementById('join-room-btn-confirm').addEventListener('click', () => this.handleJoinRoom());
        document.getElementById('back-to-menu-join').addEventListener('click', () => this.showScreen('main-menu-screen'));

        // QR Screen
        document.getElementById('back-to-join').addEventListener('click', () => this.showScreen('join-room-screen'));

        // Distribute Questions Screen
        document.getElementById('generate-questions-btn').addEventListener('click', () => this.handleGenerateQuestions());
        document.getElementById('back-to-room').addEventListener('click', () => this.showScreen('create-room-screen'));

        // Correct Answer Screen
        document.getElementById('next-question-btn').addEventListener('click', () => this.handleNextQuestion());

        // Game Over Screen
        document.getElementById('play-again-btn').addEventListener('click', () => this.handlePlayAgain());
        document.getElementById('back-to-main-menu').addEventListener('click', () => this.showScreen('main-menu-screen'));

        // Power Up Screen
        document.getElementById('continue-game-btn').addEventListener('click', () => this.handleContinueGame());

        // Moderator Map Screen
        document.getElementById('start-game-btn').addEventListener('click', () => this.handleStartGame());
        document.getElementById('pause-game-btn').addEventListener('click', () => this.handlePauseGame());
        document.getElementById('end-game-btn').addEventListener('click', () => this.handleEndGame());
        document.getElementById('back-to-moderator-menu').addEventListener('click', () => this.showScreen('main-menu-screen'));
    }

    showScreen(screenId) {
        // Ocultar todas las pantallas
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });

        // Mostrar la pantalla seleccionada
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }

        // Efectos especiales según la pantalla
        this.handleScreenEffects(screenId);
    }

    handleScreenEffects(screenId) {
        switch(screenId) {
            case 'loading-screen':
                this.simulateLoading();
                break;
            case 'qr-screen':
                this.startQRScanner();
                break;
            case 'correct-answer-screen':
                this.showCorrectAnswerEffect();
                break;
            case 'power-up-screen':
                this.showPowerUpEffect();
                break;
        }
    }

    // Funciones de autenticación
    handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            this.showAlert('Error', 'Por favor completa todos los campos');
            return;
        }

        // Simular carga
        this.showScreen('loading-screen');
        
        setTimeout(() => {
            this.user = { email, name: email.split('@')[0] };
            this.showScreen('main-menu-screen');
        }, 2000);
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

        // Simular carga
        this.showScreen('loading-screen');
        
        setTimeout(() => {
            this.user = { email, name };
            this.showScreen('main-menu-screen');
        }, 2000);
    }

    // Funciones de juego
    handleCreateRoom() {
        const roomName = document.getElementById('room-name').value;
        const maxPlayers = document.getElementById('max-players').value;
        const difficulty = document.getElementById('difficulty').value;

        if (!roomName || !maxPlayers) {
            this.showAlert('Error', 'Por favor completa todos los campos');
            return;
        }

        // Simular creación de sala
        this.showScreen('loading-screen');
        
        setTimeout(() => {
            this.showScreen('distribute-questions-screen');
        }, 1500);
    }

    handleJoinRoom() {
        const roomCode = document.getElementById('room-code').value;

        if (!roomCode) {
            this.showAlert('Error', 'Por favor ingresa el código de la sala');
            return;
        }

        // Simular unión a sala
        this.showScreen('loading-screen');
        
        setTimeout(() => {
            this.showScreen('correct-answer-screen');
        }, 1500);
    }

    handleGenerateQuestions() {
        const category = document.getElementById('question-category').value;
        const difficulty = document.getElementById('question-difficulty').value;
        const count = document.getElementById('question-count').value || 10;

        this.showAlert('Éxito', `Generando ${count} preguntas de ${category} (${difficulty})`);
        
        setTimeout(() => {
            this.showScreen('moderator-map-screen');
        }, 1000);
    }

    handleNextQuestion() {
        this.showScreen('correct-answer-screen');
    }

    handlePlayAgain() {
        this.showScreen('create-room-screen');
    }

    handleContinueGame() {
        this.showScreen('correct-answer-screen');
    }

    handleStartGame() {
        this.showAlert('Juego Iniciado', 'El juego ha comenzado');
    }

    handlePauseGame() {
        this.showAlert('Juego Pausado', 'El juego ha sido pausado');
    }

    handleEndGame() {
        this.showScreen('game-over-screen');
    }

    // Efectos especiales
    simulateLoading() {
        setTimeout(() => {
            this.showScreen('main-menu-screen');
        }, 3000);
    }

    startQRScanner() {
        // Simular escaneo de QR
        setTimeout(() => {
            this.showAlert('QR Escaneado', 'Código QR detectado correctamente');
            this.showScreen('correct-answer-screen');
        }, 2000);
    }

    showCorrectAnswerEffect() {
        // Efecto de respuesta correcta
        const icon = document.querySelector('.correct-icon');
        if (icon) {
            icon.style.animation = 'bounce 0.6s ease-in-out';
        }
    }

    showPowerUpEffect() {
        // Efecto de potenciador
        const powerUpImage = document.querySelector('.power-up-image');
        if (powerUpImage) {
            powerUpImage.style.animation = 'pulse 1s ease-in-out infinite';
        }
    }

    // Utilidades
    showAlert(title, message) {
        alert(`${title}: ${message}`);
    }
}

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new EspaisermanApp();
});

// Animaciones CSS adicionales
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-10px);
        }
        60% {
            transform: translateY(-5px);
        }
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
        }
    }

    .correct-icon {
        animation: bounce 0.6s ease-in-out;
    }

    .power-up-image {
        animation: pulse 1s ease-in-out infinite;
    }
`;
document.head.appendChild(style);
