import React, { useState, useEffect } from 'react';
import { apiService } from '../../../shared/services/api';
import './CountdownWidget.css';

interface Countdown {
  id: string;
  name: string;
  targetDate: string;
  notifyBefore?: number;
}

const CountdownWidget: React.FC = () => {
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [times, setTimes] = useState<Record<string, { days: number; hours: number; minutes: number; seconds: number }>>({});

  useEffect(() => {
    loadCountdowns();
  }, []);

  useEffect(() => {
    const updateTimes = () => {
      const newTimes: Record<string, { days: number; hours: number; minutes: number; seconds: number }> = {};
      countdowns.forEach((countdown) => {
        const target = new Date(countdown.targetDate).getTime();
        const now = Date.now();
        const diff = target - now;

        if (diff > 0) {
          newTimes[countdown.id] = {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
          };
        } else {
          newTimes[countdown.id] = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
      });
      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [countdowns]);

  const loadCountdowns = async () => {
    try {
      const response = await apiService.get<{ success: boolean; data: Countdown[] }>('/countdowns');
      if (response.success) {
        setCountdowns(response.data);
      }
    } catch (error) {
      console.error('Failed to load countdowns:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="countdown-widget loading">Loading countdowns...</div>;
  }

  return (
    <div className="countdown-widget">
      <h3>Countdown Timers</h3>
      <div className="countdowns-list">
        {countdowns.length === 0 ? (
          <div className="empty-state">No countdown timers yet. Create one to get started!</div>
        ) : (
          countdowns.map((countdown) => {
            const time = times[countdown.id] || { days: 0, hours: 0, minutes: 0, seconds: 0 };
            const isExpired = time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0;
            
            return (
              <div key={countdown.id} className={`countdown-item ${isExpired ? 'expired' : ''}`}>
                <div className="countdown-name">{countdown.name}</div>
                {isExpired ? (
                  <div className="countdown-expired">Event has passed</div>
                ) : (
                  <div className="countdown-time">
                    <div className="time-unit">
                      <span className="time-value">{time.days}</span>
                      <span className="time-label">Days</span>
                    </div>
                    <div className="time-unit">
                      <span className="time-value">{time.hours}</span>
                      <span className="time-label">Hours</span>
                    </div>
                    <div className="time-unit">
                      <span className="time-value">{time.minutes}</span>
                      <span className="time-label">Minutes</span>
                    </div>
                    <div className="time-unit">
                      <span className="time-value">{time.seconds}</span>
                      <span className="time-label">Seconds</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CountdownWidget;

