import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requirePro } from '../middleware/proFeature';
import { habitController } from '../controllers/habitController';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

// All habit routes require authentication and Pro subscription
router.use(authenticate);
router.use(requirePro);

router.post('/', (req, res, next) => {
  habitController.createHabit(req as any, res).catch(next);
});

router.get('/', (req, res, next) => {
  habitController.getHabits(req as any, res).catch(next);
});

router.get('/:habitId', (req, res, next) => {
  habitController.getHabit(req as any, res).catch(next);
});

router.put('/:habitId', (req, res, next) => {
  habitController.updateHabit(req as any, res).catch(next);
});

router.delete('/:habitId', (req, res, next) => {
  habitController.deleteHabit(req as any, res).catch(next);
});

router.post('/:habitId/checkin', (req, res, next) => {
  habitController.checkInHabit(req as any, res).catch(next);
});

router.get('/:habitId/entries', (req, res, next) => {
  habitController.getHabitEntries(req as any, res).catch(next);
});

router.get('/:habitId/streak', (req, res, next) => {
  habitController.getHabitStreak(req as any, res).catch(next);
});

router.use(errorHandler);

export default router;

