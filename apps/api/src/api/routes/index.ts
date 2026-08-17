import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { loginRateLimiter, transactionRateLimiter } from '../middlewares/rateLimiter';
import { validateRequest } from '../middlewares/validation';
import { loginSchema, claimQuestSchema, selectAvatarSchema, unlockAvatarSchema, convertGpSchema } from '@jlt/validation';
import { 
  authController, 
  userController, 
  checkInController,
  questController,
  spinController,
  inviteController,
  socialController,
  levelController,
  collectionController,
  rarePassController,
  avatarController,
  leaderboardController
} from '../../di/container';

const router = Router();

// Auth Endpoints
router.post('/auth/login', loginRateLimiter, validateRequest(loginSchema), authController.login.bind(authController));
router.post('/auth/refresh', authController.refresh.bind(authController));
router.post('/auth/logout', authController.logout.bind(authController));

// Authenticated Routes
router.use(authenticate);

// Users
router.get('/users/me', userController.getMe.bind(userController));
router.post('/users/convert-gp', transactionRateLimiter, validateRequest(convertGpSchema), userController.convertGp.bind(userController));

// Leaderboard
router.get('/leaderboard', leaderboardController.getLeaderboard.bind(leaderboardController));

// CheckIn
router.get('/checkin/status', checkInController.getStatus.bind(checkInController));
router.post('/checkin/claim', transactionRateLimiter, checkInController.claim.bind(checkInController));

// Quests
router.get('/quests', questController.list.bind(questController));
router.post('/quests/:questId/claim', transactionRateLimiter, validateRequest(claimQuestSchema, 'params'), questController.claim.bind(questController));

// Spin
router.get('/spin/status', spinController.getStatus.bind(spinController));
router.post('/spin', transactionRateLimiter, spinController.spin.bind(spinController));
router.post('/spin/purchase', transactionRateLimiter, spinController.purchase.bind(spinController));

// Invites
router.get('/invites', inviteController.list.bind(inviteController));
router.post('/invites/redeem', transactionRateLimiter, inviteController.redeem.bind(inviteController));

// Social Connections
router.get('/social/quests', socialController.listQuests.bind(socialController));
router.post('/social/quests/:questId/claim', transactionRateLimiter, socialController.claimQuest.bind(socialController));
router.get('/social/:platform/oauth-url', socialController.getOAuthUrl.bind(socialController));
router.post('/social/:platform/callback', socialController.callback.bind(socialController));
router.delete('/social/:platform', socialController.disconnect.bind(socialController));

// Levels
router.get('/levels/:level/requirement', levelController.getRequirement.bind(levelController));

// Collections
router.get('/collection', collectionController.getCollection.bind(collectionController));
router.post('/collection/merge', transactionRateLimiter, collectionController.mergeFragments.bind(collectionController));

// Rare Pass
router.get('/rarepass/status', rarePassController.getStatus.bind(rarePassController));
router.get('/rarepass/rewards', rarePassController.getRewards.bind(rarePassController));
router.post('/rarepass/claim', transactionRateLimiter, rarePassController.claimReward.bind(rarePassController));
router.get('/rarepass/missions', rarePassController.getMissions.bind(rarePassController));
router.post('/rarepass/missions/:missionId/claim', transactionRateLimiter, rarePassController.claimMission.bind(rarePassController));
router.post('/rarepass/buy-premium', transactionRateLimiter, rarePassController.buyPremium.bind(rarePassController));

// Avatars
router.get('/avatars', avatarController.list.bind(avatarController));
router.post('/avatars/select', validateRequest(selectAvatarSchema), avatarController.select.bind(avatarController));
router.post('/avatars/unlock', transactionRateLimiter, validateRequest(unlockAvatarSchema), avatarController.unlock.bind(avatarController));

export default router;
