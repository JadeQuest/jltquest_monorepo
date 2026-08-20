import { AvatarRepository } from '../../infrastructure/database/repositories/AvatarRepository';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { LedgerRepository } from '../../infrastructure/database/repositories/LedgerRepository';
import { BadRequestError, NotFoundError } from '../errors/AppError';
import { ErrorCode, ErrorMessages } from '@jlt/constants';
import { LedgerSource, LedgerType } from '@jlt/database';
import { cacheService } from './CacheService';
import type { AvatarDto, AvatarSelectResultDto, AvatarUnlockResultDto } from '@jlt/types';

export class AvatarService {
  constructor(
    private avatarRepository: AvatarRepository,
    private userRepository: UserRepository,
    private ledgerRepository: LedgerRepository,
    private prisma: any
  ) {}

  async listAvatars(userId: string): Promise<AvatarDto[]> {
    let cachedAvatars = cacheService.get<any[]>('avatar_catalog_with_variants');

    const [avatars, userAvatars, user] = await Promise.all([
      cachedAvatars
        ? Promise.resolve(cachedAvatars)
        : this.avatarRepository.findAllAvatarsWithVariants(this.prisma),
      this.avatarRepository.findUserAvatars(this.prisma, userId),
      this.userRepository.findById(this.prisma, userId)
    ]);

    if (!cachedAvatars && avatars) {
      cacheService.set('avatar_catalog_with_variants', avatars, 180);
    }

    if (!user) {
      throw new NotFoundError(
        ErrorMessages[ErrorCode.USER_NOT_FOUND],
        ErrorCode.USER_NOT_FOUND
      );
    }

    const activeId = user.activeAvatarVariantId;
    const userLevel = user.level || 1;
    const unlockedIds = new Set(userAvatars.map((ua: any) => ua.variantId));

    // Retroactively unlock level-based avatars if the user meets the requirement
    const missingUnlocks = [];
    for (const avatar of avatars) {
      for (const v of avatar.variants) {
        if (v.unlockLevel && userLevel >= v.unlockLevel && !unlockedIds.has(v.id)) {
          unlockedIds.add(v.id);
          missingUnlocks.push({ userId, variantId: v.id });
        }
      }
    }

    if (missingUnlocks.length > 0) {
      await this.avatarRepository.createManyUserAvatars(this.prisma, missingUnlocks);
    }

    return avatars.map((avatar: any) => {
      return {
        id: avatar.id,
        name: avatar.name,
        characterKey: avatar.characterKey,
        variants: avatar.variants.map((v: any) => {
          return {
            id: v.id,
            type: v.type,
            imageUrl: v.imageUrl,
            modelUrl: v.modelUrl,
            unlocked: unlockedIds.has(v.id),
            active: v.id === activeId,
            unlockDescription: v.unlockDescription,
            isPurchasable: v.isPurchasable,
            costGp: v.costGp,
            costJlt: v.costJlt ? parseFloat(v.costJlt.toString()) : 0
          };
        })
      };
    });
  }

  async selectAvatar(userId: string, variantId: string): Promise<AvatarSelectResultDto> {
    const variant = await this.avatarRepository.findVariantById(this.prisma, variantId);
    if (!variant) {
      throw new NotFoundError(
        ErrorMessages[ErrorCode.AVATAR_VARIANT_NOT_FOUND],
        ErrorCode.AVATAR_VARIANT_NOT_FOUND
      );
    }

    // Check if unlocked
    const userAvatar = await this.avatarRepository.findUserAvatar(this.prisma, userId, variantId);

    if (!userAvatar) {
      throw new BadRequestError(
        ErrorMessages[ErrorCode.AVATAR_NOT_UNLOCKED],
        ErrorCode.AVATAR_NOT_UNLOCKED
      );
    }

    await this.userRepository.update(this.prisma, userId, {
      activeAvatarVariantId: variantId
    });

    return {
      success: true,
      activeAvatar: {
        variantId: variant.id,
        type: variant.type,
        imageUrl: variant.imageUrl,
        modelUrl: variant.modelUrl,
        name: variant.avatar.name,
        characterKey: variant.avatar.characterKey
      }
    };
  }

  async unlockAvatar(userId: string, variantId: string): Promise<AvatarUnlockResultDto> {
    return await this.prisma.$transaction(async (tx: any) => {
      const variant = await this.avatarRepository.findVariantById(tx, variantId);

      if (!variant) {
        throw new NotFoundError(
          ErrorMessages[ErrorCode.AVATAR_VARIANT_NOT_FOUND],
          ErrorCode.AVATAR_VARIANT_NOT_FOUND
        );
      }

      if (!variant.isPurchasable) {
        throw new BadRequestError(ErrorMessages[ErrorCode.REQUIREMENTS_NOT_MET], ErrorCode.REQUIREMENTS_NOT_MET);
      }

      const existingAvatar = await this.avatarRepository.findUserAvatar(tx, userId, variantId);

      if (existingAvatar) {
        throw new BadRequestError(ErrorMessages[ErrorCode.ALREADY_CLAIMED], ErrorCode.ALREADY_CLAIMED);
      }

      const user = await this.userRepository.findById(tx, userId);
      if (!user) {
        throw new NotFoundError(ErrorMessages[ErrorCode.USER_NOT_FOUND], ErrorCode.USER_NOT_FOUND);
      }

      const costJltNum = variant.costJlt ? parseFloat(variant.costJlt.toString()) : 0;

      if (user.gp < variant.costGp || parseFloat(user.jlt.toString()) < costJltNum) {
        throw new BadRequestError(ErrorMessages[ErrorCode.INSUFFICIENT_GP], ErrorCode.INSUFFICIENT_GP);
      }

      // Deduct GP and log
      if (variant.costGp > 0) {
        await this.userRepository.update(tx, userId, {
          gp: { decrement: variant.costGp }
        });

        await this.ledgerRepository.createGpLedger(tx, {
          userId,
          type: LedgerType.DEBIT,
          amount: -variant.costGp,
          source: LedgerSource.CONVERSION, // Using CONVERSION for store purchases
          refId: variantId
        });
      }

      // Deduct JLT
      if (costJltNum > 0) {
        await this.userRepository.update(tx, userId, {
          jlt: { decrement: costJltNum }
        });
      }

      // Unlock avatar
      await this.avatarRepository.createUserAvatar(tx, {
        userId,
        variantId
      });

      return {
        success: true,
        message: 'Avatar unlocked successfully'
      };
    });
  }
}
