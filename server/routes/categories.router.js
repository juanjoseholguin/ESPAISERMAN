const express = require("express");
const { getCategories, getQuestionsByCategory } = require("../controllers/categories.controller");
const router = express.Router();

router.get("/categories", getCategories);
router.get("/categories/:categoryId/questions", getQuestionsByCategory);

module.exports = router;
