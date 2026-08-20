import { Router } from 'express';
import { checkInController } from '../../di/container';
import { transactionRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

// GET /api/v1/checkin/status
router.get(
  '/status',
  checkInController.getStatus
);

// POST /api/v1/checkin/claim
router.post(
  '/claim',
  transactionRateLimiter,
  checkInController.claim
);

export default router;
