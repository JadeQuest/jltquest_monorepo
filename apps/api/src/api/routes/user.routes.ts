import { Router } from 'express';
import { userController } from '../../di/container';
import { transactionRateLimiter } from '../middlewares/rateLimiter';
import { validateRequest } from '../middlewares/validation';
import { convertGpSchema } from '@jlt/validation';

const router = Router();

// GET /api/v1/users/me
router.get(
  '/me',
  userController.getMe
);

// POST /api/v1/users/convert-gp
router.post(
  '/convert-gp',
  transactionRateLimiter,
  validateRequest(convertGpSchema),
  userController.convertGp
);

export default router;
