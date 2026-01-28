import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { weatherService } from '../services/weatherService';
import { CustomError } from '../middleware/errorHandler';

export class WeatherController {
  async getCurrentWeather(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { lat, lon, city, units = 'metric' } = req.query;

      let weather;
      if (city && typeof city === 'string') {
        weather = await weatherService.getWeatherByCity(city, units as 'metric' | 'imperial');
      } else if (lat && lon) {
        const latitude = parseFloat(lat as string);
        const longitude = parseFloat(lon as string);
        
        if (isNaN(latitude) || isNaN(longitude)) {
          throw new CustomError('Invalid latitude or longitude', 400);
        }

        weather = await weatherService.getCurrentWeather(latitude, longitude, units as 'metric' | 'imperial');
      } else {
        throw new CustomError('Either city or lat/lon parameters are required', 400);
      }

      res.json({
        success: true,
        data: weather,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new CustomError(error.message, 500);
      }
      throw new CustomError('Failed to fetch weather data', 500);
    }
  }

  async getForecast(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { lat, lon, units = 'metric', days = '5' } = req.query;

      if (!lat || !lon) {
        throw new CustomError('Latitude and longitude are required', 400);
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      const daysCount = parseInt(days as string, 10);

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new CustomError('Invalid latitude or longitude', 400);
      }

      const forecast = await weatherService.getForecast(
        latitude,
        longitude,
        units as 'metric' | 'imperial',
        daysCount
      );

      res.json({
        success: true,
        data: forecast,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new CustomError(error.message, 500);
      }
      throw new CustomError('Failed to fetch weather forecast', 500);
    }
  }
}

export const weatherController = new WeatherController();

