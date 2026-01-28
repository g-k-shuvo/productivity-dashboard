import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requirePro } from '../middleware/proFeature';
import { fileController, uploadMiddleware } from '../controllers/fileController';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

// All file routes require authentication and Pro subscription
router.use(authenticate);
router.use(requirePro);

router.post('/upload', uploadMiddleware, (req, res, next) => {
  fileController.uploadFile(req as any, res).catch(next);
});

router.get('/', (req, res, next) => {
  fileController.getUserFiles(req as any, res).catch(next);
});

router.get('/:fileId', (req, res, next) => {
  fileController.getFile(req as any, res).catch(next);
});

router.delete('/:fileId', (req, res, next) => {
  fileController.deleteFile(req as any, res).catch(next);
});

router.use(errorHandler);

export default router;

