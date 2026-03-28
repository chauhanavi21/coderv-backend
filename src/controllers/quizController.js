import { getAllQuizzes, getQuizById, saveAttempt, getUserAttempts } from '../models/quizModel.js';

export async function listQuizzes(req, res) {
  try {
    const quizzes = await getAllQuizzes();
    res.json({ quizzes });
  } catch (err) {
    console.error('[quizController] listQuizzes:', err.message);
    res.status(500).json({ error: 'Failed to fetch quizzes.' });
  }
}

export async function getQuizDetail(req, res) {
  const { quizId } = req.params;
  try {
    const quiz = await getQuizById(quizId);
    res.json({ quiz });
  } catch (err) {
    console.error('[quizController] getQuizDetail:', err.message);
    if (err.code === 'PGRST116') return res.status(404).json({ error: 'Quiz not found.' });
    res.status(500).json({ error: 'Failed to fetch quiz.' });
  }
}

export async function submitAttempt(req, res) {
  const { quizId } = req.params;
  const { score, total, timeTaken } = req.body;
  const userId = req.auth.userId;

  if (score == null || total == null || timeTaken == null) {
    return res.status(400).json({ error: 'score, total, timeTaken are required.' });
  }

  try {
    const attempt = await saveAttempt(userId, quizId, score, total, timeTaken);
    res.json({ attempt });
  } catch (err) {
    console.error('[quizController] submitAttempt:', err.message);
    res.status(500).json({ error: 'Failed to save attempt.' });
  }
}

export async function getMyAttempts(req, res) {
  const userId = req.auth.userId;
  try {
    const attempts = await getUserAttempts(userId);
    res.json({ attempts });
  } catch (err) {
    console.error('[quizController] getMyAttempts:', err.message);
    res.status(500).json({ error: 'Failed to fetch attempts.' });
  }
}
