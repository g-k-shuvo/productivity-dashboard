import React, { useState } from 'react';
import { apiService } from '../../../shared/services/api';
import './NotesAIWidget.css';

const NotesAIWidget: React.FC = () => {
  const [note, setNote] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!note.trim()) {
      alert('Please enter some notes to summarize');
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.post<{ success: boolean; data: { summary: string } }>('/ai/summarize', {
        content: note,
        provider: 'openai',
      });

      if (response.success) {
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOrganize = async () => {
    if (!note.trim()) {
      alert('Please enter some notes to organize');
      return;
    }

    const notes = note.split('\n').filter((n) => n.trim());
    if (notes.length === 0) {
      alert('Please enter multiple notes to organize');
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.post<{ success: boolean; data: { categories: string[] } }>('/ai/organize', {
        notes,
        provider: 'openai',
      });

      if (response.success) {
        setSummary('Suggested categories:\n' + response.data.categories.join('\n'));
      }
    } catch (error) {
      console.error('Failed to organize notes:', error);
      alert('Failed to organize notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notes-ai-widget">
      <h3>Notes AI</h3>
      <div className="notes-input-section">
        <textarea
          className="notes-textarea"
          placeholder="Enter your notes here..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={6}
        />
        <div className="notes-actions">
          <button onClick={handleSummarize} disabled={loading || !note.trim()}>
            {loading ? 'Processing...' : 'Summarize'}
          </button>
          <button onClick={handleOrganize} disabled={loading || !note.trim()}>
            {loading ? 'Processing...' : 'Organize'}
          </button>
        </div>
      </div>
      {summary && (
        <div className="notes-result">
          <h4>Result:</h4>
          <div className="result-content">{summary}</div>
        </div>
      )}
    </div>
  );
};

export default NotesAIWidget;

