import React, { useState, useEffect } from 'react';
import { storage } from '../../../shared/utils/storage';
import { useSettingsStore } from '../../store/useSettingsStore';
import { WeatherData } from '../../../shared/types';
import './WeatherWidget.css';

const WeatherWidget: React.FC = () => {
  const { settings } = useSettingsStore();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached = await storage.get<{ data: WeatherData; timestamp: number }>('weather');
      const now = Date.now();
      const cacheTimeout = 30 * 60 * 1000; // 30 minutes

      if (cached && now - cached.timestamp < cacheTimeout) {
        setWeather(cached.data);
        setLoading(false);
        return;
      }

      // Get location
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported');
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Call backend API
            const { apiService } = await import('../../../shared/services/api');
            const response = await apiService.get<{ success: boolean; data: WeatherData }>(
              `/weather/current?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );

            if (response.success) {
              await storage.set('weather', {
                data: response.data,
                timestamp: now,
              });
              setWeather(response.data);
            } else {
              throw new Error('Failed to fetch weather from API');
            }
          } catch (err) {
            console.error('Failed to fetch weather from API, using fallback:', err);
            // Fallback to mock data
            const mockWeather: WeatherData = {
              temperature: 22,
              condition: 'Sunny',
              icon: '☀️',
              location: 'Your Location',
            };
            await storage.set('weather', {
              data: mockWeather,
              timestamp: now,
            });
            setWeather(mockWeather);
          } finally {
            setLoading(false);
          }
        },
        () => {
          setError('Location permission denied');
          setLoading(false);
        }
      );
    } catch (err) {
      setError('Failed to load weather');
      setLoading(false);
    }
  };

  const formatTemperature = (temp: number): string => {
    const isCelsius = settings?.temperatureUnit === 'celsius';
    return isCelsius ? `${temp}°C` : `${Math.round(temp * 1.8 + 32)}°F`;
  };

  if (loading) {
    return (
      <div className="weather-widget loading">
        <div className="weather-loading">Loading weather...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-widget error">
        <div className="weather-error">{error}</div>
        <button onClick={loadWeather} className="weather-retry">
          Retry
        </button>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="weather-widget">
      <div className="weather-icon">{weather.icon}</div>
      <div className="weather-info">
        <div className="weather-temp">{formatTemperature(weather.temperature)}</div>
        <div className="weather-condition">{weather.condition}</div>
        <div className="weather-location">{weather.location}</div>
      </div>
    </div>
  );
};

export default WeatherWidget;

