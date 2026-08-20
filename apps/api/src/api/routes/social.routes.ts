import { Router } from 'express';
import { socialController } from '../../di/container';
import { transactionRateLimiter } from '../middlewares/rateLimiter';
import { validateRequest } from '../middlewares/validation';
import {
  socialOAuthUrlParamsSchema,
  socialCallbackParamsSchema,
  socialCallbackSchema,
  socialDisconnectParamsSchema,
  socialClaimQuestParamsSchema
} from '@jlt/validation';

const router = Router();

// GET /api/v1/social/quests
router.get(
  '/quests',
  socialController.listQuests
);

// POST /api/v1/social/quests/:questId/claim
router.post(
  '/quests/:questId/claim',
  transactionRateLimiter,
  validateRequest(socialClaimQuestParamsSchema, 'params'),
  socialController.claimQuest
);

// GET /api/v1/social/:platform/oauth-url
router.get(
  '/:platform/oauth-url',
  validateRequest(socialOAuthUrlParamsSchema, 'params'),
  socialController.getOAuthUrl
);

// POST /api/v1/social/:platform/callback
router.post(
  '/:platform/callback',
  validateRequest({
    params: socialCallbackParamsSchema,
    body: socialCallbackSchema
  }),
  socialController.callback
);

// DELETE /api/v1/social/:platform
router.delete(
  '/:platform',
  validateRequest(socialDisconnectParamsSchema, 'params'),
  socialController.disconnect
);

export default router;
