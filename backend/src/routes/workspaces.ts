import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requirePro } from '../middleware/proFeature';
import { workspaceController } from '../controllers/workspaceController';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

// All workspace routes require authentication and Pro subscription
router.use(authenticate);
router.use(requirePro);

router.post('/', (req, res, next) => {
  workspaceController.createWorkspace(req as any, res).catch(next);
});

router.get('/', (req, res, next) => {
  workspaceController.getWorkspaces(req as any, res).catch(next);
});

router.get('/:workspaceId', (req, res, next) => {
  workspaceController.getWorkspace(req as any, res).catch(next);
});

router.put('/:workspaceId', (req, res, next) => {
  workspaceController.updateWorkspace(req as any, res).catch(next);
});

router.delete('/:workspaceId', (req, res, next) => {
  workspaceController.deleteWorkspace(req as any, res).catch(next);
});

router.use(errorHandler);

export default router;

