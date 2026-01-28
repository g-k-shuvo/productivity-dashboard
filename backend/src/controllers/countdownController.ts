import { Response } from 'express';
import { AuthRequest, getUserId } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { CountdownTimer } from '../models/CountdownTimer';
import { CustomError } from '../middleware/errorHandler';

export class CountdownController {
  private countdownRepository = AppDataSource.getRepository(CountdownTimer);

  async createCountdown(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { name, targetDate, notifyBefore, workspaceId } = req.body;

      if (!name || !targetDate) {
        throw new CustomError('Name and targetDate are required', 400);
      }

      const countdown = this.countdownRepository.create({
        userId,
        name,
        targetDate: new Date(targetDate),
        notifyBefore,
        workspaceId,
      });

      const savedCountdown = await this.countdownRepository.save(countdown);

      res.status(201).json({
        success: true,
        data: savedCountdown,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create countdown', 500);
    }
  }

  async getCountdowns(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { workspaceId } = req.query;

      const queryBuilder = this.countdownRepository
        .createQueryBuilder('countdown')
        .where('countdown.userId = :userId', { userId });

      if (workspaceId) {
        queryBuilder.andWhere('countdown.workspaceId = :workspaceId', { workspaceId });
      }

      queryBuilder.orderBy('countdown.targetDate', 'ASC');

      const countdowns = await queryBuilder.getMany();

      res.json({
        success: true,
        data: countdowns,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get countdowns', 500);
    }
  }

  async getCountdown(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { countdownId } = req.params;

      const countdown = await this.countdownRepository.findOne({
        where: { id: countdownId, userId },
      });

      if (!countdown) {
        throw new CustomError('Countdown not found', 404);
      }

      res.json({
        success: true,
        data: countdown,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get countdown', 500);
    }
  }

  async updateCountdown(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { countdownId } = req.params;
      const updates = req.body;

      const countdown = await this.countdownRepository.findOne({
        where: { id: countdownId, userId },
      });

      if (!countdown) {
        throw new CustomError('Countdown not found', 404);
      }

      if (updates.targetDate) {
        updates.targetDate = new Date(updates.targetDate);
      }

      Object.assign(countdown, updates);
      const updatedCountdown = await this.countdownRepository.save(countdown);

      res.json({
        success: true,
        data: updatedCountdown,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update countdown', 500);
    }
  }

  async deleteCountdown(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { countdownId } = req.params;

      const countdown = await this.countdownRepository.findOne({
        where: { id: countdownId, userId },
      });

      if (!countdown) {
        throw new CustomError('Countdown not found', 404);
      }

      await this.countdownRepository.remove(countdown);

      res.json({
        success: true,
        message: 'Countdown deleted successfully',
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to delete countdown', 500);
    }
  }
}

export const countdownController = new CountdownController();

