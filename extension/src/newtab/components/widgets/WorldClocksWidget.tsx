import React, { useState, useEffect } from 'react';
import './WorldClocksWidget.css';

interface Clock {
  id: string;
  label: string;
  timezone: string;
}

const WorldClocksWidget: React.FC = () => {
  const [clocks, setClocks] = useState<Clock[]>([
    { id: '1', label: 'New York', timezone: 'America/New_York' },
    { id: '2', label: 'London', timezone: 'Europe/London' },
    { id: '3', label: 'Tokyo', timezone: 'Asia/Tokyo' },
  ]);
  const [times, setTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateTimes = () => {
      const newTimes: Record<string, string> = {};
      clocks.forEach((clock) => {
        try {
          const time = new Date().toLocaleString('en-US', {
            timeZone: clock.timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          });
          newTimes[clock.id] = time;
        } catch (error) {
          newTimes[clock.id] = 'Invalid timezone';
        }
      });
      setTimes(newTimes);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [clocks]);

  return (
    <div className="world-clocks-widget">
      <h3>World Clocks</h3>
      <div className="clocks-list">
        {clocks.map((clock) => (
          <div key={clock.id} className="clock-item">
            <div className="clock-label">{clock.label}</div>
            <div className="clock-time">{times[clock.id] || '--:--:--'}</div>
            <div className="clock-timezone">{clock.timezone}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorldClocksWidget;

