const supabaseCli = require("../services/supabase.service");

const getAllUsers = async () => {
  const { data, error } = await supabaseCli.from("users").select();
  if (error) {
    console.error("Error getting users:", error);
    return [];
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

module.exports = {
  getAllUsers,
  createUserInDB,
  updateUserInDb,
  updateUserByEmail,
  deleteUserInDb,
};
