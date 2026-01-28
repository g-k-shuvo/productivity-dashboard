import React, { useState, useEffect } from 'react';
import { apiService } from '../../../shared/services/api';
import './AskAIWidget.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AskAIWidget: React.FC = () => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    createConversation();
  }, []);

  const createConversation = async () => {
    try {
      const response = await apiService.post<{ success: boolean; data: { id: string } }>('/ai/conversations', {
        type: 'chat',
        title: 'New Chat',
      });

      if (response.success) {
        setConversationId(response.data.id);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversationId) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await apiService.post<{
        success: boolean;
        data: { response: string; conversation: { messages: Message[] } };
      }>(`/ai/conversations/${conversationId}/message`, {
        message: input,
        provider: 'openai',
      });

      if (response.success) {
        const assistantMessage: Message = { role: 'assistant', content: response.data.response };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
      setMessages((prev) => prev.slice(0, -1)); // Remove user message on error
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ask-ai-widget">
      <h3>Ask AI</h3>
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-chat">Start a conversation with AI...</div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-content">{message.content}</div>
            </div>
          ))
        )}
        {loading && (
          <div className="message assistant">
            <div className="message-content">Thinking...</div>
          </div>
        )}
      </div>
      <div className="chat-input-section">
        <textarea
          className="chat-input"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={2}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default AskAIWidget;

