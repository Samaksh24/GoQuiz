import express from "express"
import { protect } from "../middleware/authMiddleware.js";
import { demoQuiz, quizHistory, startQuiz, submitDemo, submitQuiz } from "../controller/quizController.js";

const router = express.Router();

router.post('/start',protect,startQuiz)
router.post('/submit',protect,submitQuiz)
router.get('/history',protect,quizHistory)
router.post('/demo',demoQuiz)
router.post('/submitdemo',submitDemo);

export default router;