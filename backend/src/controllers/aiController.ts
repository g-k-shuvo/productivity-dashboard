import { Response } from 'express';
import { AuthRequest, getUserId } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { AIConversation } from '../models/AIConversation';
import { aiService, AIMessage } from '../services/aiService';
import { CustomError } from '../middleware/errorHandler';

export class AIController {
  private conversationRepository = AppDataSource.getRepository(AIConversation);

  async createConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { type, title } = req.body;

      if (!type) {
        throw new CustomError('Type is required', 400);
      }

      const conversation = this.conversationRepository.create({
        userId,
        type,
        title,
        messages: [],
      });

      const savedConversation = await this.conversationRepository.save(conversation);

      res.status(201).json({
        success: true,
        data: savedConversation,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create conversation', 500);
    }
  }

  async getConversations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { type, workspaceId } = req.query;

      const queryBuilder = this.conversationRepository
        .createQueryBuilder('conversation')
        .where('conversation.userId = :userId', { userId });

      if (type) {
        queryBuilder.andWhere('conversation.type = :type', { type });
      }

      if (workspaceId) {
        queryBuilder.andWhere('conversation.workspaceId = :workspaceId', { workspaceId });
      }

      queryBuilder.orderBy('conversation.updatedAt', 'DESC');

      const conversations = await queryBuilder.getMany();

      res.json({
        success: true,
        data: conversations.map((conv) => ({
          id: conv.id,
          type: conv.type,
          title: conv.title,
          messageCount: conv.messages.length,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        })),
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get conversations', 500);
    }
  }

  async getConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { conversationId } = req.params;

      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId, userId },
      });

      if (!conversation) {
        throw new CustomError('Conversation not found', 404);
      }

      res.json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get conversation', 500);
    }
  }

  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { conversationId } = req.params;
      const { message, provider = 'openai' } = req.body;

      if (!message) {
        throw new CustomError('Message is required', 400);
      }

      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId, userId },
      });

      if (!conversation) {
        throw new CustomError('Conversation not found', 404);
      }

      // Add user message
      const userMessage = {
        role: 'user' as const,
        content: message,
        timestamp: new Date(),
      };

      // Convert existing messages to AIMessage format (ensure timestamp)
      const existingMessages: AIMessage[] = conversation.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp || new Date(),
      }));

      const messages: AIMessage[] = [...existingMessages, userMessage];

      // Get AI response
      const aiResponse = provider === 'openai'
        ? await aiService.chatWithOpenAI(messages)
        : await aiService.chatWithAnthropic(messages);

      // Add assistant message
      const assistantMessage = {
        role: 'assistant' as const,
        content: aiResponse.message,
        timestamp: new Date(),
      };

      // Ensure all messages have timestamps before saving
      conversation.messages = [
        ...conversation.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp || new Date(),
        })),
        userMessage,
        assistantMessage,
      ];
      await this.conversationRepository.save(conversation);

      res.json({
        success: true,
        data: {
          conversation: conversation,
          response: aiResponse.message,
          usage: aiResponse.usage,
        },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new CustomError(error.message, 500);
      }
      throw new CustomError('Failed to send message', 500);
    }
  }

  async generateSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { content, provider = 'openai' } = req.body;

      if (!content) {
        throw new CustomError('Content is required', 400);
      }

      const summary = await aiService.generateNoteSummary(content, provider);

      res.json({
        success: true,
        data: { summary },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new CustomError(error.message, 500);
      }
      throw new CustomError('Failed to generate summary', 500);
    }
  }

  async suggestOrganization(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { notes, provider = 'openai' } = req.body;

      if (!notes || !Array.isArray(notes)) {
        throw new CustomError('Notes array is required', 400);
      }

      const categories = await aiService.suggestNoteOrganization(notes, provider);

      res.json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new CustomError(error.message, 500);
      }
      throw new CustomError('Failed to suggest organization', 500);
    }
  }

  async deleteConversation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { conversationId } = req.params;

      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId, userId },
      });

      if (!conversation) {
        throw new CustomError('Conversation not found', 404);
      }

      await this.conversationRepository.remove(conversation);

      res.json({
        success: true,
        message: 'Conversation deleted successfully',
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to delete conversation', 500);
    }
  }
}

export const aiController = new AIController();

