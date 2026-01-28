import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { subscriptionController } from '../controllers/subscriptionController';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

// All subscription routes require authentication
router.use(authenticate);

router.get('/', (req, res, next) => {
  subscriptionController.getSubscription(req as any, res).catch(next);
});

router.get('/check', (req, res, next) => {
  subscriptionController.checkSubscription(req as any, res).catch(next);
});

router.post('/cancel', (req, res, next) => {
  subscriptionController.cancelSubscription(req as any, res).catch(next);
});

router.use(errorHandler);

export default router;

