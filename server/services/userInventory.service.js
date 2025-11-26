const { getUserBoosters } = require("../db/boosters.db");

const getUserBoostersAggregated = async (userId) => {
  const response = await getUserBoosters(userId);
  if (response?.error) {
    console.error('❌ Error obteniendo boosters del usuario:', response.error);
    return { error: response.error };
  }

  if (!response || !Array.isArray(response)) {
    console.warn('⚠️ Respuesta inválida de getUserBoosters:', response);
    return [];
  }

  console.log(`📦 Procesando ${response.length} registros de boosters_per_user para usuario ${userId}`);

  const counts = {};
  response.forEach((row, index) => {
    const booster = row.booster;
    if (!booster) {
      console.warn(`⚠️ Fila ${index} sin booster:`, row);
      return;
    }
    
    if (!counts[booster.id]) {
      counts[booster.id] = {
        booster_id: booster.id,
        booster_name: booster.booster_name,
        booster_hability: booster.booster_hability || booster.booster_habili,
        booster_description: booster.booster_description || booster.booster_descr,
        booster_price: booster.booster_price,
        quantity: 0,
      };
    }
    counts[booster.id].quantity += 1;
    console.log(`✅ Agregado booster ${booster.booster_name} (id: ${booster.id}), cantidad total: ${counts[booster.id].quantity}`);
  });

  const result = Object.values(counts);
  console.log(`✅ Inventario agregado: ${result.length} tipos de boosters`, result.map(i => `${i.booster_name}: x${i.quantity}`));
  return result;
};

module.exports = { getUserBoostersAggregated };

