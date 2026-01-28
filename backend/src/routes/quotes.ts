import { Router } from 'express';
import { quoteController } from '../controllers/quoteController';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/daily', (req, res, next) => {
  quoteController.getDailyQuote(req as any, res).catch(next);
});

router.get('/random', (req, res, next) => {
  quoteController.getRandomQuote(req as any, res).catch(next);
});

router.use(errorHandler);

export default router;

