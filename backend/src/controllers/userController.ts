import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { CustomError } from '../middleware/errorHandler';

// Helper function to get user ID from either token payload or User object
function getUserId(req: AuthRequest): string {
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

export class UserController {
  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: userId },
        select: ['id', 'email', 'name', 'avatarUrl', 'provider', 'createdAt', 'updatedAt'],
      });

      if (!user) {
        throw new CustomError('User not found', 404);
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get user', 500);
    }
  }

  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);

      const { name, avatarUrl } = req.body;
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new CustomError('User not found', 404);
      }

      if (name !== undefined) {
        user.name = name;
      }
      if (avatarUrl !== undefined) {
        user.avatarUrl = avatarUrl;
      }

      await userRepository.save(user);

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          provider: user.provider,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update user', 500);
    }
  }
}

export const userController = new UserController();

