import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requirePro } from '../middleware/proFeature';
import { countdownController } from '../controllers/countdownController';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);
router.use(requirePro);

router.post('/', (req, res, next) => {
  countdownController.createCountdown(req as any, res).catch(next);
});

router.get('/', (req, res, next) => {
  countdownController.getCountdowns(req as any, res).catch(next);
});

router.get('/:countdownId', (req, res, next) => {
  countdownController.getCountdown(req as any, res).catch(next);
});

router.put('/:countdownId', (req, res, next) => {
  countdownController.updateCountdown(req as any, res).catch(next);
});

router.delete('/:countdownId', (req, res, next) => {
  countdownController.deleteCountdown(req as any, res).catch(next);
});

router.use(errorHandler);

export default router;

