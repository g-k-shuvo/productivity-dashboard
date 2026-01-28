import axios from 'axios';
import { config } from '../config/env';
import { logger } from '../config/logger';

export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  location: string;
  humidity?: number;
  windSpeed?: number;
  description?: string;
  forecast?: {
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
  }[];
}

export class WeatherService {
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  private apiKey = config.external.openweather.apiKey;

  async getCurrentWeather(lat: number, lon: number, units: 'metric' | 'imperial' = 'metric'): Promise<WeatherData> {
    try {
      if (!this.apiKey) {
        throw new Error('OpenWeatherMap API key not configured');
      }

      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units,
        },
      });

      const data = response.data;

      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        icon: this.getWeatherIcon(data.weather[0].icon),
        location: data.name,
        humidity: data.main.humidity,
        windSpeed: data.wind?.speed,
        description: data.weather[0].description,
      };
    } catch (error) {
      logger.error('Failed to fetch weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  async getWeatherByCity(city: string, units: 'metric' | 'imperial' = 'metric'): Promise<WeatherData> {
    try {
      if (!this.apiKey) {
        throw new Error('OpenWeatherMap API key not configured');
      }

      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: city,
          appid: this.apiKey,
          units,
        },
      });

      const data = response.data;

      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        icon: this.getWeatherIcon(data.weather[0].icon),
        location: data.name,
        humidity: data.main.humidity,
        windSpeed: data.wind?.speed,
        description: data.weather[0].description,
      };
    } catch (error) {
      logger.error('Failed to fetch weather by city:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  async getForecast(lat: number, lon: number, units: 'metric' | 'imperial' = 'metric', days: number = 5): Promise<WeatherData['forecast']> {
    try {
      if (!this.apiKey) {
        throw new Error('OpenWeatherMap API key not configured');
      }

      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units,
          cnt: days * 8, // 8 forecasts per day (3-hour intervals)
        },
      });

      const forecasts: WeatherData['forecast'] = [];
      const dailyData: { [key: string]: any[] } = {};

      // Group forecasts by date
      response.data.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = [];
        }
        dailyData[date].push(item);
      });

      // Get daily high/low for each day
      Object.keys(dailyData).slice(0, days).forEach((date) => {
        const dayForecasts = dailyData[date];
        const temps = dayForecasts.map((f) => f.main.temp);
        const high = Math.round(Math.max(...temps));
        const low = Math.round(Math.min(...temps));
        const mainForecast = dayForecasts[Math.floor(dayForecasts.length / 2)];

        forecasts.push({
          date,
          high,
          low,
          condition: mainForecast.weather[0].main,
          icon: this.getWeatherIcon(mainForecast.weather[0].icon),
        });
      });

      return forecasts;
    } catch (error) {
      logger.error('Failed to fetch weather forecast:', error);
      throw new Error('Failed to fetch weather forecast');
    }
  }

  private getWeatherIcon(iconCode: string): string {
    const iconMap: { [key: string]: string } = {
      '01d': '☀️',
      '01n': '🌙',
      '02d': '⛅',
      '02n': '☁️',
      '03d': '☁️',
      '03n': '☁️',
      '04d': '☁️',
      '04n': '☁️',
      '09d': '🌧️',
      '09n': '🌧️',
      '10d': '🌦️',
      '10n': '🌧️',
      '11d': '⛈️',
      '11n': '⛈️',
      '13d': '❄️',
      '13n': '❄️',
      '50d': '🌫️',
      '50n': '🌫️',
    };
    return iconMap[iconCode] || '☀️';
  }
}

export const weatherService = new WeatherService();

