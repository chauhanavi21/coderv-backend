import { getAllLessons, getLessonDetail, getExampleById } from '../models/lessonModel.js';

export async function listLessons(req, res) {
  try {
    const lessons = await getAllLessons();
    res.json({ lessons });
  } catch (err) {
    console.error('[lessonController] listLessons:', err.message);
    res.status(500).json({ error: 'Failed to fetch lessons.' });
  }
}

export async function getLessonDetailHandler(req, res) {
  const { lessonId } = req.params;
  try {
    const lesson = await getLessonDetail(lessonId);
    res.json({ lesson });
  } catch (err) {
    console.error('[lessonController] getLessonDetail:', err.message);
    if (err.code === 'PGRST116') {
      return res.status(404).json({ error: 'Lesson not found.' });
    }
    res.status(500).json({ error: 'Failed to fetch lesson.' });
  }
}

export async function getExampleHandler(req, res) {
  const { exampleId } = req.params;
  try {
    const example = await getExampleById(exampleId);
    res.json({ example });
  } catch (err) {
    console.error('[lessonController] getExample:', err.message);
    if (err.code === 'PGRST116') {
      return res.status(404).json({ error: 'Example not found.' });
    }
    res.status(500).json({ error: 'Failed to fetch example.' });
  }
}
