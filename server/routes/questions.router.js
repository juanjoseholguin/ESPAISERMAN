const express = require("express");
const { getQuestionById, getAllQuestions } = require("../controllers/questions.controller");
const router = express.Router();

router.get("/questions/:id", getQuestionById);
router.get("/questions", getAllQuestions);

module.exports = router;
