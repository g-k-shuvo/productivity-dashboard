import { Router } from 'express';
import passport from '../config/passport';
import { authLimiter } from '../middleware/rateLimiter';
import { authController } from '../controllers/authController';
import { errorHandler } from '../middleware/errorHandler';

const router = Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/api/v1/auth/failure',
  }),
  (req, res, next) => {
    authController.googleCallback(req as any, res).catch(next);
  }
);

// GitHub OAuth routes
router.get(
  '/github',
  passport.authenticate('github', {
    scope: ['user:email'],
  })
);

router.get(
  '/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: '/api/v1/auth/failure',
  }),
  (req, res, next) => {
    authController.githubCallback(req as any, res).catch(next);
  }
);

// OAuth failure route
router.get('/failure', (req, res) => {
  res.status(401).json({
    success: false,
    error: {
      message: 'OAuth authentication failed. Please try again.',
    },
  });
});

router.post('/refresh', (req, res, next) => {
  authController.refreshToken(req as any, res).catch(next);
});

router.post('/logout', (req, res, next) => {
  authController.logout(req as any, res).catch(next);
});

router.use(errorHandler);

export default router;

