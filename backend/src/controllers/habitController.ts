import { Response } from 'express';
import { AuthRequest, getUserId } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { Habit } from '../models/Habit';
import { HabitEntry } from '../models/HabitEntry';
import { CustomError } from '../middleware/errorHandler';

export class HabitController {
  private habitRepository = AppDataSource.getRepository(Habit);
  private habitEntryRepository = AppDataSource.getRepository(HabitEntry);

  async createHabit(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { name, description, color, workspaceId } = req.body;

      if (!name) {
        throw new CustomError('Name is required', 400);
      }

      const habit = this.habitRepository.create({
        userId,
        name,
        description,
        color,
        workspaceId,
      });

      const savedHabit = await this.habitRepository.save(habit);

      res.status(201).json({
        success: true,
        data: savedHabit,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create habit', 500);
    }
  }

  async getHabits(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { workspaceId } = req.query;

      const queryBuilder = this.habitRepository
        .createQueryBuilder('habit')
        .where('habit.userId = :userId', { userId });

      if (workspaceId) {
        queryBuilder.andWhere('habit.workspaceId = :workspaceId', { workspaceId });
      }

      queryBuilder.orderBy('habit.createdAt', 'DESC');

      const habits = await queryBuilder.getMany();

      res.json({
        success: true,
        data: habits,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get habits', 500);
    }
  }

  async getHabit(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { habitId } = req.params;

      const habit = await this.habitRepository.findOne({
        where: { id: habitId, userId },
        relations: ['entries'],
      });

      if (!habit) {
        throw new CustomError('Habit not found', 404);
      }

      res.json({
        success: true,
        data: habit,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get habit', 500);
    }
  }

  async updateHabit(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { habitId } = req.params;
      const updates = req.body;

      const habit = await this.habitRepository.findOne({
        where: { id: habitId, userId },
      });

      if (!habit) {
        throw new CustomError('Habit not found', 404);
      }

      Object.assign(habit, updates);
      const updatedHabit = await this.habitRepository.save(habit);

      res.json({
        success: true,
        data: updatedHabit,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update habit', 500);
    }
  }

  async deleteHabit(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { habitId } = req.params;

      const habit = await this.habitRepository.findOne({
        where: { id: habitId, userId },
      });

      if (!habit) {
        throw new CustomError('Habit not found', 404);
      }

      await this.habitRepository.remove(habit);

      res.json({
        success: true,
        message: 'Habit deleted successfully',
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to delete habit', 500);
    }
  }

  async checkInHabit(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { habitId } = req.params;
      const { date, completed, notes } = req.body;

      const habit = await this.habitRepository.findOne({
        where: { id: habitId, userId },
      });

      if (!habit) {
        throw new CustomError('Habit not found', 404);
      }

      const checkDate = date ? new Date(date) : new Date();
      checkDate.setHours(0, 0, 0, 0);

      let entry = await this.habitEntryRepository.findOne({
        where: { habitId, date: checkDate },
      });

      if (entry) {
        entry.completed = completed !== undefined ? completed : !entry.completed;
        if (notes !== undefined) {
          entry.notes = notes;
        }
      } else {
        entry = this.habitEntryRepository.create({
          habitId,
          date: checkDate,
          completed: completed !== undefined ? completed : true,
          notes,
        });
      }

      const savedEntry = await this.habitEntryRepository.save(entry);

      res.json({
        success: true,
        data: savedEntry,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to check in habit', 500);
    }
  }

  async getHabitEntries(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { habitId } = req.params;
      const { startDate, endDate } = req.query;

      const habit = await this.habitRepository.findOne({
        where: { id: habitId, userId },
      });

      if (!habit) {
        throw new CustomError('Habit not found', 404);
      }

      const queryBuilder = this.habitEntryRepository
        .createQueryBuilder('entry')
        .where('entry.habitId = :habitId', { habitId });

      if (startDate) {
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        queryBuilder.andWhere('entry.date >= :startDate', { startDate: start });
      }

      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        queryBuilder.andWhere('entry.date <= :endDate', { endDate: end });
      }

      queryBuilder.orderBy('entry.date', 'DESC');

      const entries = await queryBuilder.getMany();

      res.json({
        success: true,
        data: entries,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get habit entries', 500);
    }
  }

  async getHabitStreak(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req);
      const { habitId } = req.params;

      const habit = await this.habitRepository.findOne({
        where: { id: habitId, userId },
      });

      if (!habit) {
        throw new CustomError('Habit not found', 404);
      }

      // Get all completed entries ordered by date
      const entries = await this.habitEntryRepository.find({
        where: { habitId, completed: true },
        order: { date: 'DESC' },
      });

      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < entries.length; i++) {
        const entryDate = entries[i].date instanceof Date 
          ? new Date(entries[i].date)
          : new Date(entries[i].date);
        entryDate.setHours(0, 0, 0, 0);

        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        if (entryDate.getTime() === expectedDate.getTime()) {
          streak++;
        } else {
          break;
        }
      }

      res.json({
        success: true,
        data: { streak },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to calculate streak', 500);
    }
  }
}

export const habitController = new HabitController();

