const supabaseCli = require("../services/supabase.service");

const getAllBoosters = async () => {
  const { data, error } = await supabaseCli.from("booster").select("*").order("id", { ascending: true });

  if (error) {
    console.error("Error retrieving boosters:", error);
    return { error: error.message };
  }

  return data;
};

const getBoosterById = async (id) => {
  const { data, error } = await supabaseCli
    .from("booster")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error retrieving booster:", error);
    return { error: error.message };
  }

  return data;
};

const getUserBoosters = async (userId) => {
  const { data, error } = await supabaseCli
    .from("boosters_per_user")
    .select("id, booster_id, booster:booster_id (id, booster_name, booster_hability, booster_description, booster_price)")
    .eq("user_id", userId);

  if (error) {
    console.error("Error retrieving boosters per user:", error);
    return { error: error.message };
  }

  return data;
};

const addBoosterToUser = async (userId, boosterId) => {
  const { data, error } = await supabaseCli
    .from("boosters_per_user")
    .insert([{ user_id: userId, booster_id: boosterId }])
    .select();

  if (error) {
    console.error("Error adding booster to user:", error);
    return { error: error.message };
  }

  return data;
};

const consumeBoosterFromUser = async (userId, boosterId) => {
  const { data: boosterRow, error: fetchError } = await supabaseCli
    .from("boosters_per_user")
    .select("id")
    .eq("user_id", userId)
    .eq("booster_id", boosterId)
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    console.error("Error finding booster to consume:", fetchError);
    return { error: fetchError.message };
  }

  if (!boosterRow) {
    return { error: "No tienes unidades disponibles de este potenciador" };
  }

  const { data, error } = await supabaseCli
    .from("boosters_per_user")
    .delete()
    .eq("id", boosterRow.id)
    .select();

  if (error) {
    console.error("Error consuming booster:", error);
    return { error: error.message };
  }

  return data;
};

module.exports = {
  getAllBoosters,
  getBoosterById,
  getUserBoosters,
  addBoosterToUser,
  consumeBoosterFromUser,
};

