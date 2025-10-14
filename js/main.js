/* ========================================
   ESPAISERMAN TRIVIA APP - LÓGICA PRINCIPAL
   ======================================== */

class EspaisermanApp {
    constructor() {
        this.currentScreen = 'login-screen';
        this.user = null;
        this.gameData = {
            score: 0,
            questionsAnswered: 0,
            correctAnswers: 0,
            timeElapsed: 0
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showScreen('login-screen');
        this.loadUserData();
    }

    setupEventListeners() {
        // ========================================
        // PANTALLA DE LOGIN
        // ========================================
        document.getElementById('login-btn').addEventListener('click', () => this.handleLogin());
        document.getElementById('go-to-register').addEventListener('click', () => this.showScreen('register-screen'));

        // ========================================
        // PANTALLA DE REGISTRO
        // ========================================
        document.getElementById('register-btn').addEventListener('click', () => this.handleRegister());
        document.getElementById('go-to-login').addEventListener('click', () => this.showScreen('login-screen'));

        // ========================================
        // MENÚ PRINCIPAL
        // ========================================
        document.getElementById('create-room-btn').addEventListener('click', () => this.showScreen('create-room-screen'));
        document.getElementById('join-room-btn').addEventListener('click', () => this.showScreen('join-room-screen'));
        document.getElementById('shop-btn').addEventListener('click', () => this.showScreen('shop-screen'));
        document.getElementById('profile-btn').addEventListener('click', () => this.showScreen('profile-screen'));

        // ========================================
        // PANTALLA DE PERFIL
        // ========================================
        document.getElementById('back-to-menu').addEventListener('click', () => this.showScreen('main-menu-screen'));

        // ========================================
        // PANTALLA DE TIENDA
        // ========================================
        document.getElementById('back-to-menu-shop').addEventListener('click', () => this.showScreen('main-menu-screen'));
        
        // Event listeners para botones de compra
        document.querySelectorAll('.btn-buy').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleBuyItem(e));
        });

        // ========================================
        // PANTALLA DE CREAR SALA
        // ========================================
        document.getElementById('create-room-btn-confirm').addEventListener('click', () => this.handleCreateRoom());
        document.getElementById('back-to-menu-create').addEventListener('click', () => this.showScreen('main-menu-screen'));

        // ========================================
        // PANTALLA DE UNIRSE A SALA
        // ========================================
        document.getElementById('scan-qr-btn').addEventListener('click', () => this.showScreen('qr-screen'));
        document.getElementById('join-room-btn-confirm').addEventListener('click', () => this.handleJoinRoom());
        document.getElementById('back-to-menu-join').addEventListener('click', () => this.showScreen('main-menu-screen'));

        // ========================================
        // PANTALLA DE LECTURA QR
        // ========================================
        document.getElementById('back-to-join').addEventListener('click', () => this.showScreen('join-room-screen'));

        // ========================================
        // PANTALLA DE DISTRIBUIR PREGUNTAS
        // ========================================
        document.getElementById('generate-questions-btn').addEventListener('click', () => this.handleGenerateQuestions());
        document.getElementById('back-to-room').addEventListener('click', () => this.showScreen('create-room-screen'));

        // ========================================
        // PANTALLA DE RESPUESTA CORRECTA
        // ========================================
        document.getElementById('next-question-btn').addEventListener('click', () => this.handleNextQuestion());

        // ========================================
        // PANTALLA DE FIN DE PARTIDA
        // ========================================
        document.getElementById('play-again-btn').addEventListener('click', () => this.handlePlayAgain());
        document.getElementById('back-to-main-menu').addEventListener('click', () => this.showScreen('main-menu-screen'));

        // ========================================
        // PANTALLA DE POTENCIADOR
        // ========================================
        document.getElementById('continue-game-btn').addEventListener('click', () => this.handleContinueGame());

        // ========================================
        // PANTALLA DE MAPA DE MODERADOR
        // ========================================
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
            case 'profile-screen':
                this.updateProfileStats();
                break;
        }
    }

    // ========================================
    // FUNCIONES DE AUTENTICACIÓN
    // ========================================
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
            this.user = { 
                email, 
                name: email.split('@')[0],
                gamesPlayed: 0,
                correctAnswers: 0,
                totalScore: 0
            };
            this.saveUserData();
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

        if (password.length < 6) {
            this.showAlert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        // Simular carga
        this.showScreen('loading-screen');
        
        setTimeout(() => {
            this.user = { 
                email, 
                name,
                gamesPlayed: 0,
                correctAnswers: 0,
                totalScore: 0
            };
            this.saveUserData();
            this.showScreen('main-menu-screen');
        }, 2000);
    }

    // ========================================
    // FUNCIONES DE JUEGO
    // ========================================
    handleCreateRoom() {
        const roomName = document.getElementById('room-name').value;
        const maxPlayers = document.getElementById('max-players').value;
        const difficulty = document.getElementById('difficulty').value;

        if (!roomName || !maxPlayers) {
            this.showAlert('Error', 'Por favor completa todos los campos');
            return;
        }

        if (maxPlayers < 2 || maxPlayers > 10) {
            this.showAlert('Error', 'El número de jugadores debe estar entre 2 y 10');
            return;
        }

        // Simular creación de sala
        this.showScreen('loading-screen');
        
        setTimeout(() => {
            this.showAlert('Sala Creada', `Sala "${roomName}" creada exitosamente`);
            this.showScreen('distribute-questions-screen');
        }, 1500);
    }

    handleJoinRoom() {
        const roomCode = document.getElementById('room-code').value;

        if (!roomCode) {
            this.showAlert('Error', 'Por favor ingresa el código de la sala');
            return;
        }

        if (roomCode.length !== 6) {
            this.showAlert('Error', 'El código debe tener 6 caracteres');
            return;
        }

        // Simular unión a sala
        this.showScreen('loading-screen');
        
        setTimeout(() => {
            this.showAlert('Unido a Sala', 'Te has unido exitosamente a la sala');
            this.showScreen('correct-answer-screen');
        }, 1500);
    }

    handleGenerateQuestions() {
        const category = document.getElementById('question-category').value;
        const difficulty = document.getElementById('question-difficulty').value;
        const count = document.getElementById('question-count').value || 10;

        if (count < 5 || count > 50) {
            this.showAlert('Error', 'La cantidad de preguntas debe estar entre 5 y 50');
            return;
        }

        this.showAlert('Preguntas Generadas', `Se generaron ${count} preguntas de ${category} (${difficulty})`);
        
        setTimeout(() => {
            this.showScreen('moderator-map-screen');
        }, 1000);
    }

    handleNextQuestion() {
        // Simular siguiente pregunta
        this.gameData.questionsAnswered++;
        this.gameData.correctAnswers++;
        this.gameData.score += 10;
        
        // Mostrar pantalla de potenciador ocasionalmente
        if (Math.random() < 0.3) {
            this.showScreen('power-up-screen');
        } else {
            this.showScreen('correct-answer-screen');
        }
    }

    handlePlayAgain() {
        this.resetGameData();
        this.showScreen('create-room-screen');
    }

    handleContinueGame() {
        this.showScreen('correct-answer-screen');
    }

    handleStartGame() {
        this.showAlert('Juego Iniciado', 'El juego ha comenzado');
        this.startGameTimer();
    }

    handlePauseGame() {
        this.showAlert('Juego Pausado', 'El juego ha sido pausado');
        this.pauseGameTimer();
    }

    handleEndGame() {
        this.updateUserStats();
        this.showScreen('game-over-screen');
    }

    // ========================================
    // FUNCIONES DE TIENDA
    // ========================================
    handleBuyItem(event) {
        const itemName = event.target.parentElement.querySelector('.item-name').textContent;
        const itemPrice = event.target.parentElement.querySelector('.item-price').textContent;
        
        this.showAlert('Compra Exitosa', `Has comprado ${itemName} por ${itemPrice}`);
        
        // Aquí se podría implementar la lógica de compra real
        // con monedas del usuario, etc.
    }

    // ========================================
    // EFECTOS ESPECIALES
    // ========================================
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

    updateProfileStats() {
        if (this.user) {
            document.querySelector('.profile-name').textContent = this.user.name;
            document.querySelectorAll('.stat-item')[0].querySelector('.stat-value').textContent = this.user.gamesPlayed;
            document.querySelectorAll('.stat-item')[1].querySelector('.stat-value').textContent = this.user.correctAnswers;
            document.querySelectorAll('.stat-item')[2].querySelector('.stat-value').textContent = this.user.totalScore;
        }
    }

    // ========================================
    // FUNCIONES DE DATOS
    // ========================================
    saveUserData() {
        if (this.user) {
            localStorage.setItem('espaiserman_user', JSON.stringify(this.user));
        }
    }

    loadUserData() {
        const savedUser = localStorage.getItem('espaiserman_user');
        if (savedUser) {
            this.user = JSON.parse(savedUser);
        }
    }

    updateUserStats() {
        if (this.user) {
            this.user.gamesPlayed++;
            this.user.correctAnswers += this.gameData.correctAnswers;
            this.user.totalScore += this.gameData.score;
            this.saveUserData();
        }
    }

    resetGameData() {
        this.gameData = {
            score: 0,
            questionsAnswered: 0,
            correctAnswers: 0,
            timeElapsed: 0
        };
    }

    startGameTimer() {
        this.gameTimer = setInterval(() => {
            this.gameData.timeElapsed++;
        }, 1000);
    }

    pauseGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
    }

    // ========================================
    // UTILIDADES
    // ========================================
    showAlert(title, message) {
        alert(`${title}: ${message}`);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// ========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    window.espaisermanApp = new EspaisermanApp();
});

// ========================================
// FUNCIONES GLOBALES ADICIONALES
// ========================================
window.showScreen = (screenId) => {
    if (window.espaisermanApp) {
        window.espaisermanApp.showScreen(screenId);
    }
};

window.showAlert = (title, message) => {
    if (window.espaisermanApp) {
        window.espaisermanApp.showAlert(title, message);
    }
};
