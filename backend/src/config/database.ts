import { DataSource } from 'typeorm';
import { config } from './env';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.db.host,
  port: config.db.port,
  username: config.db.user,
  password: config.db.password,
  database: config.db.name,
  synchronize: config.nodeEnv === 'development',
  logging: config.nodeEnv === 'development',
  entities: [__dirname + '/../models/**/*.{ts,js}'],
  migrations: [__dirname + '/../migrations/**/*.ts'],
  subscribers: [__dirname + '/../subscribers/**/*.ts'],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  }
};

