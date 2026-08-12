import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { calculateXpRequiredForLevel, getLevelTier } from '../utils/leveling';
import { NotFoundError, BadRequestError } from '../errors/AppError';
import { ErrorCode, ErrorMessages } from '@jlt/constants';

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private prisma: any
  ) {}

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

  async convertGp(userId: string, gpAmount: number) {
    if (!gpAmount || gpAmount < 100) {
      throw new BadRequestError('Minimum 100 GP required for conversion', ErrorCode.INVALID_INPUT);
    }
    if (gpAmount % 100 !== 0) {
      throw new BadRequestError('GP amount must be a multiple of 100', ErrorCode.INVALID_INPUT);
    }

    const jltToAdd = gpAmount / 100;

    return await this.prisma.$transaction(async (tx: any) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundError(ErrorMessages[ErrorCode.USER_NOT_FOUND], ErrorCode.USER_NOT_FOUND);
      }

      if (user.gp < gpAmount) {
        throw new BadRequestError(ErrorMessages[ErrorCode.INSUFFICIENT_GP], ErrorCode.INSUFFICIENT_GP);
      }

      // Deduct GP and add JLT
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          gp: { decrement: gpAmount },
          jlt: { increment: jltToAdd }
        }
      });

      // Record in ledger
      await tx.gpLedgerEntry.create({
        data: {
          userId,
          amount: -gpAmount,
          type: 'DEBIT',
          source: 'CONVERSION',
          refId: `convert_${userId}_${Date.now()}`
        }
      });

      return {
        convertedGp: gpAmount,
        jltReceived: jltToAdd,
        newGpBalance: updatedUser.gp,
        newJltBalance: Number(updatedUser.jlt)
      };
    });
  }
}
