import { Response } from 'express';
import { AuthRequest, getUserId } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { TabStash } from '../models/TabStash';
import { CustomError } from '../middleware/errorHandler';

export class TabStashController {
  private tabStashRepository = AppDataSource.getRepository(TabStash);

  async createStash(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { name, tabs, workspaceId } = req.body;

      if (!name || !tabs || !Array.isArray(tabs)) {
        throw new CustomError('Name and tabs array are required', 400);
      }

      const stash = this.tabStashRepository.create({
        userId,
        name,
        tabs,
        workspaceId,
      });

      const savedStash = await this.tabStashRepository.save(stash);

      res.status(201).json({
        success: true,
        data: savedStash,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create tab stash', 500);
    }
  }

  async getStashes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { workspaceId } = req.query;

      const queryBuilder = this.tabStashRepository
        .createQueryBuilder('stash')
        .where('stash.userId = :userId', { userId });

      if (workspaceId) {
        queryBuilder.andWhere('stash.workspaceId = :workspaceId', { workspaceId });
      }

      queryBuilder.orderBy('stash.createdAt', 'DESC');

      const stashes = await queryBuilder.getMany();

      res.json({
        success: true,
        data: stashes,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get tab stashes', 500);
    }
  }

  async getStash(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { stashId } = req.params;

      const stash = await this.tabStashRepository.findOne({
        where: { id: stashId, userId },
      });

      if (!stash) {
        throw new CustomError('Tab stash not found', 404);
      }

      res.json({
        success: true,
        data: stash,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get tab stash', 500);
    }
  }

  async updateStash(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { stashId } = req.params;
      const updates = req.body;

      const stash = await this.tabStashRepository.findOne({
        where: { id: stashId, userId },
      });

      if (!stash) {
        throw new CustomError('Tab stash not found', 404);
      }

      Object.assign(stash, updates);
      const updatedStash = await this.tabStashRepository.save(stash);

      res.json({
        success: true,
        data: updatedStash,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update tab stash', 500);
    }
  }

  async deleteStash(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { stashId } = req.params;

      const stash = await this.tabStashRepository.findOne({
        where: { id: stashId, userId },
      });

      if (!stash) {
        throw new CustomError('Tab stash not found', 404);
      }

      await this.tabStashRepository.remove(stash);

      res.json({
        success: true,
        message: 'Tab stash deleted successfully',
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to delete tab stash', 500);
    }
  }
}

export const tabstashController = new TabStashController();

