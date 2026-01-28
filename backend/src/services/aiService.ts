import axios from 'axios';
import { config } from '../config/env';
import { logger } from '../config/logger';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface AIResponse {
  message: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class AIService {
  private openaiApiKey = config.ai.openai.apiKey;
  private anthropicApiKey = config.ai.anthropic.apiKey;
  private openaiBaseUrl = 'https://api.openai.com/v1';
  private anthropicBaseUrl = 'https://api.anthropic.com/v1';

  async chatWithOpenAI(messages: AIMessage[], model: string = 'gpt-3.5-turbo'): Promise<AIResponse> {
    try {
      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        message: response.data.choices[0].message.content,
        usage: {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens,
        },
      };
    } catch (error) {
      logger.error('OpenAI API error:', error);
      throw new Error('Failed to get AI response from OpenAI');
    }
  }

  async chatWithAnthropic(messages: AIMessage[], model: string = 'claude-3-haiku-20240307'): Promise<AIResponse> {
    try {
      if (!this.anthropicApiKey) {
        throw new Error('Anthropic API key not configured');
      }

      // Convert messages to Anthropic format
      const systemMessage = messages.find((m) => m.role === 'system');
      const conversationMessages = messages.filter((m) => m.role !== 'system');

      const response = await axios.post(
        `${this.anthropicBaseUrl}/messages`,
        {
          model,
          max_tokens: 1000,
          messages: conversationMessages.map((msg) => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content,
          })),
          ...(systemMessage && { system: systemMessage.content }),
        },
        {
          headers: {
            'x-api-key': this.anthropicApiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        message: response.data.content[0].text,
        usage: {
          promptTokens: response.data.usage.input_tokens,
          completionTokens: response.data.usage.output_tokens,
          totalTokens: response.data.usage.input_tokens + response.data.usage.output_tokens,
        },
      };
    } catch (error) {
      logger.error('Anthropic API error:', error);
      throw new Error('Failed to get AI response from Anthropic');
    }
  }

  async generateNoteSummary(content: string, provider: 'openai' | 'anthropic' = 'openai'): Promise<string> {
    try {
      const messages: AIMessage[] = [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes notes concisely.',
        },
        {
          role: 'user',
          content: `Please provide a concise summary of the following notes:\n\n${content}`,
        },
      ];

      const response = provider === 'openai'
        ? await this.chatWithOpenAI(messages)
        : await this.chatWithAnthropic(messages);

      return response.message;
    } catch (error) {
      logger.error('Failed to generate note summary:', error);
      throw error;
    }
  }

  async suggestNoteOrganization(notes: string[], provider: 'openai' | 'anthropic' = 'openai'): Promise<string[]> {
    try {
      const messages: AIMessage[] = [
        {
          role: 'system',
          content: 'You are a helpful assistant that organizes notes into logical categories.',
        },
        {
          role: 'user',
          content: `Please suggest categories for organizing these notes:\n\n${notes.join('\n\n')}`,
        },
      ];

      const response = provider === 'openai'
        ? await this.chatWithOpenAI(messages)
        : await this.chatWithAnthropic(messages);

      // Parse response to extract categories (simple implementation)
      const categories = response.message
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map((line) => line.replace(/^[-*•]\s*/, '').trim())
        .filter((cat) => cat.length > 0);

      return categories;
    } catch (error) {
      logger.error('Failed to suggest note organization:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();

