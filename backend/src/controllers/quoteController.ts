import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { quotesService } from '../services/quotesService';
import { CustomError } from '../middleware/errorHandler';

export class QuoteController {
  async getDailyQuote(req: AuthRequest, res: Response): Promise<void> {
    try {
      const quote = quotesService.getDailyQuote();

      res.json({
        success: true,
        data: quote,
      });
    } catch (error) {
      throw new CustomError('Failed to fetch daily quote', 500);
    }
  }

  async getRandomQuote(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { category } = req.query;
      
      let quote;
      if (category && typeof category === 'string') {
        quote = quotesService.getQuoteByCategory(category);
      } else {
        quote = quotesService.getRandomQuote();
      }

      res.json({
        success: true,
        data: quote,
      });
    } catch (error) {
      throw new CustomError('Failed to fetch quote', 500);
    }
  }
}

export const quoteController = new QuoteController();

