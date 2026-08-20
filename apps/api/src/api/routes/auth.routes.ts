import { Router } from 'express';
import { authController } from '../../di/container';
import { loginRateLimiter } from '../middlewares/rateLimiter';
import { validateRequest } from '../middlewares/validation';
import { loginSchema, refreshTokenSchema } from '@jlt/validation';

const router = Router();

// POST /api/v1/auth/login
router.post(
  '/login',
  loginRateLimiter,
  validateRequest(loginSchema),
  authController.login
);

// POST /api/v1/auth/refresh
router.post(
  '/refresh',
  validateRequest(refreshTokenSchema),
  authController.refresh
);

// POST /api/v1/auth/logout
router.post(
  '/logout',
  authController.logout
);

export default router;
