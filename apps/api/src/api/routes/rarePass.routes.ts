import { Router } from 'express';
import { rarePassController } from '../../di/container';
import { transactionRateLimiter } from '../middlewares/rateLimiter';
import { validateRequest } from '../middlewares/validation';
import { claimRarePassRewardSchema, claimRarePassMissionParamsSchema } from '@jlt/validation';

const router = Router();

// GET /api/v1/rarepass/status
router.get(
  '/status',
  rarePassController.getStatus
);

// GET /api/v1/rarepass/rewards
router.get(
  '/rewards',
  rarePassController.getRewards
);

// POST /api/v1/rarepass/claim
router.post(
  '/claim',
  transactionRateLimiter,
  validateRequest(claimRarePassRewardSchema),
  rarePassController.claimReward
);

// GET /api/v1/rarepass/missions
router.get(
  '/missions',
  rarePassController.getMissions
);

// POST /api/v1/rarepass/missions/:missionId/claim
router.post(
  '/missions/:missionId/claim',
  transactionRateLimiter,
  validateRequest(claimRarePassMissionParamsSchema, 'params'),
  rarePassController.claimMission
);

// POST /api/v1/rarepass/buy-premium
router.post(
  '/buy-premium',
  transactionRateLimiter,
  rarePassController.buyPremium
);

export default router;
