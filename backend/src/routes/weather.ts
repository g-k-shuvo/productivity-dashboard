import { Router } from 'express';
import { weatherController } from '../controllers/weatherController';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/current', (req, res, next) => {
  weatherController.getCurrentWeather(req as any, res).catch(next);
});

router.get('/forecast', (req, res, next) => {
  weatherController.getForecast(req as any, res).catch(next);
});

router.use(errorHandler);

export default router;

