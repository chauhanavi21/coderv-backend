import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listQuizzes, getQuizDetail, submitAttempt, getMyAttempts } from '../controllers/quizController.js';

const router = Router();

router.get('/',              listQuizzes);           // public — list all
router.get('/my-attempts',   requireAuth, getMyAttempts);
router.get('/:quizId',       getQuizDetail);          // public — fetch quiz+questions
router.post('/:quizId/submit', requireAuth, submitAttempt);

export default router;
