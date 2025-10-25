const express = require("express");
const {
  getAllCategories,
  getCategoryById,
  getQuestionsByCategory,
  getCategoriesWithQuestionCount
} = require("../controllers/categories.controller");
const router = express.Router();

router.get("/categories", getAllCategories);
router.get("/categories/with-count", getCategoriesWithQuestionCount);
router.get("/categories/:id", getCategoryById);
router.get("/categories/:categoryId/questions", getQuestionsByCategory);

module.exports = router;
