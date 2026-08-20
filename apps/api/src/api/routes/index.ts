import { Router } from 'express';
import { authenticate } from '../middlewares/auth';

// Modular Route Handlers
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import checkInRoutes from './checkin.routes';
import questRoutes from './quest.routes';
import spinRoutes from './spin.routes';
import inviteRoutes from './invite.routes';
import socialRoutes from './social.routes';
import levelRoutes from './level.routes';
import collectionRoutes from './collection.routes';
import rarePassRoutes from './rarePass.routes';
import avatarRoutes from './avatar.routes';
import leaderboardRoutes from './leaderboard.routes';

const router = Router();

// Public Authentication Routes
router.use('/auth', authRoutes);

// Protected Routes (Require Valid Bearer Token)
router.use(authenticate);

router.use('/users', userRoutes);
router.use('/checkin', checkInRoutes);
router.use('/quests', questRoutes);
router.use('/spin', spinRoutes);
router.use('/invites', inviteRoutes);
router.use('/social', socialRoutes);
router.use('/levels', levelRoutes);
router.use('/collection', collectionRoutes);
router.use('/rarepass', rarePassRoutes);
router.use('/avatars', avatarRoutes);
router.use('/leaderboard', leaderboardRoutes);

export default router;
