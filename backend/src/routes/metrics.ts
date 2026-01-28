import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requirePro } from '../middleware/proFeature';
import { metricsController } from '../controllers/metricsController';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

// All metrics routes require authentication and Pro subscription
router.use(authenticate);
router.use(requirePro);

router.post('/', (req, res, next) => {
  metricsController.createMetric(req as any, res).catch(next);
});

router.get('/', (req, res, next) => {
  metricsController.getMetrics(req as any, res).catch(next);
});

router.get('/stats', (req, res, next) => {
  metricsController.getMetricStats(req as any, res).catch(next);
});

router.get('/daily', (req, res, next) => {
  metricsController.getDailyMetrics(req as any, res).catch(next);
});

router.delete('/:metricId', (req, res, next) => {
  metricsController.deleteMetric(req as any, res).catch(next);
});

router.use(errorHandler);

export default router;

