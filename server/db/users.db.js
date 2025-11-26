const supabaseCli = require("../services/supabase.service");

const getAllUsers = async () => {
  const { data, error } = await supabaseCli.from("users").select();
  if (error) {
    console.error("Error getting users:", error);
    return [];
  }
  return data;
};

const getUserByEmail = async (email) => {
  const { data, error } = await supabaseCli
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("Error getting user by email:", error);
    return { error: error.message };
  }

  return data;
};

const getUserByUsername = async (username) => {
  const { data, error } = await supabaseCli
    .from("users")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    console.error("Error getting user by username:", error);
    return { error: error.message };
  }

  return data;
};

const getUserById = async (userId) => {
  const { data, error } = await supabaseCli
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error getting user by id:", error);
    return { error: error.message };
  }

  return data;
};

const createUserInDB = async (user) => {
  const colors = ['#F9D648', '#8FA6E0', '#11A36B', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const { data, error } = await supabaseCli
    .from("users")
    .insert([{
      username: user.name || user.username,
      email: user.email || `${user.name}@example.com`,
      password: user.password || null,
      "espaiser-coin": 100,
      avatar_url: '/assets/images/Group 4.png',
      avatar_bg: randomColor
    }])
    .select();

  if (error) {
    console.error("Error creating user:", error);
    return { error: error.message };
  }

  return data;
};

const updateUserInDb = async (newData, userId) => {
  const { data, error } = await supabaseCli
    .from("users")
    .update(newData)
    .eq("id", userId)
    .select();

  if (error) {
    console.error("Error updating user:", error);
    return { error: error.message };
  }

  return data;
};

const updateUserByEmail = async (newData, email) => {
  const { data, error } = await supabaseCli
    .from("users")
    .update(newData)
    .eq("email", email)
    .select();

  if (error) {
    console.error("Error updating user by email:", error);
    return { error: error.message };
  }

  return data;
};

const deleteUserInDb = async (userId) => {
  const { data, error } = await supabaseCli
    .from("users")
    .delete()
    .eq("id", userId)
    .select();

  if (error) {
    console.error("Error deleting user:", error);
    return { error: error.message };
  }

  return data;
};

const changeUserCoins = async (userId, delta) => {
  const { data: user, error: userError } = await supabaseCli
    .from("users")
    .select('id, "espaiser-coin"')
    .eq("id", userId)
    .single();

  if (userError) {
    console.error("Error retrieving user coins:", userError);
    return { error: userError.message };
  }

  const currentCoins = user["espaiser-coin"] || 0;
  const newCoins = Math.max(0, currentCoins + delta);

  console.log(`💰 changeUserCoins: userId=${userId}, current=${currentCoins}, delta=${delta}, new=${newCoins}`);

  const { data, error } = await supabaseCli
    .from("users")
    .update({ "espaiser-coin": newCoins })
    .eq("id", userId)
    .select();

  if (error) {
    console.error("Error updating user coins:", error);
    return { error: error.message };
  }

  const updatedCoins = data?.[0]?.["espaiser-coin"] ?? newCoins;
  console.log(`✅ Coins updated in DB: ${updatedCoins}`);

  return { coins: updatedCoins, user: data?.[0] };
};

module.exports = {
  getAllUsers,
  getUserByEmail,
  getUserByUsername,
  getUserById,
  createUserInDB,
  updateUserInDb,
  updateUserByEmail,
  deleteUserInDb,
  changeUserCoins,
};
