import { Router } from 'express';
import { leaderboardController } from '../../di/container';
import { validateRequest } from '../middlewares/validation';
import { getLeaderboardQuerySchema } from '@jlt/validation';

const router = Router();

// GET /api/v1/leaderboard
router.get(
  '/',
  validateRequest(getLeaderboardQuerySchema, 'query'),
  leaderboardController.getLeaderboard
);

export default router;
