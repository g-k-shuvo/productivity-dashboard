import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { config } from './env';
import { authService } from '../services/authService';
import { logger } from './logger';

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const { AppDataSource } = await import('../config/database');
    const { User } = await import('../models/User');
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (config.oauth.google.clientId && config.oauth.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.oauth.google.clientId,
        clientSecret: config.oauth.google.clientSecret,
        callbackURL: `${config.apiUrl}/api/v1/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || profile.name?.givenName || 'User';
          const avatarUrl = profile.photos?.[0]?.value;

          if (!email) {
            return done(new Error('No email found in Google profile'), undefined);
          }

          const user = await authService.findOrCreateUser(
            email,
            name,
            'google',
            profile.id,
            avatarUrl
          );

          logger.info(`Google OAuth successful for user: ${email}`);
          return done(null, user);
        } catch (error) {
          logger.error('Google OAuth error:', error);
          return done(error as Error, undefined);
        }
      }
    )
  );
} else {
  logger.warn('Google OAuth credentials not configured');
}

// GitHub OAuth Strategy
if (config.oauth.github.clientId && config.oauth.github.clientSecret) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: config.oauth.github.clientId,
        clientSecret: config.oauth.github.clientSecret,
        callbackURL: `${config.apiUrl}/api/v1/auth/github/callback`,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (error: any, user?: any) => void
      ) => {
        try {
          const email = profile.emails?.[0]?.value || profile.username + '@github';
          const name = profile.displayName || profile.username || 'User';
          const avatarUrl = profile.photos?.[0]?.value;

          const user = await authService.findOrCreateUser(
            email,
            name,
            'github',
            profile.id,
            avatarUrl
          );

          logger.info(`GitHub OAuth successful for user: ${email}`);
          return done(null, user);
        } catch (error) {
          logger.error('GitHub OAuth error:', error);
          return done(error as Error, undefined);
        }
      }
    )
  );
} else {
  logger.warn('GitHub OAuth credentials not configured');
}

export default passport;

