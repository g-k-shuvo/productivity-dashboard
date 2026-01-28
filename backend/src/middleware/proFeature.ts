import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthRequest, getUserId } from './auth';
import { subscriptionService } from '../services/subscriptionService';
import { CustomError } from './errorHandler';

export const requirePro: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    
    if (!authReq.user) {
      throw new CustomError('Authentication required', 401);
    }

    const userId = getUserId(authReq);
    const hasActiveSubscription = await subscriptionService.hasActiveSubscription(userId);

    if (!hasActiveSubscription) {
      throw new CustomError(
        'Pro subscription required. Please upgrade to access this feature.',
        403
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

