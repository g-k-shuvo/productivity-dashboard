import { Response } from 'express';
import multer from 'multer';
import { AuthRequest, getUserId } from '../middleware/auth';
import { fileStorageService } from '../services/fileStorageService';
import { CustomError } from '../middleware/errorHandler';
import * as fs from 'fs';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export const uploadMiddleware = upload.single('file');

export class FileController {
  async uploadFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        throw new CustomError('No file uploaded', 400);
      }

      const userId = getUserId(req);
      const { workspaceId, metadata } = req.body;

      const fileUpload = await fileStorageService.saveFile(
        userId,
        req.file,
        workspaceId,
        metadata ? JSON.parse(metadata) : undefined
      );

      res.json({
        success: true,
        data: {
          id: fileUpload.id,
          fileName: fileUpload.fileName,
          fileType: fileUpload.fileType,
          fileSize: fileUpload.fileSize,
          mimeType: fileUpload.mimeType,
          createdAt: fileUpload.createdAt,
        },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new CustomError(error.message, 400);
      }
      throw new CustomError('Failed to upload file', 500);
    }
  }

  async getFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { fileId } = req.params;

      const file = await fileStorageService.getFile(fileId, userId);

      if (!file) {
        throw new CustomError('File not found', 404);
      }

      if (!fs.existsSync(file.filePath)) {
        throw new CustomError('File not found on disk', 404);
      }

      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${file.fileName}"`);
      
      const fileStream = fs.createReadStream(file.filePath);
      fileStream.pipe(res);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get file', 500);
    }
  }

  async getUserFiles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { workspaceId } = req.query;

      const files = await fileStorageService.getUserFiles(
        userId,
        workspaceId as string | undefined
      );

      res.json({
        success: true,
        data: files.map((file) => ({
          id: file.id,
          fileName: file.fileName,
          fileType: file.fileType,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
          createdAt: file.createdAt,
        })),
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get user files', 500);
    }
  }

  async deleteFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { fileId } = req.params;

      await fileStorageService.deleteFile(fileId, userId);

      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new CustomError(error.message, 404);
      }
      throw new CustomError('Failed to delete file', 500);
    }
  }
}

export const fileController = new FileController();

