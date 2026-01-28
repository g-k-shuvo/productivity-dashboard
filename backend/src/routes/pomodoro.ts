import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requirePro } from '../middleware/proFeature';
import { pomodoroController } from '../controllers/pomodoroController';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);
router.use(requirePro);

router.post('/', (req, res, next) => {
  pomodoroController.createSession(req as any, res).catch(next);
});

router.get('/', (req, res, next) => {
  pomodoroController.getSessions(req as any, res).catch(next);
});

router.patch('/:sessionId/start', (req, res, next) => {
  pomodoroController.startSession(req as any, res).catch(next);
});

router.patch('/:sessionId/complete', (req, res, next) => {
  pomodoroController.completeSession(req as any, res).catch(next);
});

router.get('/stats', (req, res, next) => {
  pomodoroController.getSessionStats(req as any, res).catch(next);
});

router.use(errorHandler);

export default router;

