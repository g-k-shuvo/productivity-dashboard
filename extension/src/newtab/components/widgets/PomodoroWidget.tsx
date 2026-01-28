import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../../../shared/services/api';
import './PomodoroWidget.css';

const WORK_DURATION = 25 * 60; // 25 minutes in seconds
const SHORT_BREAK = 5 * 60; // 5 minutes
const LONG_BREAK = 15 * 60; // 15 minutes

const PomodoroWidget: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'short_break' | 'long_break'>('work');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleStart = async () => {
    setIsRunning(true);
    try {
      await apiService.post('/pomodoro', {
        duration: sessionType === 'work' ? 25 : sessionType === 'short_break' ? 5 : 15,
        type: sessionType,
      });
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(sessionType === 'work' ? WORK_DURATION : sessionType === 'short_break' ? SHORT_BREAK : LONG_BREAK);
  };

  const handleComplete = async () => {
    setIsRunning(false);
    if (sessionType === 'work') {
      setSessionsCompleted((prev) => prev + 1);
      const nextType = sessionsCompleted % 3 === 2 ? 'long_break' : 'short_break';
      setSessionType(nextType);
      setTimeLeft(nextType === 'long_break' ? LONG_BREAK : SHORT_BREAK);
    } else {
      setSessionType('work');
      setTimeLeft(WORK_DURATION);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((sessionType === 'work' ? WORK_DURATION : sessionType === 'short_break' ? SHORT_BREAK : LONG_BREAK) - timeLeft) / 
    (sessionType === 'work' ? WORK_DURATION : sessionType === 'short_break' ? SHORT_BREAK : LONG_BREAK) * 100;

  return (
    <div className="pomodoro-widget">
      <h3>Pomodoro Timer</h3>
      <div className="session-type-selector">
        <button
          className={sessionType === 'work' ? 'active' : ''}
          onClick={() => {
            if (!isRunning) {
              setSessionType('work');
              setTimeLeft(WORK_DURATION);
            }
          }}
        >
          Work
        </button>
        <button
          className={sessionType === 'short_break' ? 'active' : ''}
          onClick={() => {
            if (!isRunning) {
              setSessionType('short_break');
              setTimeLeft(SHORT_BREAK);
            }
          }}
        >
          Short Break
        </button>
        <button
          className={sessionType === 'long_break' ? 'active' : ''}
          onClick={() => {
            if (!isRunning) {
              setSessionType('long_break');
              setTimeLeft(LONG_BREAK);
            }
          }}
        >
          Long Break
        </button>
      </div>
      <div className="timer-display">
        <div className="timer-circle">
          <svg className="progress-ring" width="200" height="200">
            <circle
              className="progress-ring-circle"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="4"
              fill="transparent"
              r="90"
              cx="100"
              cy="100"
            />
            <circle
              className="progress-ring-circle progress"
              stroke="white"
              strokeWidth="4"
              fill="transparent"
              r="90"
              cx="100"
              cy="100"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
              transform="rotate(-90 100 100)"
            />
          </svg>
          <div className="timer-text">{formatTime(timeLeft)}</div>
        </div>
      </div>
      <div className="timer-controls">
        {!isRunning ? (
          <button onClick={handleStart} className="start-button">
            Start
          </button>
        ) : (
          <button onClick={handlePause} className="pause-button">
            Pause
          </button>
        )}
        <button onClick={handleReset} className="reset-button">
          Reset
        </button>
      </div>
      <div className="sessions-completed">
        Sessions completed today: {sessionsCompleted}
      </div>
    </div>
  );
};

export default PomodoroWidget;

