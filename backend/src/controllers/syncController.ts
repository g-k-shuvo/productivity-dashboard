import { Response } from 'express';
import { AuthRequest, getUserId } from '../middleware/auth';
import { syncService } from '../services/syncService';
import { CustomError } from '../middleware/errorHandler';

export class SyncController {
  async syncData(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { dataType, data, version, workspaceId } = req.body;

      if (!dataType || data === undefined || version === undefined) {
        throw new CustomError('dataType, data, and version are required', 400);
      }

      const synced = await syncService.syncData(userId, dataType, data, version, workspaceId);

      res.json({
        success: true,
        data: synced,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to sync data', 500);
    }
  }

  async getData(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { dataType, workspaceId } = req.query;

      if (!dataType || typeof dataType !== 'string') {
        throw new CustomError('dataType parameter is required', 400);
      }

      const syncData = await syncService.getData(
        userId,
        dataType,
        workspaceId as string | undefined
      );

      res.json({
        success: true,
        data: syncData,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get sync data', 500);
    }
  }

  async getAllData(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { workspaceId } = req.query;

      const allData = await syncService.getAllData(userId, workspaceId as string | undefined);

      res.json({
        success: true,
        data: allData,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get all sync data', 500);
    }
  }

  async deleteData(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { dataType, workspaceId } = req.query;

      if (!dataType || typeof dataType !== 'string') {
        throw new CustomError('dataType parameter is required', 400);
      }

      await syncService.deleteData(userId, dataType, workspaceId as string | undefined);

      res.json({
        success: true,
        message: 'Data deleted successfully',
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to delete sync data', 500);
    }
  }
}

export const syncController = new SyncController();

