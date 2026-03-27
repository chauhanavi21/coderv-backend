import { supabase } from '../config/supabase.js';

function ensureClient() {
  if (!supabase) throw new Error('Supabase not configured.');
}

/** All lesson types ordered by number */
export async function getAllLessons() {
  ensureClient();
  const { data, error } = await supabase
    .from('lesson_types')
    .select('id, number, title, description, color, available')
    .order('number');
  if (error) throw error;
  return data;
}

/**
 * Full lesson module shape (compatible with existing frontend module format):
 * { id, number, title, color, summary, lessonType, difficultyOrder, difficulties }
 * difficulties[diffId].examples = [{ id, title }] — titles only for sidebar
 */
export async function getLessonDetail(lessonId) {
  ensureClient();

  const [lessonRes, diffRes, exRes] = await Promise.all([
    supabase
      .from('lesson_types')
      .select('*')
      .eq('id', lessonId)
      .single(),
    supabase
      .from('difficulties')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('sort_order'),
    supabase
      .from('examples')
      .select('id, title, difficulty_key, sort_order')
      .eq('lesson_id', lessonId)
      .order('sort_order'),
  ]);

  if (lessonRes.error) throw lessonRes.error;
  if (diffRes.error) throw diffRes.error;
  if (exRes.error) throw exRes.error;

  const lt = lessonRes.data;
  const difficultyOrder = diffRes.data.map((d) => d.difficulty_key);

  const difficulties = {};
  for (const d of diffRes.data) {
    difficulties[d.difficulty_key] = {
      id: d.difficulty_key,
      label: d.label,
      description: d.description,
      examples: exRes.data
        .filter((e) => e.difficulty_key === d.difficulty_key)
        .map((e) => ({ id: e.id, title: e.title })),
    };
  }

  return {
    id: lt.id,
    number: lt.number,
    title: lt.title,
    color: lt.color,
    available: lt.available,
    summary: lt.summary,
    lessonType: {
      id: lt.id,
      label: lt.lesson_label,
      name: lt.lesson_name,
    },
    difficultyOrder,
    difficulties,
  };
}

/**
 * Full example — code, steps, quiz, nodes, edges.
 * Shape matches the existing frontend example format exactly.
 */
export async function getExampleById(exampleId) {
  ensureClient();

  const [exRes, stepsRes, questionsRes, nodesRes, edgesRes] = await Promise.all([
    supabase.from('examples').select('*').eq('id', exampleId).single(),
    supabase
      .from('example_steps')
      .select('*')
      .eq('example_id', exampleId)
      .order('sort_order'),
    supabase
      .from('quiz_questions')
      .select('*, quiz_options(id, sort_order, option_text)')
      .eq('example_id', exampleId)
      .order('sort_order'),
    supabase.from('graph_nodes').select('*').eq('example_id', exampleId),
    supabase.from('graph_edges').select('*').eq('example_id', exampleId),
  ]);

  if (exRes.error) throw exRes.error;
  if (stepsRes.error) throw stepsRes.error;
  if (questionsRes.error) throw questionsRes.error;
  if (nodesRes.error) throw nodesRes.error;
  if (edgesRes.error) throw edgesRes.error;

  const ex = exRes.data;

  const steps = stepsRes.data.map((s) => ({
    line: s.line_number,
    desc: s.description,
    action: s.action,
  }));

  const quiz = questionsRes.data.map((q) => ({
    question: q.question_text,
    options: [...q.quiz_options]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((o) => o.option_text),
    answer: q.correct_index,
  }));

  const nodes = nodesRes.data.map((n) => ({ id: n.node_id, label: n.label }));
  const edges = edgesRes.data.map((e) => ({ from: e.from_node, to: e.to_node }));

  return {
    id: ex.id,
    title: ex.title,
    concept: ex.concept,
    code: ex.code,
    explanation: ex.explanation,
    challenge: ex.challenge,
    steps,
    quiz,
    nodes,
    edges,
  };
}
