import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { unsplashService } from '../services/unsplashService';
import { CustomError } from '../middleware/errorHandler';

export class ImageController {
  async getDailyImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const image = await unsplashService.getDailyImage();
      
      res.json({
        success: true,
        data: {
          id: image.id,
          url: image.urls.regular,
          fullUrl: image.urls.full,
          thumbUrl: image.urls.thumb,
          author: image.user.name,
          authorUsername: image.user.username,
          description: image.description || image.alt_description,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new CustomError(error.message, 500);
      }
      throw new CustomError('Failed to fetch daily image', 500);
    }
  }

  async searchImages(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { query, page = '1', perPage = '10' } = req.query;
      
      if (!query || typeof query !== 'string') {
        throw new CustomError('Query parameter is required', 400);
      }

      const images = await unsplashService.searchImages(
        query,
        parseInt(page as string, 10),
        parseInt(perPage as string, 10)
      );

      res.json({
        success: true,
        data: images.map((image) => ({
          id: image.id,
          url: image.urls.regular,
          fullUrl: image.urls.full,
          thumbUrl: image.urls.thumb,
          author: image.user.name,
          authorUsername: image.user.username,
          description: image.description || image.alt_description,
        })),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new CustomError(error.message, 500);
      }
      throw new CustomError('Failed to search images', 500);
    }
  }
}

export const imageController = new ImageController();

