import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requirePro } from '../middleware/proFeature';
import { integrationController } from '../controllers/integrationController';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

// All integration routes require authentication and Pro subscription
router.use(authenticate);
router.use(requirePro);

router.post('/', (req, res, next) => {
  integrationController.createIntegration(req as any, res).catch(next);
});

router.get('/', (req, res, next) => {
  integrationController.getIntegrations(req as any, res).catch(next);
});

router.get('/:integrationId', (req, res, next) => {
  integrationController.getIntegration(req as any, res).catch(next);
});

router.put('/:integrationId', (req, res, next) => {
  integrationController.updateIntegration(req as any, res).catch(next);
});

router.delete('/:integrationId', (req, res, next) => {
  integrationController.deleteIntegration(req as any, res).catch(next);
});

router.post('/:integrationId/sync', (req, res, next) => {
  integrationController.syncTasks(req as any, res).catch(next);
});

router.use(errorHandler);

export default router;

