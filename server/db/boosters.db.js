const supabaseCli = require("../services/supabase.service");

const getAllBoosters = async () => {
  try {
    console.log('🔍 getAllBoosters: Iniciando consulta a Supabase...');
    const { data, error } = await supabaseCli.from("booster").select("*").order("id", { ascending: true });

    if (error) {
      console.error("❌ Error retrieving boosters:", error);
      console.error("❌ Error details:", JSON.stringify(error, null, 2));
      return { error: error.message };
    }

    console.log(`✅ getAllBoosters: Retornando ${data?.length || 0} boosters`);
    if (data && data.length > 0) {
      console.log('📦 Boosters encontrados:', data.map(b => ({ id: b.id, name: b.booster_name })));
    } else {
      console.warn('⚠️ getAllBoosters: No se encontraron boosters en la BD');
    }

    return data || [];
  } catch (err) {
    console.error("❌ Excepción en getAllBoosters:", err);
    return { error: err.message };
  }
};

const getBoosterById = async (id) => {
  try {
    console.log(`🔍 getBoosterById: Buscando booster con id ${id}...`);
    const { data, error } = await supabaseCli
      .from("booster")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("❌ Error retrieving booster:", error);
      console.error("❌ Error details:", JSON.stringify(error, null, 2));
      return { error: error.message };
    }

    if (!data) {
      console.warn(`⚠️ getBoosterById: No se encontró booster con id ${id}`);
    } else {
      console.log(`✅ getBoosterById: Encontrado booster:`, { id: data.id, name: data.booster_name });
    }

    return data;
  } catch (err) {
    console.error("❌ Excepción en getBoosterById:", err);
    return { error: err.message };
  }
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

