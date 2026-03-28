import { supabase } from '../config/supabase.js';

function ensureClient() {
  if (!supabase) throw new Error('Supabase not configured.');
}

/** All extra quizzes ordered by sort_order */
export async function getAllQuizzes() {
  ensureClient();
  const { data, error } = await supabase
    .from('extra_quizzes')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data;
}

/** Single quiz with all questions and options */
export async function getQuizById(quizId) {
  ensureClient();

  const [quizRes, questionsRes] = await Promise.all([
    supabase.from('extra_quizzes').select('*').eq('id', quizId).single(),
    supabase
      .from('extra_quiz_questions')
      .select('*, extra_quiz_options(id, sort_order, option_text)')
      .eq('quiz_id', quizId)
      .order('sort_order'),
  ]);

  if (quizRes.error) throw quizRes.error;
  if (questionsRes.error) throw questionsRes.error;

  const questions = questionsRes.data.map((q) => ({
    id: q.id,
    question: q.question_text,
    options: [...q.extra_quiz_options]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((o) => o.option_text),
    answer: q.correct_index,
  }));

  return { ...quizRes.data, questions };
}

/** Save an attempt result */
export async function saveAttempt(userId, quizId, score, total, timeTaken) {
  ensureClient();
  const { data, error } = await supabase
    .from('extra_quiz_attempts')
    .insert({ user_id: userId, quiz_id: quizId, score, total, time_taken: timeTaken })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Best attempt per quiz for a user */
export async function getUserAttempts(userId) {
  ensureClient();
  const { data, error } = await supabase
    .from('extra_quiz_attempts')
    .select('quiz_id, score, total, time_taken, attempted_at')
    .eq('user_id', userId)
    .order('attempted_at', { ascending: false });
  if (error) throw error;
  return data;
}
