import { Router } from 'express';
import { imageController } from '../controllers/imageController';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/daily', (req, res, next) => {
  imageController.getDailyImage(req as any, res).catch(next);
});

router.get('/search', (req, res, next) => {
  imageController.searchImages(req as any, res).catch(next);
});

router.use(errorHandler);

export default router;

