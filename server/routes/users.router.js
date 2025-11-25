const express = require("express");
const {
  createUser,
  loginUser,
  getUsers,
  updateUser,
  deleteUser,
  adjustCoins,
  getProfile,
} = require("../controllers/users.controller");
const router = express.Router();

router.get("/users", getUsers);
router.get("/users/:id/profile", getProfile);

router.post("/users", createUser);
router.post("/auth/register", createUser);
router.post("/auth/login", loginUser);

router.patch("/users/:id", updateUser);
router.patch("/users/:id/coins", adjustCoins);

router.delete("/users/:id", deleteUser);

module.exports = router;