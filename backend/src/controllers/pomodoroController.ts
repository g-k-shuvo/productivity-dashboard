import { Response } from 'express';
import { AuthRequest, getUserId } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { PomodoroSession } from '../models/PomodoroSession';
import { CustomError } from '../middleware/errorHandler';

export class PomodoroController {
  private pomodoroRepository = AppDataSource.getRepository(PomodoroSession);

  async createSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { duration, type, taskId, workspaceId } = req.body;

      if (!duration || !type) {
        throw new CustomError('Duration and type are required', 400);
      }

      const session = this.pomodoroRepository.create({
        userId,
        duration,
        type,
        taskId,
        workspaceId,
        completed: false,
      });

      const savedSession = await this.pomodoroRepository.save(session);

      res.status(201).json({
        success: true,
        data: savedSession,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create Pomodoro session', 500);
    }
  }

  async getSessions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { workspaceId, taskId, completed, startDate, endDate } = req.query;

      const queryBuilder = this.pomodoroRepository
        .createQueryBuilder('session')
        .where('session.userId = :userId', { userId });

      if (workspaceId) {
        queryBuilder.andWhere('session.workspaceId = :workspaceId', { workspaceId });
      }

      if (taskId) {
        queryBuilder.andWhere('session.taskId = :taskId', { taskId });
      }

      if (completed !== undefined) {
        queryBuilder.andWhere('session.completed = :completed', { completed: completed === 'true' });
      }

      if (startDate) {
        queryBuilder.andWhere('session.createdAt >= :startDate', { startDate });
      }

      if (endDate) {
        queryBuilder.andWhere('session.createdAt <= :endDate', { endDate });
      }

      queryBuilder.orderBy('session.createdAt', 'DESC');

      const sessions = await queryBuilder.getMany();

      res.json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get Pomodoro sessions', 500);
    }
  }

  async startSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { sessionId } = req.params;

      const session = await this.pomodoroRepository.findOne({
        where: { id: sessionId, userId },
      });

      if (!session) {
        throw new CustomError('Session not found', 404);
      }

      session.startedAt = new Date();
      const updatedSession = await this.pomodoroRepository.save(session);

      res.json({
        success: true,
        data: updatedSession,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to start session', 500);
    }
  }

  async completeSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { sessionId } = req.params;

      const session = await this.pomodoroRepository.findOne({
        where: { id: sessionId, userId },
      });

      if (!session) {
        throw new CustomError('Session not found', 404);
      }

      session.completed = true;
      session.completedAt = new Date();
      const updatedSession = await this.pomodoroRepository.save(session);

      res.json({
        success: true,
        data: updatedSession,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to complete session', 500);
    }
  }

  async getSessionStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { startDate, endDate, workspaceId } = req.query;

      const queryBuilder = this.pomodoroRepository
        .createQueryBuilder('session')
        .select('session.type', 'type')
        .addSelect('COUNT(session.id)', 'count')
        .addSelect('SUM(session.duration)', 'totalMinutes')
        .where('session.userId = :userId', { userId })
        .andWhere('session.completed = :completed', { completed: true });

      if (startDate) {
        queryBuilder.andWhere('session.createdAt >= :startDate', { startDate });
      }

      if (endDate) {
        queryBuilder.andWhere('session.createdAt <= :endDate', { endDate });
      }

      if (workspaceId) {
        queryBuilder.andWhere('session.workspaceId = :workspaceId', { workspaceId });
      }

      queryBuilder.groupBy('session.type');

      const stats = await queryBuilder.getRawMany();

      res.json({
        success: true,
        data: stats.map((stat) => ({
          type: stat.type,
          count: parseInt(stat.count) || 0,
          totalMinutes: parseInt(stat.totalMinutes) || 0,
        })),
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get session stats', 500);
    }
  }
}

export const pomodoroController = new PomodoroController();

