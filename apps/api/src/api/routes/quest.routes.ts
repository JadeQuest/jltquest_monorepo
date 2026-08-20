import { Router } from 'express';
import { questController } from '../../di/container';
import { transactionRateLimiter } from '../middlewares/rateLimiter';
import { validateRequest } from '../middlewares/validation';
import { claimQuestSchema } from '@jlt/validation';

const router = Router();

// GET /api/v1/quests
router.get(
  '/',
  questController.list
);

// POST /api/v1/quests/:questId/claim
router.post(
  '/:questId/claim',
  transactionRateLimiter,
  validateRequest(claimQuestSchema, 'params'),
  questController.claim
);

export default router;
