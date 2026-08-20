import { Router } from 'express';
import { levelController } from '../../di/container';
import { validateRequest } from '../middlewares/validation';
import { getLevelRequirementParamsSchema } from '@jlt/validation';

const router = Router();

// GET /api/v1/levels/:level/requirement
router.get(
  '/:level/requirement',
  validateRequest(getLevelRequirementParamsSchema, 'params'),
  levelController.getRequirement
);

export default router;
