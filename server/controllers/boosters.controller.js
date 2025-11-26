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
    const boosters = await getAllBoosters();
    if (boosters.error) {
      return res.status(400).json(boosters);
    }
    res.json({ success: true, boosters });
  } catch (error) {
    console.error("Error listing boosters:", error);
    res.status(500).json({ error: "Error obteniendo potenciadores" });
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

    if (!boosterId) {
      return res.status(400).json({ error: "El boosterId es requerido" });
    }

    const [user, booster] = await Promise.all([getUserById(userId), getBoosterById(boosterId)]);

    if (!user || user.error) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (!booster || booster.error) {
      return res.status(404).json({ error: "Potenciador no encontrado" });
    }

    const coins = user["espaiser-coin"] || 0;
    if (coins < booster.booster_price) {
      return res.status(400).json({ error: "No tienes suficientes monedas" });
    }

    const insertResponse = await addBoosterToUser(userId, boosterId);
    if (insertResponse?.error) {
      return res.status(400).json(insertResponse);
    }

    const coinsResult = await changeUserCoins(userId, -booster.booster_price);
    if (coinsResult.error) {
      return res.status(400).json(coinsResult);
    }

    const inventory = await getUserBoostersAggregated(userId);
    res.json({
      success: true,
      coins: coinsResult.coins,
      inventory,
    });
  } catch (error) {
    console.error("Error purchasing booster:", error);
    res.status(500).json({ error: "Error comprando potenciador" });
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

