import axios from 'axios';
import { config } from '../config/env';
import { logger } from '../config/logger';

export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
  };
  description: string | null;
  alt_description: string | null;
}

export class UnsplashService {
  private baseUrl = 'https://api.unsplash.com';
  private accessKey = config.external.unsplash.accessKey;

  async getDailyImage(): Promise<UnsplashImage> {
    try {
      if (!this.accessKey) {
        throw new Error('Unsplash API key not configured');
      }

      // Get a random nature/landscape image
      const response = await axios.get(`${this.baseUrl}/photos/random`, {
        params: {
          query: 'nature landscape',
          orientation: 'landscape',
          content_filter: 'high',
        },
        headers: {
          Authorization: `Client-ID ${this.accessKey}`,
        },
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch Unsplash image:', error);
      throw new Error('Failed to fetch background image');
    }
  }

  async searchImages(query: string, page: number = 1, perPage: number = 10): Promise<UnsplashImage[]> {
    try {
      if (!this.accessKey) {
        throw new Error('Unsplash API key not configured');
      }

      const response = await axios.get(`${this.baseUrl}/search/photos`, {
        params: {
          query,
          page,
          per_page: perPage,
          orientation: 'landscape',
        },
        headers: {
          Authorization: `Client-ID ${this.accessKey}`,
        },
      });

      return response.data.results;
    } catch (error) {
      logger.error('Failed to search Unsplash images:', error);
      throw new Error('Failed to search images');
    }
  }
}

export const unsplashService = new UnsplashService();

