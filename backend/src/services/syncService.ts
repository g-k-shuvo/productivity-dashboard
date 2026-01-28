import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { logger } from '../config/logger';

interface SyncData {
  dataType: string;
  data: any;
  version: number;
  workspaceId?: string;
}

export class SyncService {
  private getSyncDataRepository() {
    // Using raw query since we don't have the model yet
    return AppDataSource.getRepository('sync_data' as any);
  }

  async syncData(
    userId: string,
    dataType: string,
    data: any,
    version: number,
    workspaceId?: string
  ): Promise<SyncData> {
    try {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();

      // Check for existing data
      const existing = await queryRunner.query(
        `SELECT * FROM sync_data 
         WHERE user_id = $1 AND data_type = $2 ${workspaceId ? 'AND workspace_id = $3' : 'AND workspace_id IS NULL'}
         ORDER BY version DESC LIMIT 1`,
        workspaceId ? [userId, dataType, workspaceId] : [userId, dataType]
      );

      let newVersion = version;
      if (existing.length > 0 && existing[0].version >= version) {
        // Conflict: server version is newer or equal
        newVersion = existing[0].version + 1;
        logger.warn(`Version conflict for ${dataType}, incrementing version to ${newVersion}`);
      }

      // Insert or update sync data
      if (existing.length > 0) {
        await queryRunner.query(
          `UPDATE sync_data 
           SET data = $1, version = $2, updated_at = NOW()
           WHERE user_id = $3 AND data_type = $4 ${workspaceId ? 'AND workspace_id = $5' : 'AND workspace_id IS NULL'}`,
          workspaceId
            ? [JSON.stringify(data), newVersion, userId, dataType, workspaceId]
            : [JSON.stringify(data), newVersion, userId, dataType]
        );
      } else {
        await queryRunner.query(
          `INSERT INTO sync_data (id, user_id, workspace_id, data_type, data, version, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())`,
          [userId, workspaceId || null, dataType, JSON.stringify(data), newVersion]
        );
      }

      await queryRunner.release();

      return {
        dataType,
        data,
        version: newVersion,
        workspaceId,
      };
    } catch (error) {
      logger.error('Failed to sync data:', error);
      throw error;
    }
  }

  async getData(userId: string, dataType: string, workspaceId?: string): Promise<SyncData | null> {
    try {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();

      const result = await queryRunner.query(
        `SELECT * FROM sync_data 
         WHERE user_id = $1 AND data_type = $2 ${workspaceId ? 'AND workspace_id = $3' : 'AND workspace_id IS NULL'}
         ORDER BY version DESC LIMIT 1`,
        workspaceId ? [userId, dataType, workspaceId] : [userId, dataType]
      );

      await queryRunner.release();

      if (result.length === 0) {
        return null;
      }

      return {
        dataType: result[0].data_type,
        data: typeof result[0].data === 'string' ? JSON.parse(result[0].data) : result[0].data,
        version: result[0].version,
        workspaceId: result[0].workspace_id,
      };
    } catch (error) {
      logger.error('Failed to get sync data:', error);
      throw error;
    }
  }

  async getAllData(userId: string, workspaceId?: string): Promise<SyncData[]> {
    try {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();

      const result = await queryRunner.query(
        `SELECT * FROM sync_data 
         WHERE user_id = $1 ${workspaceId ? 'AND workspace_id = $2' : 'AND workspace_id IS NULL'}
         ORDER BY data_type, version DESC`,
        workspaceId ? [userId, workspaceId] : [userId]
      );

      await queryRunner.release();

      // Group by data_type and get latest version of each
      const dataMap = new Map<string, SyncData>();
      result.forEach((row: any) => {
        const key = row.data_type;
        if (!dataMap.has(key) || row.version > dataMap.get(key)!.version) {
          dataMap.set(key, {
            dataType: row.data_type,
            data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
            version: row.version,
            workspaceId: row.workspace_id,
          });
        }
      });

      return Array.from(dataMap.values());
    } catch (error) {
      logger.error('Failed to get all sync data:', error);
      throw error;
    }
  }

  async deleteData(userId: string, dataType: string, workspaceId?: string): Promise<void> {
    try {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();

      await queryRunner.query(
        `DELETE FROM sync_data 
         WHERE user_id = $1 AND data_type = $2 ${workspaceId ? 'AND workspace_id = $3' : 'AND workspace_id IS NULL'}`,
        workspaceId ? [userId, dataType, workspaceId] : [userId, dataType]
      );

      await queryRunner.release();
    } catch (error) {
      logger.error('Failed to delete sync data:', error);
      throw error;
    }
  }
}

export const syncService = new SyncService();

