import React, { useState, useEffect, useRef } from 'react';
import { storage } from '../../../shared/utils/storage';
import { getGreetingByHour } from '../../utils/greetingUtils';
import './GreetingWidget.css';

const STORAGE_KEY = 'greeting_user_name';

const GreetingWidget: React.FC = () => {
  const [userName, setUserName] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [greeting, setGreeting] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Load name from storage on mount
  useEffect(() => {
    const loadName = async () => {
      const savedName = await storage.get<string>(STORAGE_KEY);
      if (savedName) {
        setUserName(savedName);
        setInputValue(savedName);
      }
    };
    loadName();
  }, []);

  // Update greeting based on current hour
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      setGreeting(getGreetingByHour(hour));
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleNameClick = () => {
    setInputValue(userName);
    setIsEditing(true);
  };

  const saveName = async () => {
    const trimmedName = inputValue.trim();
    await storage.set(STORAGE_KEY, trimmedName);
    setUserName(trimmedName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveName();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(userName);
    }
  };

  const handleBlur = () => {
    saveName();
  };

  const displayName = userName || 'friend';

  return (
    <div className="greeting-widget">
      <span className="greeting-text">{greeting}, </span>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Enter your name"
          className="greeting-input"
          autoFocus
        />
      ) : (
        <span className="greeting-name" onClick={handleNameClick}>
          {displayName}
        </span>
      )}
    </div>
  );
};

export default GreetingWidget;
