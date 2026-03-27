import { Router } from 'express';
import { listLessons, getLessonDetailHandler } from '../controllers/lessonController.js';
import { getExampleHandler } from '../controllers/lessonController.js';

const router = Router();

// No auth required — lesson content is public within the app
router.get('/', listLessons);
router.get('/:lessonId', getLessonDetailHandler);

export const exampleRouter = Router();
exampleRouter.get('/:exampleId', getExampleHandler);

export default router;
