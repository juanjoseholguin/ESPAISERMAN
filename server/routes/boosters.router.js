const express = require("express");
const {
  listBoosters,
  getInventory,
  purchaseBooster,
  consumeBooster,
} = require("../controllers/boosters.controller");

const router = express.Router();

router.get("/boosters", listBoosters);
router.get("/users/:userId/boosters", getInventory);
router.post("/users/:userId/boosters/purchase", purchaseBooster);
router.post("/users/:userId/boosters/consume", consumeBooster);

module.exports = router;

