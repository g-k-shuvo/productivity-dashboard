import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Workspace } from './Workspace';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'workspace_id', nullable: true })
  workspaceId?: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'workspace_id' })
  workspace?: Workspace;

  @Column({ length: 500 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: false })
  completed!: boolean;

  @Column({ default: 'medium' })
  priority!: string; // 'low', 'medium', 'high'

  @Column({ name: 'due_date', type: 'timestamp with time zone', nullable: true })
  dueDate?: Date;

  @Column({ nullable: true, length: 100 })
  category?: string;

  @Column({ type: 'text', array: true, default: [] })
  tags!: string[];

  @Column({ name: 'parent_task_id', nullable: true })
  parentTaskId?: string;

  @ManyToOne(() => Task, (task) => task.subtasks, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parent_task_id' })
  parentTask?: Task;

  @OneToMany(() => Task, (task) => task.parentTask)
  subtasks!: Task[];

  @Column({ default: 0 })
  position!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

