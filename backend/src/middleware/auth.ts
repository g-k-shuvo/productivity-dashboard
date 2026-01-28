import { Request, Response, NextFunction, RequestHandler } from 'express';
import { authService } from '../services/authService';
import { CustomError } from './errorHandler';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  } | User;
}

export const authenticate: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const authHeader = authReq.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError('Authentication required', 401);
    }

    const token = authHeader.substring(7);
    const payload = await authService.verifyAccessToken(token);

    if (!payload) {
      throw new CustomError('Invalid or expired token', 401);
    }

    authReq.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};

// Helper function to get user ID from either token payload or User object
export function getUserId(req: AuthRequest): string {
  if (!req.user) {
    throw new CustomError('User not authenticated', 401);
  }
  // Check if it's a User object (has 'id' property)
  if ('id' in req.user) {
    return req.user.id;
  }
  // Otherwise it's a token payload (has 'userId' property)
  return req.user.userId;
}

// requirePro is now in proFeature.ts middleware

