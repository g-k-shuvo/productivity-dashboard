import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from './config/passport';
import { config } from './config/env';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { apiLimiter } from './middleware/rateLimiter';
import { initializeDatabase } from './config/database';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import imageRoutes from './routes/images';
import weatherRoutes from './routes/weather';
import quoteRoutes from './routes/quotes';
import subscriptionRoutes from './routes/subscriptions';
import stripeRoutes from './routes/stripe';
import syncRoutes from './routes/sync';
import fileRoutes from './routes/files';
import taskRoutes from './routes/tasks';
import habitRoutes from './routes/habits';
import metricsRoutes from './routes/metrics';
import workspaceRoutes from './routes/workspaces';
import aiRoutes from './routes/ai';
import integrationRoutes from './routes/integrations';
import pomodoroRoutes from './routes/pomodoro';
import countdownRoutes from './routes/countdowns';
import tabstashRoutes from './routes/tabstash';

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.nodeEnv === 'production' ? config.apiUrl : '*',
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(
  session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.nodeEnv === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/images', imageRoutes);
app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/quotes', quoteRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/stripe', stripeRoutes);
app.use('/api/v1/sync', syncRoutes);
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/habits', habitRoutes);
app.use('/api/v1/metrics', metricsRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/integrations', integrationRoutes);
app.use('/api/v1/pomodoro', pomodoroRoutes);
app.use('/api/v1/countdowns', countdownRoutes);
app.use('/api/v1/tabstash', tabstashRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    // Initialize database
    await initializeDatabase();

    // Start server
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();

export default app;

