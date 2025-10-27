const express = require("express");
const { getQuestionById, getAllQuestions, getQuestionsByCategory } = require("../controllers/questions.controller");
const router = express.Router();

router.get("/questions/category/:categoryId", getQuestionsByCategory);
router.get("/questions/:id", getQuestionById);
router.get("/questions", getAllQuestions);

module.exports = router;
