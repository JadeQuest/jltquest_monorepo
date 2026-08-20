import { Router } from 'express';
import { avatarController } from '../../di/container';
import { transactionRateLimiter } from '../middlewares/rateLimiter';
import { validateRequest } from '../middlewares/validation';
import { selectAvatarSchema, unlockAvatarSchema } from '@jlt/validation';

const router = Router();

// GET /api/v1/avatars
router.get(
  '/',
  avatarController.list
);

// POST /api/v1/avatars/select
router.post(
  '/select',
  validateRequest(selectAvatarSchema),
  avatarController.select
);

// POST /api/v1/avatars/unlock
router.post(
  '/unlock',
  transactionRateLimiter,
  validateRequest(unlockAvatarSchema),
  avatarController.unlock
);

export default router;
