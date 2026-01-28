import { Router } from 'express';
import express from 'express';
import { authenticate } from '../middleware/auth';
import { stripeController } from '../controllers/stripeController';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

// Webhook route needs raw body for signature verification
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    const signature = req.headers['stripe-signature'] as string;
    const payload = req.body.toString();
    
    // Create a new request-like object with the payload
    const webhookReq = {
      ...req,
      body: JSON.parse(payload),
      headers: {
        ...req.headers,
        'stripe-signature': signature,
      },
    } as any;
    
    stripeController.handleWebhook(webhookReq, res).catch(next);
  }
);

// Other routes require authentication
router.post('/checkout', authenticate, (req, res, next) => {
  stripeController.createCheckoutSession(req as any, res).catch(next);
});

router.get('/success', (req, res, next) => {
  stripeController.success(req, res).catch(next);
});

router.get('/cancel', (req, res, next) => {
  stripeController.cancel(req, res).catch(next);
});

router.use(errorHandler);

export default router;

