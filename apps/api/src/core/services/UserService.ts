import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { LedgerRepository } from '../../infrastructure/database/repositories/LedgerRepository';
import { calculateXpRequiredForLevel, getLevelTier } from '../utils/leveling';
import { NotFoundError, BadRequestError } from '../errors/AppError';
import { ErrorCode, ErrorMessages } from '@jlt/constants';
import { LedgerType, LedgerSource } from '@jlt/database';
import type { UserDashboardDto, ConvertGpResultDto } from '@jlt/types';

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private ledgerRepository: LedgerRepository,
    private prisma: any
  ) {}

  async getDashboard(userId: string): Promise<UserDashboardDto> {
    const user = await this.userRepository.findWithConnections(this.prisma, userId);
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
          name: (user.activeAvatarVariant as any).avatar?.name,
          characterKey: (user.activeAvatarVariant as any).avatar?.characterKey
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

  async convertGp(userId: string, gpAmount: number): Promise<ConvertGpResultDto> {
    if (!gpAmount || gpAmount < 100) {
      throw new BadRequestError(ErrorMessages[ErrorCode.INVALID_INPUT], ErrorCode.INVALID_INPUT);
    }
    if (gpAmount % 100 !== 0) {
      throw new BadRequestError(ErrorMessages[ErrorCode.INVALID_INPUT], ErrorCode.INVALID_INPUT);
    }

    const jltToAdd = gpAmount / 100;

    return await this.prisma.$transaction(async (tx: any) => {
      const user = await this.userRepository.findById(tx, userId);
      if (!user) {
        throw new NotFoundError(ErrorMessages[ErrorCode.USER_NOT_FOUND], ErrorCode.USER_NOT_FOUND);
      }

      if (user.gp < gpAmount) {
        throw new BadRequestError(ErrorMessages[ErrorCode.INSUFFICIENT_GP], ErrorCode.INSUFFICIENT_GP);
      }

      // Deduct GP and add JLT
      const updatedUser = await this.userRepository.update(tx, userId, {
        gp: { decrement: gpAmount },
        jlt: { increment: jltToAdd }
      });

      // Record in ledger repository
      await this.ledgerRepository.createGpLedger(tx, {
        userId,
        amount: -gpAmount,
        type: LedgerType.DEBIT,
        source: LedgerSource.CONVERSION,
        refId: `convert_${userId}_${Date.now()}`
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
