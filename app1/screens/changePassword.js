export const renderChangePassword = () => {
  return `
    <div class="screen change-password-screen">
      <div class="header">
        <div class="time">9:41</div>
        <button class="back-btn" onclick="navigateTo('/forgot')">
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
        <h2 class="form-title">Cambiar Contraseña</h2>
        
        <div class="input-group">
          <input type="email" id="email" placeholder="Correo electrónico" class="form-input" required>
        </div>
        
        <div class="input-group">
          <input type="password" id="newPassword" placeholder="Nueva contraseña" class="form-input" required>
        </div>
        
        <div class="input-group">
          <input type="password" id="confirmPassword" placeholder="Confirmar nueva contraseña" class="form-input" required>
        </div>
        
        <button class="btn-primary" onclick="changePassword()">Cambiar Contraseña</button>
      </div>

      <div class="character-container">
        <img src="/assets/images/Group 4.png" alt="Espaiser-Man" class="character-image">
      </div>
    </div>
  `;
};

window.changePassword = async () => {
  const email = document.getElementById('email').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!email || !newPassword || !confirmPassword) {
    alert('Por favor completa todos los campos');
    return;
  }

  if (newPassword !== confirmPassword) {
    alert('Las contraseñas no coinciden');
    return;
  }

  try {
    const response = await fetch('/users/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        newPassword,
        confirmPassword
      })
    });

    const result = await response.json();

    if (response.ok) {
      alert('Contraseña actualizada exitosamente');
      navigateTo('/login');
    } else {
      alert(result.error || 'Error al cambiar la contraseña');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error de conexión');
  }
};
