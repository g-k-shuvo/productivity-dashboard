import React, { useState, useEffect } from 'react';
import { storage } from '../../../shared/utils/storage';
import './FocusWidget.css';

interface Focus {
  text: string;
  date: string;
}

const FocusWidget: React.FC = () => {
  const [focus, setFocus] = useState<Focus | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    loadFocus();
  }, []);

  const loadFocus = async () => {
    const today = new Date().toISOString().split('T')[0];
    const savedFocus = await storage.get<Focus>(`focus_${today}`);
    
    if (savedFocus) {
      setFocus(savedFocus);
      setInputValue(savedFocus.text);
    }
  };

  const saveFocus = async () => {
    const today = new Date().toISOString().split('T')[0];
    const newFocus: Focus = {
      text: inputValue.trim(),
      date: today,
    };

    await storage.set(`focus_${today}`, newFocus);
    setFocus(newFocus);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveFocus();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(focus?.text || '');
    }
  };

  if (isEditing) {
    return (
      <div className="focus-widget editing">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={saveFocus}
          placeholder="What is your main focus today?"
          className="focus-input"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="focus-widget" onClick={() => setIsEditing(true)}>
      {focus?.text ? (
        <div className="focus-text">{focus.text}</div>
      ) : (
        <div className="focus-placeholder">What is your main focus today?</div>
      )}
    </div>
  );
};

export default FocusWidget;

