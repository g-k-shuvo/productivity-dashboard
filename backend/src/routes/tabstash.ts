import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requirePro } from '../middleware/proFeature';
import { tabstashController } from '../controllers/tabstashController';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);
router.use(requirePro);

router.post('/', (req, res, next) => {
  tabstashController.createStash(req as any, res).catch(next);
});

router.get('/', (req, res, next) => {
  tabstashController.getStashes(req as any, res).catch(next);
});

router.get('/:stashId', (req, res, next) => {
  tabstashController.getStash(req as any, res).catch(next);
});

router.put('/:stashId', (req, res, next) => {
  tabstashController.updateStash(req as any, res).catch(next);
});

router.delete('/:stashId', (req, res, next) => {
  tabstashController.deleteStash(req as any, res).catch(next);
});

router.use(errorHandler);

export default router;

