export const renderCategorySelection = () => {
  return `
    <div class="screen category-selection-screen">
      <div class="header">
        <div class="time">9:41</div>
        <button class="back-btn" onclick="navigateTo('/main')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="status-icons">
          <div class="signal"></div>
          <div class="wifi"></div>
          <div class="battery"></div>
        </div>
      </div>

      <div class="logo-container">
        <img src="/assets/images/Group 4.png" alt="ESPAISER-MAN" class="group4-image">
        <h1 class="app-title">ESPAISER-MAN</h1>
        <h2 class="app-subtitle">TRIVIA</h2>
      </div>

      <div class="form-container">
        <h2 class="form-title">Crear sala</h2>
        
        <div class="input-group">
          <select id="category" class="form-input" required>
            <option value="">Selecciona una categoría</option>
            <option value="cultura-general-colombiana">Cultura General Colombiana</option>
            <option value="deportes">Deportes</option>
            <option value="superheroes">Superhéroes</option>
          </select>
        </div>
        
        <div class="input-group">
          <input type="number" id="participants" placeholder="Escribe el número de participantes" class="form-input" min="2" max="10" required>
        </div>
        
        <div class="input-group">
          <input type="number" id="timePerQuestion" placeholder="Tiempo por pregunta (segundos)" class="form-input" min="10" max="60" value="30" required>
        </div>
        
        <button class="btn-primary" onclick="createRoomWithCategory()">Organizar preguntas</button>
      </div>

      <div class="character-container">
        <img src="/assets/images/Group 4.png" alt="Espaiser-Man" class="character-image">
      </div>
    </div>
  `;
};

window.createRoomWithCategory = async () => {
  const category = document.getElementById('category').value;
  const participants = document.getElementById('participants').value;
  const timePerQuestion = document.getElementById('timePerQuestion').value;

  if (!category || !participants || !timePerQuestion) {
    alert('Por favor completa todos los campos');
    return;
  }

  if (participants < 2 || participants > 10) {
    alert('El número de participantes debe estar entre 2 y 10');
    return;
  }

  // Generar código de sala
  const roomCode = generateRoomCode();
  
  // Guardar configuración de la sala en el estado
  window.memoryState.roomConfig = {
    code: roomCode,
    category,
    maxParticipants: parseInt(participants),
    timePerQuestion: parseInt(timePerQuestion),
    host: window.memoryState.currentUser
  };

  // Crear la sala en el servidor
  try {
    const response = await fetch('/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: roomCode,
        category,
        maxParticipants: parseInt(participants),
        timePerQuestion: parseInt(timePerQuestion),
        host: window.memoryState.currentUser
      })
    });

    if (response.ok) {
      // Conectar al socket y crear la sala
      if (window.socket) {
        window.socket.emit('room:create', {
          code: roomCode,
          category,
          maxParticipants: parseInt(participants),
          timePerQuestion: parseInt(timePerQuestion),
          host: window.memoryState.currentUser
        });
      }
      
      navigateTo('/lobby');
    } else {
      alert('Error al crear la sala');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión');
  }
};
