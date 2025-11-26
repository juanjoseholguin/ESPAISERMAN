const { getUserBoosters } = require("../db/boosters.db");

const getUserBoostersAggregated = async (userId) => {
  const response = await getUserBoosters(userId);
  if (response?.error) {
    return { error: response.error };
  }

  const counts = {};
  response.forEach((row) => {
    const booster = row.booster;
    if (!booster) return;
    if (!counts[booster.id]) {
      counts[booster.id] = {
        booster_id: booster.id,
        booster_name: booster.booster_name,
        booster_hability: booster.booster_hability,
        booster_description: booster.booster_description,
        booster_price: booster.booster_price,
        quantity: 0,
      };
    }
    counts[booster.id].quantity += 1;
  });

  return Object.values(counts);
};

module.exports = { getUserBoostersAggregated };

