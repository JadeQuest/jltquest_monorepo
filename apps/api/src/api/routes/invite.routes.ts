import { Router } from 'express';
import { inviteController } from '../../di/container';
import { transactionRateLimiter } from '../middlewares/rateLimiter';
import { validateRequest } from '../middlewares/validation';
import { redeemInviteSchema, claimMilestoneSchema } from '@jlt/validation';

const router = Router();

// GET /api/v1/invites
router.get(
  '/',
  inviteController.list
);

// POST /api/v1/invites/redeem
router.post(
  '/redeem',
  transactionRateLimiter,
  validateRequest(redeemInviteSchema),
  inviteController.redeem
);

// POST /api/v1/invites/claim-milestone
router.post(
  '/claim-milestone',
  transactionRateLimiter,
  validateRequest(claimMilestoneSchema),
  inviteController.claimMilestone
);

export default router;
