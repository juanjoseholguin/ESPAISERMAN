import { navigateTo, makeRequest, memoryState } from "../app.js";

// Función para suscribirse a cambios en el inventario usando Supabase Realtime
function setupInventoryRealtime(userId) {
  // Verificar si Supabase está disponible
  if (typeof window.supabase === 'undefined' && typeof supabase === 'undefined') {
    console.warn('Supabase no está disponible para Realtime. Asegúrate de incluir el script en index.html');
    return null;
  }

  const SUPABASE_URL = window.SUPABASE_URL;
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ SUPABASE_URL o SUPABASE_ANON_KEY no están configurados en index.html');
    return null;
  }
  
  // Usar la función createClient de Supabase
  const supabaseLib = window.supabase || (typeof supabase !== 'undefined' ? supabase : null);
  if (!supabaseLib || !supabaseLib.createClient) {
    console.warn('⚠️ Supabase createClient no está disponible');
    return null;
  }
  
  const supabaseClient = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Suscribirse a cambios en boosters_per_user para este usuario
  const channel = supabaseClient
    .channel(`inventory-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'boosters_per_user',
        filter: `user_id=eq.${userId}`
      },
      async (payload) => {
        console.log('🔄 Cambio detectado en inventario:', payload);
        
        // Recargar el inventario desde el servidor
        try {
          const response = await makeRequest(`/users/${userId}/boosters`, 'GET');
          if (response?.success && response.inventory) {
            memoryState.inventory = response.inventory;
            console.log('✅ Inventario actualizado desde Realtime:', memoryState.inventory);
            
            // Si estamos en la tienda, actualizar las cantidades dinámicamente
            if (document.getElementById('shop-grid')) {
              const shopGrid = document.getElementById('shop-grid');
              if (shopGrid && window.currentBoosters) {
                // Actualizar solo las cantidades sin recargar toda la página
                const currentInventory = memoryState.inventory;
                document.querySelectorAll('.shop-card').forEach(card => {
                  const boosterId = Number(card.getAttribute('data-id'));
                  const booster = window.currentBoosters.find(b => b.id === boosterId);
                  if (booster) {
                    // Buscar por nombre exacto o sin case-sensitive
                    let item = currentInventory.find(i => i.booster_name === booster.booster_name);
                    if (!item) {
                      item = currentInventory.find(i => 
                        i.booster_name?.toLowerCase() === booster.booster_name?.toLowerCase()
                      );
                    }
                    const qty = item?.quantity || 0;
                    const qtyBadge = card.querySelector('span[style*="position:absolute"]');
                    if (qtyBadge) {
                      qtyBadge.textContent = `x${qty}`;
                      console.log(`🔄 Actualizado ${booster.booster_name}: x${qty}`);
                    }
                  }
                });
              }
            }
          }
        } catch (error) {
          console.error('Error recargando inventario:', error);
        }
      }
    )
    .subscribe();

  return channel;
}

const boosterIcons = {
  "Empanadirri": "assets/images/empanada.png",
  "Empanadirri legal": "assets/images/empanada.png",
  "Media": "assets/images/guaro.png",
  "Media de güaro temporal": "assets/images/guaro.png",
  "Chichaghrrrom": "assets/images/chicharron.png",
  "Chichaghrrom": "assets/images/chicharron.png",
  "Café": "assets/images/cafe.png",
  "Café cargado": "assets/images/cafe.png",
};

// Potenciadores por defecto (fallback si no hay en BD)
const defaultBoosters = [
  { id: 1, booster_name: "Empanadirri legal", booster_hability: "Revive el hambre de aprender", booster_description: "Te da una segunda oportunidad para continuar", booster_price: 300 },
  { id: 2, booster_name: "Media de güaro temporal", booster_hability: "Emborrachar el reloj", booster_description: "Suma 5 segundos más al reloj", booster_price: 200 },
  { id: 3, booster_name: "Chichaghrrom", booster_hability: "Puro poder porcino", booster_description: "Duplica los puntos que ganes en la siguiente", booster_price: 500 },
  { id: 4, booster_name: "Café cargado", booster_hability: "Despierta la mente", booster_description: "Elimina una respuesta incorrecta de la siguiente", booster_price: 400 },
];

export default async function renderShop() {
  const userId = memoryState.currentUserId;
  if (!userId) {
    alert("Debes iniciar sesión para usar la tienda.");
    navigateTo("/main");
    return;
  }

  // Limpiar suscripción anterior si existe
  if (window.inventoryChannel) {
    window.inventoryChannel.unsubscribe();
    window.inventoryChannel = null;
  }

  // Configurar Realtime para el inventario (sin Socket.IO)
  window.inventoryChannel = setupInventoryRealtime(userId);

  let boosters = [];
  let inventory = [];
  
  try {
    console.log(`📥 Cargando inventario para usuario ${userId}...`);
    const inventoryResponse = await makeRequest(`/users/${userId}/boosters`, "GET");
    
    console.log('📦 Respuesta completa del servidor (tienda):', JSON.stringify(inventoryResponse, null, 2));
    
    if (inventoryResponse?.success && inventoryResponse.inventory && Array.isArray(inventoryResponse.inventory)) {
      inventory = inventoryResponse.inventory;
    } else if (Array.isArray(inventoryResponse)) {
      inventory = inventoryResponse;
    } else if (inventoryResponse?.inventory && Array.isArray(inventoryResponse.inventory)) {
      inventory = inventoryResponse.inventory;
    } else if (inventoryResponse?.data && Array.isArray(inventoryResponse.data)) {
      inventory = inventoryResponse.data;
    } else {
      inventory = [];
    }
    
    memoryState.inventory = inventory;
    console.log("✅ Inventario cargado del servidor (tienda):", inventory);
    console.log("📊 Detalles:", inventory.map(i => `${i.booster_name}: x${i.quantity} (id: ${i.booster_id || i.id})`));
  } catch (error) {
    console.error("❌ Error loading inventory:", error);
    if (memoryState.inventory && memoryState.inventory.length > 0) {
      inventory = memoryState.inventory;
      console.log("📦 Usando inventario de memoryState (fallback):", inventory);
    } else {
      inventory = [];
    }
  }
  
  // Cargar boosters
  try {
    const boostersResponse = await makeRequest("/boosters", "GET");
    
    if (boostersResponse?.boosters && Array.isArray(boostersResponse.boosters)) {
      boosters = boostersResponse.boosters;
    } else if (Array.isArray(boostersResponse)) {
      boosters = boostersResponse;
    } else if (boostersResponse?.success && Array.isArray(boostersResponse.data)) {
      boosters = boostersResponse.data;
    }
    
    console.log("Final boosters array:", boosters);
    console.log("Final inventory array:", inventory);
  } catch (error) {
    console.error("Error loading shop data:", error);
    // No mostrar alert, usar boosters por defecto
  }

  // Si no hay boosters de la BD, usar los por defecto
  if (boosters.length === 0) {
    boosters = defaultBoosters;
  }

  // Guardar boosters para actualización dinámica (después de cargarlos)
  window.currentBoosters = boosters;

  const coins = memoryState.currentUserCoins || 0;

  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="screen active">
      <button class="back-button" id="back-shop"><div class="back-arrow"></div></button>
      <div class="main-content" style="gap:16px;">
        <div class="group4-container" style="margin-top:12px; text-align:center;">
          <img src="assets/images/Group 4.png" alt="Espaiserman" class="group4-image" style="max-width:220px;">
        </div>
        <h1 class="form-title">Tienda</h1>
        <p style="text-align:center; opacity:.8; margin-top:-8px;">Con estos potenciadores vas a llegar más alto que Jaime</p>
        <div style="display:flex; justify-content:center; align-items:center; gap:8px; background:#FFE28A; padding:8px 16px; border-radius:16px; margin:0 auto 16px;">
          <img src="assets/images/Group 19453.png" alt="coin" style="width:24px; height:24px;">
          <span id="coins-label" style="font-weight:800; color:#1e3a8a;">${coins}</span>
        </div>
        <div id="shop-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;"></div>
      </div>
    </div>
  `;

  document.getElementById("back-shop").addEventListener("click", () => { navigateTo("/main"); });

  const modal = document.createElement("div");
  modal.style.cssText = "position:fixed; inset:0; display:none; align-items:center; justify-content:center; background:rgba(0,0,0,.55); z-index:999; backdrop-filter: blur(2px);";
  modal.innerHTML = `
    <div id="shop-modal" style="background:rgba(249,214,72,0.95); border-radius:24px; padding:20px; width:85%; max-width:320px; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,.4);">
      <h2 id="m-title" style="margin-bottom:4px; font-size:26px;">Título</h2>
      <div id="m-sub" style="opacity:.9; margin-bottom:12px;">Subtítulo</div>
      <div style="background:rgba(255,226,138,0.95); border-radius:16px; padding:12px; margin:12px 0;">
        <img id="m-img" src="" alt="item" style="width:110px; display:block; margin:0 auto;">
      </div>
      <div style="font-weight:800; margin:4px 0 2px 0;">"<span id="m-phrase">Frase</span>"</div>
      <div id="m-desc" style="opacity:.9; margin-bottom:16px;">Descripción</div>
      <div style="display:flex; gap:12px; justify-content:center;">
        <button id="m-back" class="btn-primary" style="max-width:140px; background:#1E3A8A; border-color:#0E1A34;">←</button>
        <button id="m-buy" class="btn-primary" style="max-width:180px; background:#11A36B; border-color:#0C6E4A;">Comprar <img src="assets/images/Group 19453.png" style="width:16px; height:16px; vertical-align:middle;"><span id="m-price">0</span></button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  // SIEMPRE usar memoryState.inventory si está disponible
  const currentInventory = (memoryState.inventory && memoryState.inventory.length > 0) ? memoryState.inventory : inventory;
  
  const getQuantity = (boosterId, name) => {
    if (!currentInventory || currentInventory.length === 0) {
      console.log(`⚠️ Inventario vacío para "${name}" (id: ${boosterId})`);
      return 0;
    }
    
    let item = currentInventory.find((item) => {
      const matchesId = item.booster_id === boosterId || item.id === boosterId;
      const matchesName = item.booster_name === name || 
                         item.booster_name?.toLowerCase() === name?.toLowerCase();
      return matchesId || matchesName;
    });
    
    const qty = item ? (Number(item.quantity) || 0) : 0;
    
    if (qty > 0) {
      console.log(`✅ Encontrado "${name}" (id: ${boosterId}): x${qty}`, item);
    } else {
      console.log(`❌ No encontrado "${name}" (id: ${boosterId}) en inventario.`, {
        buscando: { boosterId, name },
        inventario: currentInventory.map(i => ({ id: i.booster_id || i.id, name: i.booster_name, qty: i.quantity }))
      });
    }
    return qty;
  };
  
  console.log("🛒 Inventario actual para mostrar:", currentInventory);
  console.log("🛒 Boosters disponibles:", boosters.length, boosters.map(b => b.booster_name));
  
  const shopGrid = document.getElementById("shop-grid");
  
  if (!shopGrid) {
    console.error("❌ No se encontró el elemento shop-grid");
    return;
  }
  
  if (boosters.length === 0) {
    console.warn("⚠️ No hay boosters disponibles, mostrando mensaje");
    shopGrid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px; color:#666;">No hay potenciadores disponibles en este momento.</div>';
    return;
  }
  
  shopGrid.innerHTML = boosters
    .map(
      (booster) => {
        const qty = getQuantity(booster.id, booster.booster_name);
        return `
        <button class="shop-card" data-id="${booster.id}" style="position:relative; background:rgba(255,255,255,0.9); border-radius:20px; padding:12px; text-align:center; border:none; cursor:pointer;">
          <span style="position:absolute; top:10px; right:12px; background:#1e3a8a; color:white; padding:2px 8px; border-radius:999px; font-size:12px;">x${qty}</span>
          <img src="${boosterIcons[booster.booster_name] || "assets/images/Group 4.png"}" alt="${booster.booster_name}" style="width:100%; max-width:96px; margin:0 auto; display:block;">
          <div style="font-weight:800; margin-top:8px; color:#1e3a8a;">${booster.booster_name}</div>
          <div style="font-size:14px; color:#666; margin-top:4px;">${booster.booster_price || 200} monedas</div>
        </button>`;
      }
    )
    .join("");
  
  console.log("✅ Tienda renderizada con", boosters.length, "boosters");

  let selectedBooster = null;

  function openModal(booster) {
    if (!booster) return;
    modal.dataset.boosterId = booster.id;
    modal.querySelector('#m-title').textContent = booster.booster_name;
    modal.querySelector('#m-sub').textContent = booster.booster_hability || "Potenciador especial";
    modal.querySelector('#m-img').src = boosterIcons[booster.booster_name] || "assets/images/Group 4.png";
    modal.querySelector('#m-phrase').textContent = booster.booster_description || "¡Dale con toda!";
    modal.querySelector('#m-desc').textContent = `Precio: ${booster.booster_price} monedas`;
    modal.querySelector('#m-price').textContent = booster.booster_price;
    modal.style.display = 'flex';
  }

  document.querySelectorAll('.shop-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const boosterId = Number(btn.getAttribute('data-id'));
      selectedBooster = boosters.find((b) => b.id === boosterId) || null;
      openModal(selectedBooster);
    });
  });

  modal.querySelector('#m-back').addEventListener('click', () => { modal.style.display = 'none'; });

  modal.querySelector('#m-buy').addEventListener('click', async () => {
    if (!selectedBooster) return;
    
    const boosterId = Number(selectedBooster.id);
    if (!boosterId || boosterId <= 0) {
      console.error('❌ ID de booster inválido:', selectedBooster);
      alert('Error: ID de potenciador inválido');
      return;
    }
    
    try {
      console.log('🛒 Iniciando compra:', {
        boosterId,
        boosterName: selectedBooster.booster_name,
        price: selectedBooster.booster_price,
        userId
      });
      
      const response = await makeRequest(`/users/${userId}/boosters/purchase`, "POST", { boosterId });
      
      console.log('📦 Respuesta del servidor:', JSON.stringify(response, null, 2));
      
      if (response.error) {
        console.error('❌ Error del servidor:', response.error);
        alert(response.error);
        return;
      }
      
      if (!response.success) {
        console.error('❌ Compra no exitosa:', response);
        alert('Error al completar la compra. Por favor intenta de nuevo.');
        return;
      }
      
      memoryState.currentUserCoins = response.coins || 0;
      memoryState.inventory = response.inventory || [];
      localStorage.setItem('currentUserCoins', memoryState.currentUserCoins.toString());
      
      const boosterSlugByName = {
        'Empanadirri': 'empanada',
        'Empanadirri legal': 'empanada',
        'Media': 'guaro',
        'Media de güaro temporal': 'guaro',
        'Media de güaro tempo': 'guaro',
        'Chichaghrrrom': 'chicharron',
        'Chichaghrrom': 'chicharron',
        'Café': 'cafe',
        'Café cargado': 'cafe',
      };
      
      const activePowerups = [];
      if (response.inventory && Array.isArray(response.inventory)) {
        response.inventory.forEach(item => {
          const slug = boosterSlugByName[item.booster_name] || item.booster_name?.toLowerCase();
          if (slug && item.quantity > 0) {
            for (let i = 0; i < item.quantity; i++) {
              activePowerups.push(slug);
            }
          }
        });
      }
      localStorage.setItem('activePowerups', JSON.stringify(activePowerups));
      
      console.log('✅ Compra exitosa - Estado actualizado:', {
        coins: memoryState.currentUserCoins,
        inventory: memoryState.inventory,
        inventoryLength: memoryState.inventory?.length,
        inventoryDetails: memoryState.inventory?.map(i => `${i.booster_name}: x${i.quantity} (id: ${i.booster_id})`),
        activePowerups: activePowerups
      });
      
      modal.style.display = 'none';
      
      await renderShop();
      
      alert('¡Compra exitosa! Ya puedes usar tu potenciador en la partida.');
    } catch (error) {
      console.error("❌ Error purchasing booster:", error);
      alert("No se pudo completar la compra: " + (error.message || 'Error desconocido'));
    }
  });
}
