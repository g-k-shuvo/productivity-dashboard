import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { logger } from '../config/logger';

export class SubscriptionService {
  private subscriptionRepository = AppDataSource.getRepository(Subscription);
  private userRepository = AppDataSource.getRepository(User);

  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: {
          userId,
          status: 'active',
        },
        order: {
          createdAt: 'DESC',
        },
      });

      // Check if subscription is still valid (not expired)
      if (subscription && subscription.currentPeriodEnd) {
        if (subscription.currentPeriodEnd < new Date()) {
          // Subscription expired, update status
          subscription.status = 'expired';
          await this.subscriptionRepository.save(subscription);
          return null;
        }
      }

      return subscription;
    } catch (error) {
      logger.error('Failed to get active subscription:', error);
      throw error;
    }
  }

  async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getActiveSubscription(userId);
    return subscription !== null;
  }

  async createSubscription(
    userId: string,
    plan: string,
    stripeSubscriptionId: string,
    stripeCustomerId: string,
    currentPeriodStart: Date,
    currentPeriodEnd: Date
  ): Promise<Subscription> {
    try {
      // Cancel any existing active subscriptions
      await this.subscriptionRepository.update(
        { userId, status: 'active' },
        { status: 'canceled' }
      );

      const subscription = this.subscriptionRepository.create({
        userId,
        plan,
        stripeSubscriptionId,
        stripeCustomerId,
        status: 'active',
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
      });

      return await this.subscriptionRepository.save(subscription);
    } catch (error) {
      logger.error('Failed to create subscription:', error);
      throw error;
    }
  }

  async updateSubscription(
    subscriptionId: string,
    updates: Partial<Subscription>
  ): Promise<Subscription> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { id: subscriptionId },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      Object.assign(subscription, updates);
      return await this.subscriptionRepository.save(subscription);
    } catch (error) {
      logger.error('Failed to update subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<Subscription> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { id: subscriptionId },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      subscription.cancelAtPeriodEnd = cancelAtPeriodEnd;
      if (!cancelAtPeriodEnd) {
        subscription.status = 'canceled';
      }

      return await this.subscriptionRepository.save(subscription);
    } catch (error) {
      logger.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
    try {
      return await this.subscriptionRepository.findOne({
        where: { stripeSubscriptionId },
      });
    } catch (error) {
      logger.error('Failed to get subscription by Stripe ID:', error);
      throw error;
    }
  }
}

export const subscriptionService = new SubscriptionService();

