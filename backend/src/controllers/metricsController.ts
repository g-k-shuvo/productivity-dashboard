import { Response } from 'express';
import { AuthRequest, getUserId } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { Metric } from '../models/Metric';
import { CustomError } from '../middleware/errorHandler';

export class MetricsController {
  private metricRepository = AppDataSource.getRepository(Metric);

  async createMetric(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { metricType, value, date, metadata, workspaceId } = req.body;

      if (!metricType || value === undefined || !date) {
        throw new CustomError('metricType, value, and date are required', 400);
      }

      const metric = this.metricRepository.create({
        userId,
        metricType,
        value,
        date: new Date(date),
        metadata,
        workspaceId,
      });

      const savedMetric = await this.metricRepository.save(metric);

      res.status(201).json({
        success: true,
        data: savedMetric,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create metric', 500);
    }
  }

  async getMetrics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { metricType, startDate, endDate, workspaceId } = req.query;

      const queryBuilder = this.metricRepository
        .createQueryBuilder('metric')
        .where('metric.userId = :userId', { userId });

      if (metricType) {
        queryBuilder.andWhere('metric.metricType = :metricType', { metricType });
      }

      if (startDate) {
        queryBuilder.andWhere('metric.date >= :startDate', { startDate });
      }

      if (endDate) {
        queryBuilder.andWhere('metric.date <= :endDate', { endDate });
      }

      if (workspaceId) {
        queryBuilder.andWhere('metric.workspaceId = :workspaceId', { workspaceId });
      }

      queryBuilder.orderBy('metric.date', 'DESC');

      const metrics = await queryBuilder.getMany();

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get metrics', 500);
    }
  }

  async getMetricStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { metricType, startDate, endDate, workspaceId } = req.query;

      const queryBuilder = this.metricRepository
        .createQueryBuilder('metric')
        .select('metric.metricType', 'type')
        .addSelect('SUM(metric.value)', 'total')
        .addSelect('AVG(metric.value)', 'average')
        .addSelect('COUNT(metric.id)', 'count')
        .addSelect('MIN(metric.value)', 'min')
        .addSelect('MAX(metric.value)', 'max')
        .where('metric.userId = :userId', { userId });

      if (metricType) {
        queryBuilder.andWhere('metric.metricType = :metricType', { metricType });
      }

      if (startDate) {
        queryBuilder.andWhere('metric.date >= :startDate', { startDate });
      }

      if (endDate) {
        queryBuilder.andWhere('metric.date <= :endDate', { endDate });
      }

      if (workspaceId) {
        queryBuilder.andWhere('metric.workspaceId = :workspaceId', { workspaceId });
      }

      queryBuilder.groupBy('metric.metricType');

      const stats = await queryBuilder.getRawMany();

      res.json({
        success: true,
        data: stats.map((stat) => ({
          type: stat.type,
          total: parseFloat(stat.total) || 0,
          average: parseFloat(stat.average) || 0,
          count: parseInt(stat.count) || 0,
          min: parseFloat(stat.min) || 0,
          max: parseFloat(stat.max) || 0,
        })),
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get metric stats', 500);
    }
  }

  async getDailyMetrics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { date, workspaceId } = req.query;

      const targetDate = date ? new Date(date as string) : new Date();
      const dateString = targetDate.toISOString().split('T')[0];

      const queryBuilder = this.metricRepository
        .createQueryBuilder('metric')
        .where('metric.userId = :userId', { userId })
        .andWhere('metric.date = :date', { date: dateString });

      if (workspaceId) {
        queryBuilder.andWhere('metric.workspaceId = :workspaceId', { workspaceId });
      }

      queryBuilder.orderBy('metric.metricType', 'ASC');

      const metrics = await queryBuilder.getMany();

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get daily metrics', 500);
    }
  }

  async deleteMetric(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { metricId } = req.params;

      const metric = await this.metricRepository.findOne({
        where: { id: metricId, userId },
      });

      if (!metric) {
        throw new CustomError('Metric not found', 404);
      }

      await this.metricRepository.remove(metric);

      res.json({
        success: true,
        message: 'Metric deleted successfully',
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to delete metric', 500);
    }
  }
}

export const metricsController = new MetricsController();

