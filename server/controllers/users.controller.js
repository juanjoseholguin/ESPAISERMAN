const {
  getAllUsers,
  createUserInDB,
  updateUserInDb,
  updateUserByEmail,
  deleteUserInDb,
} = require("../db/users.db");
const supabaseCli = require("../services/supabase.service");

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
    const { name, email, username, password } = req.body;
    
    console.log("📝 Intentando crear usuario:", { name, email, username, password: password ? "***" : "undefined" });
    
    // Validar que se proporcione contraseña
    if (!password) {
      console.log("❌ No se proporcionó contraseña");
      return res.status(400).json({ error: "La contraseña es requerida" });
    }
    
    const userData = { 
      name: name || username, 
      email: email || `${name || username}@example.com`,
      password: password
    };
    
    console.log("💾 Guardando usuario en Supabase:", { ...userData, password: "***" });
    const response = await createUserInDB(userData);
    
    if (response.error) {
      console.log("❌ Error al crear usuario:", response.error);
      return res.status(400).json(response);
    }
    
    console.log("✅ Usuario creado exitosamente:", response[0].username);
    res.json({ success: true, user: response[0] });
  } catch (error) {
    console.error("❌ Error in createUser:", error);
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
    
    if (response.error) {
      return res.status(400).json(response);
    }
    
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
    
    if (response.error) {
      return res.status(400).json(response);
    }
    
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("🔐 Intentando login con:", { email, password: password ? "***" : "undefined" });
    
    if (!email || !password) {
      console.log("❌ Faltan credenciales");
      return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }
    
    // Buscar usuario por email
    console.log("🔍 Buscando usuario en Supabase...");
    const { data: users, error } = await supabaseCli
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    
    console.log("📊 Resultado de búsqueda:", { users: users ? "encontrado" : "no encontrado", error });
    
    if (error || !users) {
      console.log("❌ Usuario no encontrado o error:", error);
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    
    // Verificar contraseña (comparación directa)
    console.log("🔑 Comparando contraseñas:", { 
      input: password, 
      stored: users.password, 
      match: password === users.password 
    });
    
    if (password !== users.password) {
      console.log("❌ Contraseña incorrecta");
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    
    console.log("✅ Login exitoso para:", users.username);
    
    // Remover la contraseña de la respuesta
    const { password: _, ...userWithoutPassword } = users;
    
    res.json({ 
      success: true, 
      message: "Login exitoso", 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error("❌ Error in loginUser:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "Email, new password and confirm password are required" });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    
    const result = await updateUserByEmail({ password: newPassword }, email);
    
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json({ message: "Password updated successfully", data: result });
  } catch (error) {
    console.error("Error in updatePassword controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  updatePassword,
  loginUser,
};
