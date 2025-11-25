import { navigateTo, makeRequest, memoryState } from '../app.js';

export const renderProfileEdit = async () => {
	const userId = memoryState.currentUserId || Number(localStorage.getItem('currentUserId'));
	let profile = null;
	let inventory = memoryState.inventory || [];

	if (userId) {
		try {
			const response = await makeRequest(`/users/${userId}/profile`, 'GET');
			if (response?.success) {
				profile = response.user;
				inventory = response.inventory || [];
				memoryState.inventory = inventory;
				memoryState.currentUserCoins = response.user?.coins ?? memoryState.currentUserCoins;
			}
		} catch (error) {
			console.warn('No se pudo cargar el perfil desde el servidor:', error);
		}
	}

	const currentUser =
		profile?.username || memoryState.currentUser || localStorage.getItem('currentUser') || 'Usuario';
	const userAvatar =
		profile?.avatar_url ||
		memoryState.currentUserAvatar ||
		localStorage.getItem('currentUserAvatar') ||
		'/assets/images/Group 4.png';
	const userBgColor =
		profile?.avatar_bg || memoryState.currentUserBgColor || localStorage.getItem('currentUserBgColor') || '#F9D648';
	const coins = profile?.coins ?? memoryState.currentUserCoins ?? parseInt(localStorage.getItem('currentUserCoins') || '0', 10);

	const boostersMarkup =
		inventory && inventory.length > 0
			? inventory
					.map(
						(item) => `
        <li style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid rgba(0,0,0,0.05);">
          <span>${item.booster_name}</span>
          <strong>x${item.quantity}</strong>
        </li>`
					)
					.join('')
			: `<li style="padding:8px 0; color:#6B7280;">Aún no compras potenciadores.</li>`;

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

          <div style="display:flex; justify-content:center; align-items:center; gap:8px; background:#FFE28A; padding:8px 16px; border-radius:12px; margin-bottom:12px;">
            <img src="/assets/images/Group 19453.png" style="width:20px; height:20px;">
            <span style="font-weight:800; color:#1e3a8a;">${coins} monedas</span>
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

        <div class="profile-card" style="margin-top:16px;">
          <h2 style="margin-top:0; color:#1e3a8a;">Mis potenciadores</h2>
          <ul style="list-style:none; padding:0; margin:0;">
            ${boostersMarkup}
          </ul>
        </div>
      </div>
    </div>
  `;
};

window.openAvatarPicker = () => {
	const modal = document.createElement('div');
	modal.style.cssText =
		'position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(2px)';
	modal.innerHTML = `
    <div style="background:#fff; width:90%; max-width:360px; border-radius:16px; padding:16px;">
      <h3 style="margin:0 0 8px 0; text-align:center;">Elige tu avatar</h3>
      <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px;">
        <button class="preset-avatar" data-src="/assets/images/Group 4.png" style="border:none; background:#F3F4F6; border-radius:12px; padding:8px;">
          <img src="/assets/images/Group 4.png" style="width:100%; height:80px; object-fit:contain;">
        </button>
        <button class="preset-avatar" data-src="/assets/images/spiderman america.png" style="border:none; background:#F3F4F6; border-radius:12px; padding:8px;">
          <img src="/assets/images/spiderman america.png" style="width:100%; height:80px; object-fit:contain;">
        </button>
        <button class="preset-avatar" data-src="/assets/images/Captura de Pantalla 2025-09-07 a la(s) 8.49.54 p.m. 1.png" style="border:none; background:#F3F4F6; border-radius:12px; padding:8px;">
          <img src="/assets/images/Captura de Pantalla 2025-09-07 a la(s) 8.49.54 p.m. 1.png" style="width:100%; height:80px; object-fit:contain;">
        </button>
      </div>
      <div id="dropzone" style="margin-top:12px; border:2px dashed #9CA3AF; border-radius:12px; padding:12px; text-align:center; color:#6B7280;">Arrastra una imagen aquí o <button id="pick-file" class="register-link" style="background:none; border:none; color:#1E3A8A; text-decoration:underline;">explora tu equipo</button></div>
      <div style="display:flex; justify-content:center; gap:12px; margin-top:12px;">
        <button id="close-avatar" class="btn-primary" style="max-width:160px; background:#1E3A8A; border-color:#0E1A34;">Cerrar</button>
      </div>
    </div>`;
	document.body.appendChild(modal);

	modal.querySelectorAll('.preset-avatar').forEach((btn) => {
		btn.addEventListener('click', () => {
			const src = btn.getAttribute('data-src');
			applyAvatarSrc(src);
			modal.remove();
		});
	});
	modal.querySelector('#pick-file').addEventListener('click', () => {
		document.getElementById('avatarInput').click();
	});
	modal.querySelector('#close-avatar').addEventListener('click', () => modal.remove());

	const drop = modal.querySelector('#dropzone');
	['dragenter', 'dragover'].forEach((evt) =>
		drop.addEventListener(evt, (e) => {
			e.preventDefault();
			drop.style.background = '#EEF2FF';
		})
	);
	['dragleave', 'drop'].forEach((evt) =>
		drop.addEventListener(evt, (e) => {
			e.preventDefault();
			drop.style.background = '';
		})
	);
	drop.addEventListener('drop', (e) => {
		const file = e.dataTransfer.files?.[0];
		if (file)
			readFileAsDataUrl(file, (dataUrl) => {
				applyAvatarSrc(dataUrl);
				modal.remove();
			});
	});
};

function readFileAsDataUrl(file, cb) {
	const reader = new FileReader();
	reader.onload = (e) => cb(e.target.result);
	reader.readAsDataURL(file);
}

function applyAvatarSrc(src) {
	window.memoryState.currentUserAvatar = src;
	const profileImg = document.querySelector('.profile-img');
	if (profileImg) profileImg.src = src;
}

window.handleAvatarFile = async (event) => {
	const file = event.target.files[0];
	if (!file) return;
	readFileAsDataUrl(file, (dataUrl) => applyAvatarSrc(dataUrl));
};

window.selectColor = (color) => {
	window.memoryState.currentUserBgColor = color;

	const profilePicture = document.querySelector('.profile-picture');
	if (profilePicture) {
		profilePicture.style.backgroundColor = color;
	}

	document.querySelectorAll('.color-option').forEach((option) => {
		option.classList.remove('selected');
	});
	document.querySelector(`[data-color="${color}"]`).classList.add('selected');
};

window.saveProfile = async () => {
	const username = document.getElementById('username').value?.trim();

	if (!username) {
		alert('El nombre de usuario es requerido');
		return;
	}

	try {
		if (!memoryState.currentUserId) {
			alert('Debes iniciar sesión para guardar cambios.');
			return;
		}

		const payload = {
			username,
			avatar_url: memoryState.currentUserAvatar,
			avatar_bg: memoryState.currentUserBgColor,
		};

		const response = await makeRequest(`/users/${memoryState.currentUserId}`, 'PATCH', payload);
		if (response.error) {
			alert(response.error || 'No se pudo actualizar el perfil');
			return;
		}

		const updatedUser = response.user;
		memoryState.currentUser = updatedUser.username;
		memoryState.currentUserAvatar = updatedUser.avatar_url;
		memoryState.currentUserBgColor = updatedUser.avatar_bg;

		localStorage.setItem('currentUser', updatedUser.username);
		localStorage.setItem('currentUserAvatar', updatedUser.avatar_url || '');
		localStorage.setItem('currentUserBgColor', updatedUser.avatar_bg || '');

		alert('Perfil actualizado exitosamente');
		navigateTo('/main');
	} catch (error) {
		console.error('Error:', error);
		alert('Error al actualizar el perfil');
	}
};

window.logout = () => {
	if (confirm('¿Seguro que quieres cerrar sesión?')) {
		localStorage.removeItem('currentUser');
		localStorage.removeItem('currentUserId');
		localStorage.removeItem('currentUserCoins');
		localStorage.removeItem('currentUserAvatar');
		localStorage.removeItem('currentUserBgColor');
		memoryState.currentUser = null;
		memoryState.currentUserId = null;
		memoryState.currentUserCoins = 0;
		memoryState.inventory = [];
		window.location.reload();
	}
};

window.goBackFromProfile = () => {
	navigateTo('/main');
};
