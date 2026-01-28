import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { stripeService } from '../services/stripeService';
import { CustomError } from '../middleware/errorHandler';
import { getUserId } from '../middleware/auth';
import { config } from '../config/env';

export class StripeController {
  async createCheckoutSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { planId } = req.body;

      if (!planId) {
        throw new CustomError('Plan ID is required', 400);
      }

      const successUrl = `${config.apiUrl}/api/v1/stripe/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${config.apiUrl}/api/v1/stripe/cancel`;

      const session = await stripeService.createCheckoutSession(
        userId,
        planId,
        successUrl,
        cancelUrl
      );

      res.json({
        success: true,
        data: {
          sessionId: session.id,
          url: session.url,
        },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new CustomError(error.message, 500);
      }
      throw new CustomError('Failed to create checkout session', 500);
    }
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;

      if (!signature) {
        throw new CustomError('Missing stripe-signature header', 400);
      }

      // Payload should be a string for webhook verification
      const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

      await stripeService.handleWebhook(payload, signature);

      res.json({ received: true });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new CustomError(error.message, 400);
      }
      throw new CustomError('Webhook handling failed', 500);
    }
  }

  async success(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: 'Payment successful! Your subscription is now active.',
    });
  }

  async cancel(req: Request, res: Response): Promise<void> {
    res.json({
      success: false,
      message: 'Payment was canceled.',
    });
  }
}

export const stripeController = new StripeController();

