import React, { useState, useEffect } from 'react';
import { storage } from '../../../shared/utils/storage';
import { Quote } from '../../../shared/types';
import './QuoteWidget.css';

const QuoteWidget: React.FC = () => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuote();
  }, []);

  const loadQuote = async () => {
    const today = new Date().toISOString().split('T')[0];
    const savedQuote = await storage.get<Quote>(`quote_${today}`);

    if (savedQuote) {
      setQuote(savedQuote);
      setLoading(false);
      return;
    }

    // Fetch from backend API
    try {
      const { apiService } = await import('../../../shared/services/api');
      const response = await apiService.get<{ success: boolean; data: Quote }>('/quotes/daily');
      if (response.success) {
        await storage.set(`quote_${today}`, response.data);
        setQuote(response.data);
      } else {
        // Fallback to default quotes
        loadDefaultQuote();
      }
    } catch (error) {
      console.error('Failed to fetch quote from API:', error);
      // Fallback to default quotes
      loadDefaultQuote();
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultQuote = async () => {
    const defaultQuotes: Quote[] = [
      { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
      { text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs' },
      { text: 'Life is what happens to you while you\'re busy making other plans.', author: 'John Lennon' },
      { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
      { text: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle' },
    ];

    const today = new Date().toISOString().split('T')[0];
    const randomQuote = defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)];
    await storage.set(`quote_${today}`, randomQuote);
    setQuote(randomQuote);
  };

  if (loading) {
    return <div className="quote-widget loading">Loading quote...</div>;
  }

  if (!quote) {
    return null;
  }

  return (
    <div className="quote-widget">
      <div className="quote-text">"{quote.text}"</div>
      {quote.author && <div className="quote-author">— {quote.author}</div>}
    </div>
  );
};

export default QuoteWidget;

