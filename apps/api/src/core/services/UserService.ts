import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { calculateXpRequiredForLevel, getLevelTier } from '../utils/leveling';
import { NotFoundError } from '../errors/AppError';
import { ErrorCode, ErrorMessages } from '@jlt/constants';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getDashboard(userId: string) {
    const user = await this.userRepository.findWithConnections(null as any, userId);
    if (!user) {
      throw new NotFoundError(
        ErrorMessages[ErrorCode.USER_NOT_FOUND],
        ErrorCode.USER_NOT_FOUND
      );
    }

    const socialConnections: Record<string, any> = {
      x: { connected: false },
      discord: { connected: false },
      telegram: { connected: false },
      linkedin: { connected: false },
      whatsapp: { connected: false },
      email: { connected: false }
    };

    if (user.socialConnections) {
      user.socialConnections.forEach((c: any) => {
        const platformKey = c.platform.toLowerCase();
        socialConnections[platformKey] = {
          connected: c.connected,
          handle: c.handle,
          email: c.email,
          linkedAt: c.linkedAt
        };
      });
    }

    const xpRequiredForNext = calculateXpRequiredForLevel(user.level);

    return {
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        level: user.level,
        levelTier: getLevelTier(user.level),
        xp: user.xp,
        gp: user.gp,
        jlt: Number(user.jlt),
        streak: user.streak,
        activeAvatar: user.activeAvatarVariant ? {
          variantId: user.activeAvatarVariant.id,
          type: user.activeAvatarVariant.type,
          imageUrl: user.activeAvatarVariant.imageUrl,
          modelUrl: user.activeAvatarVariant.modelUrl,
          name: (user.activeAvatarVariant as any).avatar.name,
          characterKey: (user.activeAvatarVariant as any).avatar.characterKey
        } : null
      },
      leveling: {
        currentXp: user.xp,
        nextLevelXp: xpRequiredForNext,
        progress: (user.xp / xpRequiredForNext) * 100
      },
      socialConnections
    };
  }
}
