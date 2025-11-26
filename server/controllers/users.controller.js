const bcrypt = require("bcryptjs");
const {
  getAllUsers,
  getUserByEmail,
  getUserByUsername,
  getUserById,
  createUserInDB,
  updateUserInDb,
  deleteUserInDb,
  changeUserCoins,
} = require("../db/users.db");
const { getUserBoostersAggregated } = require("../services/userInventory.service");

const sanitizeUser = (user) => {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    coins: user["espaiser-coin"] || 0,
    avatar_url: user.avatar_url,
    avatar_bg: user.avatar_bg,
    created_at: user.created_at,
  };
};

const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users.map(sanitizeUser));
  } catch (error) {
    console.error("Error in getUsers:", error);
    res.status(500).json({ error: "Error getting users" });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    if (!email || !password || !(name || username)) {
      return res.status(400).json({ error: "Nombre/usuario, email y contraseña son obligatorios" });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser && !existingUser.error) {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      name: name || username,
      username: username || name,
      email,
      password: hashedPassword,
    };
    const response = await createUserInDB(userData);

    if (response.error) {
      return res.status(400).json(response);
    }

    res.json({ success: true, user: sanitizeUser(response[0]) });
  } catch (error) {
    console.error("Error in createUser:", error);
    res.status(500).json({ error: "Error creating user" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email o usuario y contraseña son obligatorios" });
    }

    const identifier = email.trim();
    let user;
    if (identifier.includes("@")) {
      user = await getUserByEmail(identifier);
    } else {
      user = await getUserByUsername(identifier);
    }

    if (!user || user.error) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    if (!user.password) {
      return res.status(401).json({ error: "El usuario no tiene una contraseña configurada" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const inventory = await getUserBoostersAggregated(user.id);

    res.json({ success: true, user: sanitizeUser(user), inventory });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, username, avatar_url, avatar_bg } = req.body;
    const { id: userId } = req.params;
    const updateData = {
      username: name || username,
      email,
    };

    if (avatar_url) updateData.avatar_url = avatar_url;
    if (avatar_bg) updateData.avatar_bg = avatar_bg;

    const response = await updateUserInDb(updateData, userId);

    if (response.error) {
      return res.status(400).json(response);
    }

    res.json({ success: true, user: sanitizeUser(response[0]) });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ error: "Error updating user" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const response = await deleteUserInDb(userId);

    if (response.error) {
      return res.status(400).json(response);
    }

    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
};

const adjustCoins = async (req, res) => {
  try {
    const { id } = req.params;
    const { delta = 0 } = req.body;

    if (!delta) {
      return res.status(400).json({ error: "El delta de monedas es requerido" });
    }

    const result = await changeUserCoins(id, delta);
    if (result.error) {
      return res.status(400).json(result);
    }

    res.json({ success: true, coins: result.coins });
  } catch (error) {
    console.error("Error adjusting coins:", error);
    res.status(500).json({ error: "Error actualizando monedas" });
  }
};

const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user || user.error) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const inventory = await getUserBoostersAggregated(id);
    res.json({ success: true, user: sanitizeUser(user), inventory });
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ error: "Error obteniendo perfil" });
  }
};

module.exports = {
  getUsers,
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  adjustCoins,
  getProfile,
};