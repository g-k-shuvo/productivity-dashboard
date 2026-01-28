import { Response } from 'express';
import { AuthRequest, getUserId } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { Integration } from '../models/Integration';
import { CustomError } from '../middleware/errorHandler';
import { logger } from '../config/logger';

export class IntegrationController {
  private integrationRepository = AppDataSource.getRepository(Integration);

  async createIntegration(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { service, accessToken, refreshToken, tokenExpiresAt, metadata } = req.body;

      if (!service || !accessToken) {
        throw new CustomError('Service and accessToken are required', 400);
      }

      // Check if integration already exists
      const existing = await this.integrationRepository.findOne({
        where: { userId, service },
      });

      if (existing) {
        // Update existing integration
        existing.accessToken = accessToken;
        existing.refreshToken = refreshToken;
        existing.tokenExpiresAt = tokenExpiresAt ? new Date(tokenExpiresAt) : undefined;
        existing.metadata = metadata;

        const updated = await this.integrationRepository.save(existing);
        res.json({
          success: true,
          data: updated,
        });
        return;
      }

      const integration = this.integrationRepository.create({
        userId,
        service,
        accessToken,
        refreshToken,
        tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : undefined,
        metadata,
      });

      const savedIntegration = await this.integrationRepository.save(integration);

      res.status(201).json({
        success: true,
        data: savedIntegration,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create integration', 500);
    }
  }

  async getIntegrations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);

      const integrations = await this.integrationRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      // Don't expose access tokens in list
      const safeIntegrations = integrations.map((integration) => ({
        id: integration.id,
        service: integration.service,
        tokenExpiresAt: integration.tokenExpiresAt,
        metadata: integration.metadata,
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt,
      }));

      res.json({
        success: true,
        data: safeIntegrations,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get integrations', 500);
    }
  }

  async getIntegration(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { integrationId } = req.params;

      const integration = await this.integrationRepository.findOne({
        where: { id: integrationId, userId },
      });

      if (!integration) {
        throw new CustomError('Integration not found', 404);
      }

      // Don't expose full access token
      const safeIntegration = {
        id: integration.id,
        service: integration.service,
        hasAccessToken: !!integration.accessToken,
        hasRefreshToken: !!integration.refreshToken,
        tokenExpiresAt: integration.tokenExpiresAt,
        metadata: integration.metadata,
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt,
      };

      res.json({
        success: true,
        data: safeIntegration,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get integration', 500);
    }
  }

  async updateIntegration(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { integrationId } = req.params;
      const updates = req.body;

      const integration = await this.integrationRepository.findOne({
        where: { id: integrationId, userId },
      });

      if (!integration) {
        throw new CustomError('Integration not found', 404);
      }

      if (updates.tokenExpiresAt) {
        updates.tokenExpiresAt = new Date(updates.tokenExpiresAt);
      }

      Object.assign(integration, updates);
      const updatedIntegration = await this.integrationRepository.save(integration);

      res.json({
        success: true,
        data: updatedIntegration,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update integration', 500);
    }
  }

  async deleteIntegration(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { integrationId } = req.params;

      const integration = await this.integrationRepository.findOne({
        where: { id: integrationId, userId },
      });

      if (!integration) {
        throw new CustomError('Integration not found', 404);
      }

      await this.integrationRepository.remove(integration);

      res.json({
        success: true,
        message: 'Integration deleted successfully',
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to delete integration', 500);
    }
  }

  async syncTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { integrationId } = req.params;

      const integration = await this.integrationRepository.findOne({
        where: { id: integrationId, userId },
      });

      if (!integration) {
        throw new CustomError('Integration not found', 404);
      }

      // This is a placeholder - actual sync logic would depend on the service
      // (Todoist, Asana, ClickUp, etc.)
      logger.info(`Syncing tasks for integration: ${integration.service}`);

      // TODO: Implement actual sync logic based on service type
      res.json({
        success: true,
        message: `Sync initiated for ${integration.service}`,
        data: {
          synced: 0, // Placeholder
        },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to sync tasks', 500);
    }
  }
}

export const integrationController = new IntegrationController();

