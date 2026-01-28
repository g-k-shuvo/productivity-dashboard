import { Response } from 'express';
import { AuthRequest, getUserId } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { Workspace } from '../models/Workspace';
import { CustomError } from '../middleware/errorHandler';

export class WorkspaceController {
  private workspaceRepository = AppDataSource.getRepository(Workspace);

  async createWorkspace(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { name, isDefault } = req.body;

      if (!name) {
        throw new CustomError('Name is required', 400);
      }

      // If setting as default, unset other defaults
      if (isDefault) {
        await this.workspaceRepository.update(
          { userId, isDefault: true },
          { isDefault: false }
        );
      }

      const workspace = this.workspaceRepository.create({
        userId,
        name,
        isDefault: isDefault || false,
      });

      const savedWorkspace = await this.workspaceRepository.save(workspace);

      res.status(201).json({
        success: true,
        data: savedWorkspace,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create workspace', 500);
    }
  }

  async getWorkspaces(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);

      const workspaces = await this.workspaceRepository.find({
        where: { userId },
        order: { isDefault: 'DESC', createdAt: 'ASC' },
      });

      res.json({
        success: true,
        data: workspaces,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get workspaces', 500);
    }
  }

  async getWorkspace(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { workspaceId } = req.params;

      const workspace = await this.workspaceRepository.findOne({
        where: { id: workspaceId, userId },
      });

      if (!workspace) {
        throw new CustomError('Workspace not found', 404);
      }

      res.json({
        success: true,
        data: workspace,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get workspace', 500);
    }
  }

  async updateWorkspace(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { workspaceId } = req.params;
      const { name, isDefault } = req.body;

      const workspace = await this.workspaceRepository.findOne({
        where: { id: workspaceId, userId },
      });

      if (!workspace) {
        throw new CustomError('Workspace not found', 404);
      }

      // If setting as default, unset other defaults
      if (isDefault && !workspace.isDefault) {
        await this.workspaceRepository.update(
          { userId, isDefault: true },
          { isDefault: false }
        );
      }

      if (name !== undefined) {
        workspace.name = name;
      }
      if (isDefault !== undefined) {
        workspace.isDefault = isDefault;
      }

      const updatedWorkspace = await this.workspaceRepository.save(workspace);

      res.json({
        success: true,
        data: updatedWorkspace,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update workspace', 500);
    }
  }

  async deleteWorkspace(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { workspaceId } = req.params;

      const workspace = await this.workspaceRepository.findOne({
        where: { id: workspaceId, userId },
      });

      if (!workspace) {
        throw new CustomError('Workspace not found', 404);
      }

      if (workspace.isDefault) {
        throw new CustomError('Cannot delete default workspace', 400);
      }

      await this.workspaceRepository.remove(workspace);

      res.json({
        success: true,
        message: 'Workspace deleted successfully',
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to delete workspace', 500);
    }
  }
}

export const workspaceController = new WorkspaceController();

