import { Router } from 'express';
import { spinController } from '../../di/container';
import { transactionRateLimiter } from '../middlewares/rateLimiter';
import { validateRequest } from '../middlewares/validation';
import { spinSchema } from '@jlt/validation';

const router = Router();

// GET /api/v1/spin/status
router.get(
  '/status',
  spinController.getStatus
);

// POST /api/v1/spin
router.post(
  '/',
  transactionRateLimiter,
  validateRequest(spinSchema),
  spinController.spin
);

// POST /api/v1/spin/purchase
router.post(
  '/purchase',
  transactionRateLimiter,
  spinController.purchase
);

export default router;
