import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { 
  authController, 
  userController, 
  checkInController,
  questController,
  spinController,
  inviteController,
  socialController,
  levelController,
  collectionController
} from '../../di/container';

const router = Router();

// Auth
router.post('/auth/login', authController.login.bind(authController));

// Authenticated Routes
router.use(authenticate);

// Users
router.get('/users/me', userController.getMe.bind(userController));

// CheckIn
router.get('/checkin/status', checkInController.getStatus.bind(checkInController));
router.post('/checkin/claim', checkInController.claim.bind(checkInController));

// Quests
router.get('/quests', questController.list.bind(questController));
router.post('/quests/:questId/claim', questController.claim.bind(questController));

// Spin
router.get('/spin/status', spinController.getStatus.bind(spinController));
router.post('/spin', spinController.spin.bind(spinController));
router.post('/spin/purchase', spinController.purchase.bind(spinController));

// Invites
router.get('/invites', inviteController.list.bind(inviteController));
router.post('/invites/redeem', inviteController.redeem.bind(inviteController));

// Social
router.get('/social/quests', socialController.listQuests.bind(socialController));
router.post('/social/quests/:questId/claim', socialController.claimQuest.bind(socialController));
router.get('/social/:platform/oauth-url', socialController.getOAuthUrl.bind(socialController));
router.post('/social/:platform/callback', socialController.callback.bind(socialController));
router.delete('/social/:platform', socialController.disconnect.bind(socialController));

// Levels
router.get('/levels/:level/requirement', levelController.getRequirement.bind(levelController));

// Collections
router.get('/collection', collectionController.getCollection.bind(collectionController));
router.post('/collection/merge', collectionController.mergeFragments.bind(collectionController));

export default router;
