const express = require("express");
const router = express.Router();
const {
  handleChangeScreenEvent,
} = require("../controllers/screen1Events.controller");

router.post("/change-screen", handleChangeScreenEvent);

module.exports = router;
