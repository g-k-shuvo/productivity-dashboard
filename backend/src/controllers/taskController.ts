import { Response } from 'express';
import { AuthRequest, getUserId } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { Task } from '../models/Task';
import { CustomError } from '../middleware/errorHandler';

export class TaskController {
  private taskRepository = AppDataSource.getRepository(Task);

  async createTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { title, description, priority, dueDate, category, tags, parentTaskId, workspaceId, position } = req.body;

      if (!title) {
        throw new CustomError('Title is required', 400);
      }

      const task = this.taskRepository.create({
        userId,
        title,
        description,
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        category,
        tags: tags || [],
        parentTaskId,
        workspaceId,
        position: position || 0,
        completed: false,
      });

      const savedTask = await this.taskRepository.save(task);

      res.status(201).json({
        success: true,
        data: savedTask,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create task', 500);
    }
  }

  async getTasks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { workspaceId, category, completed, priority, parentTaskId } = req.query;

      const queryBuilder = this.taskRepository
        .createQueryBuilder('task')
        .where('task.userId = :userId', { userId });

      if (workspaceId) {
        queryBuilder.andWhere('task.workspaceId = :workspaceId', { workspaceId });
      }

      if (category) {
        queryBuilder.andWhere('task.category = :category', { category });
      }

      if (completed !== undefined) {
        queryBuilder.andWhere('task.completed = :completed', { completed: completed === 'true' });
      }

      if (priority) {
        queryBuilder.andWhere('task.priority = :priority', { priority });
      }

      if (parentTaskId) {
        queryBuilder.andWhere('task.parentTaskId = :parentTaskId', { parentTaskId });
      } else {
        queryBuilder.andWhere('task.parentTaskId IS NULL');
      }

      queryBuilder.orderBy('task.position', 'ASC').addOrderBy('task.createdAt', 'DESC');

      const tasks = await queryBuilder.getMany();

      res.json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get tasks', 500);
    }
  }

  async getTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { taskId } = req.params;

      const task = await this.taskRepository.findOne({
        where: { id: taskId, userId },
        relations: ['subtasks', 'parentTask'],
      });

      if (!task) {
        throw new CustomError('Task not found', 404);
      }

      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get task', 500);
    }
  }

  async updateTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { taskId } = req.params;
      const updates = req.body;

      const task = await this.taskRepository.findOne({
        where: { id: taskId, userId },
      });

      if (!task) {
        throw new CustomError('Task not found', 404);
      }

      if (updates.dueDate) {
        updates.dueDate = new Date(updates.dueDate);
      }

      Object.assign(task, updates);
      const updatedTask = await this.taskRepository.save(task);

      res.json({
        success: true,
        data: updatedTask,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update task', 500);
    }
  }

  async deleteTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { taskId } = req.params;

      const task = await this.taskRepository.findOne({
        where: { id: taskId, userId },
      });

      if (!task) {
        throw new CustomError('Task not found', 404);
      }

      await this.taskRepository.remove(task);

      res.json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to delete task', 500);
    }
  }

  async toggleTask(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { taskId } = req.params;

      const task = await this.taskRepository.findOne({
        where: { id: taskId, userId },
      });

      if (!task) {
        throw new CustomError('Task not found', 404);
      }

      task.completed = !task.completed;
      const updatedTask = await this.taskRepository.save(task);

      res.json({
        success: true,
        data: updatedTask,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to toggle task', 500);
    }
  }
}

export const taskController = new TaskController();

