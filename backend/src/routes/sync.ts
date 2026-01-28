import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requirePro } from '../middleware/proFeature';
import { syncController } from '../controllers/syncController';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

// All sync routes require authentication and Pro subscription
router.use(authenticate);
router.use(requirePro);

router.post('/', (req, res, next) => {
  syncController.syncData(req as any, res).catch(next);
});

router.get('/', (req, res, next) => {
  syncController.getAllData(req as any, res).catch(next);
});

router.get('/:dataType', (req, res, next) => {
  req.query.dataType = req.params.dataType;
  syncController.getData(req as any, res).catch(next);
});

router.delete('/:dataType', (req, res, next) => {
  req.query.dataType = req.params.dataType;
  syncController.deleteData(req as any, res).catch(next);
});

router.use(errorHandler);

export default router;

