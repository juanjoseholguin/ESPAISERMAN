const {
  getAllUsers,
  createUserInDB,
  updateUserInDb,
  deleteUserInDb,
} = require("../db/users-simple.db");

const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error in getUsers:", error);
    res.status(500).json({ error: "Error getting users" });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, username } = req.body;
    const userData = { 
      name: name || username, 
      email: email || `${name || username}@example.com` 
    };
    const response = await createUserInDB(userData);
    
    res.json({ success: true, user: response[0] });
  } catch (error) {
    console.error("Error in createUser:", error);
    res.status(500).json({ error: "Error creating user" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, username } = req.body;
    const { id: userId } = req.params;
    const updateData = { 
      username: name || username,
      email: email 
    };
    const response = await updateUserInDb(updateData, userId);
    
    res.json({ success: true, user: response[0] });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ error: "Error updating user" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const response = await deleteUserInDb(userId);
    
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
