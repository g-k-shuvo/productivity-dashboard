import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { authService } from '../services/authService';
import { CustomError } from '../middleware/errorHandler';
import { User } from '../models/User';

export class AuthController {
  async googleCallback(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Passport sets req.user to the User object
      const user = req.user as User;

      if (!user || !('id' in user)) {
        throw new CustomError('User not found after authentication', 401);
      }

      // Generate JWT tokens
      const tokenPair = await authService.generateTokenPair(user);

      // Redirect to frontend with tokens in query params or send JSON
      // For Chrome extension, we'll send JSON response
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            provider: user.provider,
          },
          tokens: tokenPair,
        },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Authentication failed', 500);
    }
  }

  async githubCallback(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Passport sets req.user to the User object
      const user = req.user as User;

      if (!user || !('id' in user)) {
        throw new CustomError('User not found after authentication', 401);
      }

      // Generate JWT tokens
      const tokenPair = await authService.generateTokenPair(user);

      // Redirect to frontend with tokens in query params or send JSON
      // For Chrome extension, we'll send JSON response
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatarUrl: user.avatarUrl,
            provider: user.provider,
          },
          tokens: tokenPair,
        },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Authentication failed', 500);
    }
  }

  async refreshToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new CustomError('Refresh token required', 400);
      }

      const payload = await authService.verifyRefreshToken(refreshToken);

      if (!payload) {
        throw new CustomError('Invalid or expired refresh token', 401);
      }

      // Get user and generate new token pair
      const { AppDataSource } = await import('../config/database');
      const { User } = await import('../models/User');
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: payload.userId } });

      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Revoke old refresh token
      await authService.revokeRefreshToken(refreshToken);

      // Generate new token pair
      const tokenPair = await authService.generateTokenPair(user);

      res.json({
        success: true,
        data: tokenPair,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Token refresh failed', 500);
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await authService.revokeRefreshToken(refreshToken);
      }

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      throw new CustomError('Logout failed', 500);
    }
  }
}

export const authController = new AuthController();

