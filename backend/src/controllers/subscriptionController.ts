import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { subscriptionService } from '../services/subscriptionService';
import { CustomError } from '../middleware/errorHandler';
import { getUserId } from '../middleware/auth';

export class SubscriptionController {
  async getSubscription(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const subscription = await subscriptionService.getActiveSubscription(userId);

      if (!subscription) {
        res.json({
          success: true,
          data: null,
        });
        return;
      }

      res.json({
        success: true,
        data: subscription,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get subscription', 500);
    }
  }

  async checkSubscription(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const hasActive = await subscriptionService.hasActiveSubscription(userId);

      res.json({
        success: true,
        data: {
          hasActiveSubscription: hasActive,
        },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to check subscription', 500);
    }
  }

  async cancelSubscription(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const subscription = await subscriptionService.getActiveSubscription(userId);

      if (!subscription) {
        throw new CustomError('No active subscription found', 404);
      }

      const { cancelImmediately = false } = req.body;
      const canceled = await subscriptionService.cancelSubscription(
        subscription.id,
        !cancelImmediately
      );

      res.json({
        success: true,
        data: canceled,
        message: cancelImmediately
          ? 'Subscription canceled immediately'
          : 'Subscription will be canceled at the end of the billing period',
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to cancel subscription', 500);
    }
  }
}

export const subscriptionController = new SubscriptionController();

