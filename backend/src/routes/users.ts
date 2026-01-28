import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { userController } from '../controllers/userController';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/me', (req, res, next) => {
  userController.getCurrentUser(req as any, res).catch(next);
});

router.put('/me', (req, res, next) => {
  userController.updateUser(req as any, res).catch(next);
});

router.use(errorHandler);

export default router;

