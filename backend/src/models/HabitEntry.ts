import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Habit } from './Habit';

@Entity('habit_entries')
@Unique(['habitId', 'date'])
export class HabitEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'habit_id' })
  habitId!: string;

  @ManyToOne(() => Habit, (habit) => habit.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'habit_id' })
  habit!: Habit;

  @Column({ type: 'date' })
  date!: Date;

  @Column({ default: false })
  completed!: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

