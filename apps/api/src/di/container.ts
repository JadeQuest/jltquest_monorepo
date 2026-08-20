import { prisma } from '../infrastructure/database/prisma';

// Repositories
import { UserRepository } from '../infrastructure/database/repositories/UserRepository';
import { StreakRepository } from '../infrastructure/database/repositories/StreakRepository';
import { QuestRepository } from '../infrastructure/database/repositories/QuestRepository';
import { SpinRepository } from '../infrastructure/database/repositories/SpinRepository';
import { InviteRepository } from '../infrastructure/database/repositories/InviteRepository';
import { SocialConnectionRepository } from '../infrastructure/database/repositories/SocialConnectionRepository';
import { LedgerRepository } from '../infrastructure/database/repositories/LedgerRepository';
import { CollectionRepository } from '../infrastructure/database/repositories/CollectionRepository';
import { AvatarRepository } from '../infrastructure/database/repositories/AvatarRepository';
import { RarePassRepository } from '../infrastructure/database/repositories/RarePassRepository';
import { AuditLogRepository } from '../infrastructure/database/repositories/AuditLogRepository';

// Services
import { AuthService } from '../core/services/AuthService';
import { LedgerService } from '../core/services/LedgerService';
import { UserService } from '../core/services/UserService';
import { CheckInService } from '../core/services/CheckInService';
import { QuestService } from '../core/services/QuestService';
import { SpinService } from '../core/services/SpinService';
import { InviteService } from '../core/services/InviteService';
import { SocialService } from '../core/services/SocialService';
import { CollectionService } from '../core/services/CollectionService';
import { LevelService } from '../core/services/LevelService';
import { RarePassService } from '../core/services/RarePassService';
import { AvatarService } from '../core/services/AvatarService';
import { LeaderboardService } from '../core/services/LeaderboardService';

// Controllers
import { AuthController } from '../api/controllers/AuthController';
import { UserController } from '../api/controllers/UserController';
import { CheckInController } from '../api/controllers/CheckInController';
import { QuestController } from '../api/controllers/QuestController';
import { SpinController } from '../api/controllers/SpinController';
import { InviteController } from '../api/controllers/InviteController';
import { SocialController } from '../api/controllers/SocialController';
import { LevelController } from '../api/controllers/LevelController';
import { CollectionController } from '../api/controllers/CollectionController';
import { RarePassController } from '../api/controllers/RarePassController';
import { AvatarController } from '../api/controllers/AvatarController';
import { LeaderboardController } from '../api/controllers/LeaderboardController';

// 1. Initialize Repositories
export const userRepository = new UserRepository();
export const streakRepository = new StreakRepository();
export const questRepository = new QuestRepository();
export const spinRepository = new SpinRepository();
export const inviteRepository = new InviteRepository();
export const socialConnectionRepository = new SocialConnectionRepository();
export const ledgerRepository = new LedgerRepository();
export const collectionRepository = new CollectionRepository();
export const avatarRepository = new AvatarRepository();
export const rarePassRepository = new RarePassRepository();
export const auditLogRepository = new AuditLogRepository();

// 2. Initialize Services
export const ledgerService = new LedgerService(ledgerRepository);
export const rarePassService = new RarePassService(rarePassRepository, userRepository, ledgerRepository, auditLogRepository, prisma);
export const authService = new AuthService(userRepository, auditLogRepository);
export const userService = new UserService(userRepository, ledgerRepository, prisma);
export const checkInService = new CheckInService(streakRepository, userRepository, ledgerService, rarePassService, auditLogRepository, prisma);
export const questService = new QuestService(questRepository, userRepository, ledgerService, rarePassService, prisma);
export const spinService = new SpinService(spinRepository, userRepository, ledgerRepository, ledgerService, rarePassService, auditLogRepository, prisma);
export const inviteService = new InviteService(inviteRepository, userRepository, ledgerService, rarePassService, prisma);
export const socialService = new SocialService(socialConnectionRepository, userRepository, ledgerRepository, ledgerService, rarePassService, auditLogRepository, prisma);
export const collectionService = new CollectionService(collectionRepository, userRepository, rarePassService, prisma);
export const levelService = new LevelService();
export const avatarService = new AvatarService(avatarRepository, userRepository, ledgerRepository, prisma);
export const leaderboardService = new LeaderboardService(userRepository, streakRepository, ledgerRepository, rarePassRepository, prisma);

// 3. Initialize Controllers
export const authController = new AuthController(authService);
export const userController = new UserController(userService);
export const checkInController = new CheckInController(checkInService);
export const questController = new QuestController(questService);
export const spinController = new SpinController(spinService);
export const inviteController = new InviteController(inviteService);
export const socialController = new SocialController(socialService);
export const levelController = new LevelController(levelService);
export const collectionController = new CollectionController(collectionService);
export const rarePassController = new RarePassController(rarePassService);
export const avatarController = new AvatarController(avatarService);
export const leaderboardController = new LeaderboardController(leaderboardService);
