import { AppDataSource } from '../config/database';
import { logger } from '../config/logger';
import { config } from '../config/env';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface FileUpload {
  id: string;
  userId: string;
  workspaceId?: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  metadata?: any;
  createdAt: Date;
}

export class FileStorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(
    userId: string,
    file: Express.Multer.File,
    workspaceId?: string,
    metadata?: any
  ): Promise<FileUpload> {
    try {
      const fileId = uuidv4();
      const fileExtension = path.extname(file.originalname);
      const fileName = `${fileId}${fileExtension}`;
      const userDir = path.join(this.uploadDir, userId);
      
      // Create user directory if it doesn't exist
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      const filePath = path.join(userDir, fileName);

      // Save file to disk
      fs.writeFileSync(filePath, file.buffer);

      // Save file metadata to database
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();

      await queryRunner.query(
        `INSERT INTO file_uploads 
         (id, user_id, workspace_id, file_name, file_path, file_type, file_size, mime_type, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
        [
          fileId,
          userId,
          workspaceId || null,
          file.originalname,
          filePath,
          fileExtension.substring(1), // Remove the dot
          file.size,
          file.mimetype,
          metadata ? JSON.stringify(metadata) : null,
        ]
      );

      await queryRunner.release();

      return {
        id: fileId,
        userId,
        workspaceId,
        fileName: file.originalname,
        filePath,
        fileType: fileExtension.substring(1),
        fileSize: file.size,
        mimeType: file.mimetype,
        metadata,
        createdAt: new Date(),
      };
    } catch (error) {
      logger.error('Failed to save file:', error);
      throw error;
    }
  }

  async getFile(fileId: string, userId: string): Promise<FileUpload | null> {
    try {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();

      const result = await queryRunner.query(
        `SELECT * FROM file_uploads 
         WHERE id = $1 AND user_id = $2`,
        [fileId, userId]
      );

      await queryRunner.release();

      if (result.length === 0) {
        return null;
      }

      const row = result[0];
      return {
        id: row.id,
        userId: row.user_id,
        workspaceId: row.workspace_id,
        fileName: row.file_name,
        filePath: row.file_path,
        fileType: row.file_type,
        fileSize: row.file_size,
        mimeType: row.mime_type,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        createdAt: row.created_at,
      };
    } catch (error) {
      logger.error('Failed to get file:', error);
      throw error;
    }
  }

  async getUserFiles(userId: string, workspaceId?: string): Promise<FileUpload[]> {
    try {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();

      const result = await queryRunner.query(
        `SELECT * FROM file_uploads 
         WHERE user_id = $1 ${workspaceId ? 'AND workspace_id = $2' : 'AND workspace_id IS NULL'}
         ORDER BY created_at DESC`,
        workspaceId ? [userId, workspaceId] : [userId]
      );

      await queryRunner.release();

      return result.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        workspaceId: row.workspace_id,
        fileName: row.file_name,
        filePath: row.file_path,
        fileType: row.file_type,
        fileSize: row.file_size,
        mimeType: row.mime_type,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        createdAt: row.created_at,
      }));
    } catch (error) {
      logger.error('Failed to get user files:', error);
      throw error;
    }
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    try {
      const file = await this.getFile(fileId, userId);
      if (!file) {
        throw new Error('File not found');
      }

      // Delete file from disk
      if (fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }

      // Delete from database
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();

      await queryRunner.query(
        `DELETE FROM file_uploads WHERE id = $1 AND user_id = $2`,
        [fileId, userId]
      );

      await queryRunner.release();
    } catch (error) {
      logger.error('Failed to delete file:', error);
      throw error;
    }
  }

  getFilePath(fileId: string, userId: string): Promise<string | null> {
    return this.getFile(fileId, userId).then((file) => file?.filePath || null);
  }
}

export const fileStorageService = new FileStorageService();

