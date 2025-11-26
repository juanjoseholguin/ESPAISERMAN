import { navigateTo } from "../app.js";

export const renderProfileEdit = () => {
  const currentUser = window.memoryState.currentUser || localStorage.getItem('currentUser') || 'Usuario';
  const userAvatar = window.memoryState.currentUserAvatar || localStorage.getItem('currentUserAvatar') || 'assets/images/Group 4.png';
  const userBgColor = window.memoryState.currentUserBgColor || localStorage.getItem('currentUserBgColor') || '#F9D648';

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="screen profile-edit-screen active">
      <button class="back-button" id="profile-back-btn" onclick="window.goBackFromProfile()">
        <div class="back-arrow"></div>
      </button>

      <div class="profile-container">
        <div class="profile-card">
          <div class="profile-picture-container">
            <div class="profile-picture" style="background-color: ${userBgColor}">
              <img src="${userAvatar}" alt="Profile" class="profile-img">
            </div>
            <button class="edit-photo-btn" onclick="openAvatarPicker()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 20H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16.5 3.5L20.5 7.5L7 21H3V17L16.5 3.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <input type="file" id="avatarInput" accept="image/*" style="display: none" onchange="handleAvatarFile(event)">
          </div>

          <div class="form-group">
            <label class="form-label">Nombre de usuario</label>
            <input type="text" id="username" class="form-input" value="${currentUser}" placeholder="Nombre de usuario">
          </div>

          <div class="form-group">
            <label class="form-label">Color de fondo</label>
            <div class="color-picker">
              <div class="color-option" data-color="#F9D648" style="background-color: #F9D648" onclick="selectColor('#F9D648')"></div>
              <div class="color-option" data-color="#8FA6E0" style="background-color: #8FA6E0" onclick="selectColor('#8FA6E0')"></div>
              <div class="color-option" data-color="#11A36B" style="background-color: #11A36B" onclick="selectColor('#11A36B')"></div>
              <div class="color-option" data-color="#FF6B6B" style="background-color: #FF6B6B" onclick="selectColor('#FF6B6B')"></div>
              <div class="color-option" data-color="#4ECDC4" style="background-color: #4ECDC4" onclick="selectColor('#4ECDC4')"></div>
              <div class="color-option" data-color="#45B7D1" style="background-color: #45B7D1" onclick="selectColor('#45B7D1')"></div>
              <div class="color-option" data-color="#96CEB4" style="background-color: #96CEB4" onclick="selectColor('#96CEB4')"></div>
              <div class="color-option" data-color="#FFEAA7" style="background-color: #FFEAA7" onclick="selectColor('#FFEAA7')"></div>
            </div>
          </div>

          <div class="button-group" style="display:flex; flex-direction:column; gap:12px; margin-top:20px;">
            <button class="btn-primary" onclick="saveProfile()" style="background:#1E3A8A; padding:10px 16px; font-size:14px;">Guardar Cambios</button>
            <button class="btn-primary" onclick="logout()" style="background:#E34C43; border-color:#7E1E19; padding:10px 16px; font-size:14px;">Cerrar Sesión</button>
          </div>
        </div>
      </div>
    </div>
  `;
};

window.openAvatarPicker = () => {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(2px)';
  modal.innerHTML = `
    <div style="background:#fff; width:90%; max-width:360px; border-radius:16px; padding:16px;">
      <h3 style="margin:0 0 8px 0; text-align:center;">Elige tu avatar</h3>
      <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px;">
        <button class="preset-avatar" data-src="assets/images/Group 4.png" style="border:none; background:#F3F4F6; border-radius:12px; padding:8px;">
          <img src="assets/images/Group 4.png" style="width:100%; height:80px; object-fit:contain;">
        </button>
        <button class="preset-avatar" data-src="assets/images/spiderman america.png" style="border:none; background:#F3F4F6; border-radius:12px; padding:8px;">
          <img src="assets/images/spiderman america.png" style="width:100%; height:80px; object-fit:contain;">
        </button>
      </div>
      <div style="display:flex; justify-content:center; gap:12px; margin-top:12px;">
        <button id="close-avatar" class="btn-primary" style="max-width:160px; background:#1E3A8A; border-color:#0E1A34;">Cerrar</button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  modal.querySelectorAll('.preset-avatar').forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.getAttribute('data-src');
      applyAvatarSrc(src);
      modal.remove();
    });
  });
  modal.querySelector('#close-avatar').addEventListener('click', () => modal.remove());
};

function applyAvatarSrc(src) {
  window.memoryState.currentUserAvatar = src;
  const profileImg = document.querySelector('.profile-img');
  if (profileImg) profileImg.src = src;
}

window.selectColor = (color) => {
  window.memoryState.currentUserBgColor = color;
  const profilePicture = document.querySelector('.profile-picture');
  if (profilePicture) {
    profilePicture.style.backgroundColor = color;
  }
  document.querySelectorAll('.color-option').forEach(option => {
    option.classList.remove('selected');
  });
  document.querySelector(`[data-color="${color}"]`).classList.add('selected');
};

window.saveProfile = async () => {
  const username = document.getElementById('username').value;

  if (!username) {
    alert('El nombre de usuario es requerido');
    return;
  }

  try {
    window.memoryState.currentUser = username;
    localStorage.setItem('currentUser', username);
    localStorage.setItem('currentUserAvatar', window.memoryState.currentUserAvatar);
    localStorage.setItem('currentUserBgColor', window.memoryState.currentUserBgColor);
    alert('Perfil actualizado exitosamente');
    navigateTo('/create');
  } catch (error) {
    console.error('Error:', error);
    alert('Error al actualizar el perfil');
  }
};

window.logout = () => {
  if (confirm('¿Seguro que quieres cerrar sesión?')) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentUserCoins');
    localStorage.removeItem('currentUserAvatar');
    localStorage.removeItem('currentUserBgColor');
    window.memoryState.currentUser = null;
    window.location.reload();
  }
};

window.goBackFromProfile = () => {
  navigateTo('/create');
};

