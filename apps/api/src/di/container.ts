import { prisma } from '../infrastructure/database/prisma';

// Repositories
import { UserRepository } from '../infrastructure/database/repositories/UserRepository';
import { StreakRepository } from '../infrastructure/database/repositories/StreakRepository';
import { QuestRepository } from '../infrastructure/database/repositories/QuestRepository';
import { SpinRepository } from '../infrastructure/database/repositories/SpinRepository';
import { InviteRepository } from '../infrastructure/database/repositories/InviteRepository';
import { SocialConnectionRepository } from '../infrastructure/database/repositories/SocialConnectionRepository';
import { LedgerRepository } from '../infrastructure/database/repositories/LedgerRepository';

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

// 1. Initialize Repositories
const userRepository = new UserRepository();
const streakRepository = new StreakRepository();
const questRepository = new QuestRepository();
const spinRepository = new SpinRepository();
const inviteRepository = new InviteRepository();
const socialConnectionRepository = new SocialConnectionRepository();
const ledgerRepository = new LedgerRepository();

// 2. Initialize Services
const authService = new AuthService(userRepository);
const ledgerService = new LedgerService(ledgerRepository);
const userService = new UserService(userRepository);
const checkInService = new CheckInService(streakRepository, ledgerService, prisma);
const questService = new QuestService(questRepository, ledgerService, prisma);
const spinService = new SpinService(spinRepository, ledgerService, prisma);
const inviteService = new InviteService(inviteRepository, ledgerService, prisma);
const socialService = new SocialService(socialConnectionRepository, ledgerService, prisma);
const collectionService = new CollectionService(prisma);
const levelService = new LevelService();

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
