import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requirePro } from '../middleware/proFeature';
import { taskController } from '../controllers/taskController';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

// All task routes require authentication and Pro subscription
router.use(authenticate);
router.use(requirePro);

router.post('/', (req, res, next) => {
  taskController.createTask(req as any, res).catch(next);
});

router.get('/', (req, res, next) => {
  taskController.getTasks(req as any, res).catch(next);
});

router.get('/:taskId', (req, res, next) => {
  taskController.getTask(req as any, res).catch(next);
});

router.put('/:taskId', (req, res, next) => {
  taskController.updateTask(req as any, res).catch(next);
});

router.delete('/:taskId', (req, res, next) => {
  taskController.deleteTask(req as any, res).catch(next);
});

router.patch('/:taskId/toggle', (req, res, next) => {
  taskController.toggleTask(req as any, res).catch(next);
});

router.use(errorHandler);

export default router;

