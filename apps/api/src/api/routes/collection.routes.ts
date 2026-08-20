import { Router } from 'express';
import { collectionController } from '../../di/container';
import { transactionRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

// GET /api/v1/collection
router.get(
  '/',
  collectionController.getCollection
);

// POST /api/v1/collection/merge
router.post(
  '/merge',
  transactionRateLimiter,
  collectionController.mergeFragments
);

export default router;
