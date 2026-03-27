/**
 * Seed script — populates Supabase with all lesson data from lessonModules.js.
 *
 * Run once (or re-run anytime to refresh):
 *   node seed.js
 *
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import {
  lessonsRegistry,
  lessonTypeOneModule,
  lessonTypeTwoModule,
  lessonTypeThreeModule,
  lessonTypeFourModule,
} from '../frontend/src/data/lessonModules.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const MODULES = {
  'type-1': lessonTypeOneModule,
  'type-2': lessonTypeTwoModule,
  'type-3': lessonTypeThreeModule,
  'type-4': lessonTypeFourModule,
};

async function upsert(table, rows, conflict) {
  const { error } = await supabase
    .from(table)
    .upsert(rows, { onConflict: conflict, ignoreDuplicates: false });
  if (error) throw new Error(`[${table}] ${error.message}`);
}

async function deleteWhere(table, column, value) {
  const { error } = await supabase.from(table).delete().eq(column, value);
  if (error) throw new Error(`[delete ${table}] ${error.message}`);
}

async function insertBatch(table, rows) {
  if (!rows.length) return;
  const { error } = await supabase.from(table).insert(rows);
  if (error) throw new Error(`[insert ${table}] ${error.message}`);
}

async function getQuestionIds(exampleId) {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('id, sort_order')
    .eq('example_id', exampleId)
    .order('sort_order');
  if (error) throw error;
  return data;
}

async function seed() {
  console.log('━━━ CoderV Seed ━━━');

  // ── 1. lesson_types ────────────────────────────────────────────────────────
  console.log('Seeding lesson_types…');
  const lessonTypeRows = lessonsRegistry.map((l) => {
    const mod = MODULES[l.id];
    return {
      id: l.id,
      number: l.number,
      title: l.title,
      description: l.description,
      color: l.color,
      available: l.available,
      summary: mod?.summary ?? '',
      lesson_label: mod?.lessonType?.label ?? '',
      lesson_name: mod?.lessonType?.name ?? '',
      sort_order: l.number,
    };
  });
  await upsert('lesson_types', lessonTypeRows, 'id');
  console.log(`  ✓ ${lessonTypeRows.length} lesson types`);

  // ── 2. Per module: difficulties + examples + steps + quiz + nodes + edges ──
  for (const [lessonId, mod] of Object.entries(MODULES)) {
    console.log(`\nSeeding module: ${mod.title}`);

    // -- difficulties --
    const diffRows = mod.difficultyOrder.map((diffKey, i) => {
      const d = mod.difficulties[diffKey];
      return {
        lesson_id: lessonId,
        difficulty_key: diffKey,
        label: d.label,
        description: d.description,
        sort_order: i,
      };
    });
    await upsert('difficulties', diffRows, 'lesson_id,difficulty_key');
    console.log(`  ✓ ${diffRows.length} difficulties`);

    let exCount = 0;
    let stepCount = 0;
    let quizCount = 0;
    let nodeCount = 0;

    for (const [diffIdx, diffKey] of mod.difficultyOrder.entries()) {
      const diff = mod.difficulties[diffKey];

      for (const [exIdx, example] of diff.examples.entries()) {
        // -- example row --
        await upsert('examples', [{
          id: example.id,
          lesson_id: lessonId,
          difficulty_key: diffKey,
          title: example.title,
          concept: example.concept ?? '',
          code: example.code ?? '',
          explanation: example.explanation ?? '',
          challenge: example.challenge ?? '',
          sort_order: exIdx,
        }], 'id');
        exCount++;

        // -- steps (delete + re-insert for clean refresh) --
        await deleteWhere('example_steps', 'example_id', example.id);
        if (example.steps?.length) {
          const stepRows = example.steps.map((s, i) => ({
            example_id: example.id,
            sort_order: i,
            line_number: s.line ?? 0,
            description: s.desc ?? '',
            action: s.action ?? null,
          }));
          await insertBatch('example_steps', stepRows);
          stepCount += stepRows.length;
        }

        // -- quiz (delete + re-insert) --
        await deleteWhere('quiz_questions', 'example_id', example.id);
        if (example.quiz?.length) {
          const questionRows = example.quiz.map((q, i) => ({
            example_id: example.id,
            sort_order: i,
            question_text: q.question,
            correct_index: q.answer,
          }));
          await insertBatch('quiz_questions', questionRows);

          // fetch back IDs to link options
          const questionIds = await getQuestionIds(example.id);
          const optionRows = [];
          for (const qRow of questionIds) {
            const q = example.quiz[qRow.sort_order];
            q.options.forEach((opt, oi) => {
              optionRows.push({
                question_id: qRow.id,
                sort_order: oi,
                option_text: opt,
              });
            });
          }
          await insertBatch('quiz_options', optionRows);
          quizCount += questionRows.length;
        }

        // -- graph nodes --
        await deleteWhere('graph_nodes', 'example_id', example.id);
        if (example.nodes?.length) {
          const nodeRows = example.nodes.map((n) => ({
            example_id: example.id,
            node_id: n.id,
            label: n.label,
          }));
          await insertBatch('graph_nodes', nodeRows);
          nodeCount += nodeRows.length;
        }

        // -- graph edges --
        await deleteWhere('graph_edges', 'example_id', example.id);
        if (example.edges?.length) {
          const edgeRows = example.edges.map((e) => ({
            example_id: example.id,
            from_node: e.from,
            to_node: e.to,
          }));
          await insertBatch('graph_edges', edgeRows);
        }
      }
    }

    console.log(`  ✓ ${exCount} examples | ${stepCount} steps | ${quizCount} quiz questions | ${nodeCount} nodes`);
  }

  console.log('\n━━━ Seed complete! ━━━\n');
}

seed().catch((err) => {
  console.error('\n✗ Seed failed:', err.message);
  process.exit(1);
});
