const {
  getAllBoosters,
  getBoosterById,
  addBoosterToUser,
  consumeBoosterFromUser,
} = require("../db/boosters.db");
const { getUserById, changeUserCoins } = require("../db/users.db");
const { getUserBoostersAggregated } = require("../services/userInventory.service");

const listBoosters = async (_req, res) => {
  try {
    console.log('📥 GET /boosters: Iniciando...');
    const boosters = await getAllBoosters();
    
    if (boosters.error) {
      console.error('❌ Error en getAllBoosters:', boosters.error);
      return res.status(400).json(boosters);
    }

    if (!boosters || !Array.isArray(boosters)) {
      console.error('❌ getAllBoosters retornó un valor inválido:', boosters);
      return res.status(500).json({ error: "Error obteniendo potenciadores: respuesta inválida" });
    }

    console.log(`✅ GET /boosters: Retornando ${boosters.length} boosters`);
    res.json({ success: true, boosters });
  } catch (error) {
    console.error("❌ Excepción en listBoosters:", error);
    res.status(500).json({ error: "Error obteniendo potenciadores", details: error.message });
  }
};

const getInventory = async (req, res) => {
  try {
    const { userId } = req.params;
    const inventory = await getUserBoostersAggregated(userId);
    if (inventory.error) {
      return res.status(400).json(inventory);
    }
    res.json({ success: true, inventory });
  } catch (error) {
    console.error("Error retrieving inventory:", error);
    res.status(500).json({ error: "Error obteniendo inventario" });
  }
};

const purchaseBooster = async (req, res) => {
  try {
    const { userId } = req.params;
    const { boosterId } = req.body;

    console.log('🛒 Purchase request:', { userId, boosterId });

    if (!boosterId) {
      return res.status(400).json({ error: "El boosterId es requerido" });
    }

    const [user, booster] = await Promise.all([getUserById(userId), getBoosterById(Number(boosterId))]);

    if (!user || user.error) {
      console.error('❌ Usuario no encontrado:', userId);
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (!booster || booster.error || !booster.id) {
      console.error('❌ Booster no encontrado, buscando todos los boosters disponibles...');
      const allBoostersResult = await getAllBoosters();
      console.log('📦 Resultado de getAllBoosters:', allBoostersResult);
      
      let allBoosters = [];
      if (Array.isArray(allBoostersResult)) {
        allBoosters = allBoostersResult;
      } else if (allBoostersResult?.error) {
        console.error('❌ Error al obtener boosters:', allBoostersResult.error);
        allBoosters = [];
      }
      
      const availableIds = allBoosters.length > 0 ? allBoosters.map(b => b.id).join(', ') : 'ninguno';
      console.error('❌ Booster no encontrado:', { 
        requestedId: boosterId, 
        booster, 
        allBoostersCount: allBoosters.length,
        allBoostersResult,
        availableIds: allBoosters.map(b => ({ id: b.id, name: b.booster_name }))
      });
      return res.status(404).json({ error: `Potenciador no encontrado. ID solicitado: ${boosterId}. IDs disponibles: ${availableIds}` });
    }

    console.log('✅ Usuario y booster encontrados:', {
      userCoins: user["espaiser-coin"],
      boosterName: booster.booster_name,
      boosterPrice: booster.booster_price
    });

    const coins = user["espaiser-coin"] || 0;
    if (coins < booster.booster_price) {
      return res.status(400).json({ error: "No tienes suficientes monedas" });
    }

    console.log('💾 Insertando booster en boosters_per_user...');
    const insertResponse = await addBoosterToUser(userId, boosterId);
    if (insertResponse?.error) {
      console.error('❌ Error insertando booster:', insertResponse.error);
      return res.status(400).json(insertResponse);
    }
    console.log('✅ Booster insertado:', insertResponse);

    console.log('💰 Actualizando monedas...');
    const coinsResult = await changeUserCoins(userId, -booster.booster_price);
    if (coinsResult.error) {
      console.error('❌ Error actualizando monedas:', coinsResult.error);
      return res.status(400).json(coinsResult);
    }
    console.log('✅ Monedas actualizadas:', coinsResult.coins);

    console.log('📦 Obteniendo inventario actualizado...');
    const inventory = await getUserBoostersAggregated(userId);
    if (inventory.error) {
      console.error('❌ Error obteniendo inventario:', inventory.error);
      return res.status(400).json(inventory);
    }

    console.log('✅ Compra completada:', {
      coins: coinsResult.coins,
      inventoryCount: inventory.length,
      inventory: inventory.map(i => `${i.booster_name}: x${i.quantity}`)
    });

    res.json({
      success: true,
      coins: coinsResult.coins,
      inventory,
    });
  } catch (error) {
    console.error("❌ Error purchasing booster:", error);
    res.status(500).json({ error: "Error comprando potenciador: " + error.message });
  }
};

const consumeBooster = async (req, res) => {
  try {
    const { userId } = req.params;
    const { boosterId } = req.body;

    if (!boosterId) {
      return res.status(400).json({ error: "El boosterId es requerido" });
    }

    const removeResponse = await consumeBoosterFromUser(userId, boosterId);
    if (removeResponse?.error) {
      return res.status(400).json(removeResponse);
    }

    const inventory = await getUserBoostersAggregated(userId);
    res.json({ success: true, inventory });
  } catch (error) {
    console.error("Error consuming booster:", error);
    res.status(500).json({ error: "Error usando potenciador" });
  }
};

module.exports = {
  listBoosters,
  getInventory,
  purchaseBooster,
  consumeBooster,
};

