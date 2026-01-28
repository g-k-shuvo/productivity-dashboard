import Stripe from 'stripe';
import { config } from '../config/env';
import { logger } from '../config/logger';
import { subscriptionService } from './subscriptionService';

export class StripeService {
  private stripe: Stripe;

  constructor() {
    if (!config.stripe.secretKey) {
      logger.warn('Stripe secret key not configured');
      this.stripe = null as any;
    } else {
      this.stripe = new Stripe(config.stripe.secretKey, {
        apiVersion: '2023-08-16',
      });
    }
  }

  async createCheckoutSession(
    userId: string,
    planId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not configured');
      }

      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: planId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: userId,
        metadata: {
          userId,
        },
      });

      return session;
    } catch (error) {
      logger.error('Failed to create checkout session:', error);
      throw error;
    }
  }

  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not configured');
      }

      const customer = await this.stripe.customers.create({
        email,
        name,
      });

      return customer;
    } catch (error) {
      logger.error('Failed to create customer:', error);
      throw error;
    }
  }

  async getSubscription(stripeSubscriptionId: string): Promise<Stripe.Subscription> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not configured');
      }

      return await this.stripe.subscriptions.retrieve(stripeSubscriptionId);
    } catch (error) {
      logger.error('Failed to get subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(stripeSubscriptionId: string): Promise<Stripe.Subscription> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not configured');
      }

      return await this.stripe.subscriptions.cancel(stripeSubscriptionId);
    } catch (error) {
      logger.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  async handleWebhook(payload: string, signature: string): Promise<void> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not configured');
      }

      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        config.stripe.webhookSecret
      );

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          logger.info(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      logger.error('Webhook error:', error);
      throw error;
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId;
    if (!userId) {
      logger.warn('Checkout session missing userId metadata');
      return;
    }

    if (session.mode === 'subscription' && session.subscription) {
      const subscription = await this.getSubscription(session.subscription as string);
      await this.handleSubscriptionUpdated(subscription);
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      logger.warn('Subscription missing userId metadata');
      return;
    }

    await subscriptionService.createSubscription(
      userId,
      subscription.items.data[0]?.price.id || 'pro',
      subscription.id,
      subscription.customer as string,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000)
    );

    logger.info(`Subscription updated for user: ${userId}`);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const dbSubscription = await subscriptionService.getSubscriptionByStripeId(subscription.id);
    if (dbSubscription) {
      await subscriptionService.updateSubscription(dbSubscription.id, {
        status: 'canceled',
      });
      logger.info(`Subscription canceled: ${subscription.id}`);
    }
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    if (invoice.subscription) {
      const subscription = await this.getSubscription(invoice.subscription as string);
      await this.handleSubscriptionUpdated(subscription);
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    if (invoice.subscription) {
      const dbSubscription = await subscriptionService.getSubscriptionByStripeId(
        invoice.subscription as string
      );
      if (dbSubscription) {
        await subscriptionService.updateSubscription(dbSubscription.id, {
          status: 'past_due',
        });
        logger.warn(`Payment failed for subscription: ${invoice.subscription}`);
      }
    }
  }
}

export const stripeService = new StripeService();

