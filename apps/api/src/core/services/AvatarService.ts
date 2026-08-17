import { BadRequestError, NotFoundError } from '../errors/AppError';
import { ErrorCode, ErrorMessages } from '@jlt/constants';
import { LedgerSource, LedgerType } from '@jlt/database';

export class AvatarService {
  constructor(private prisma: any) {}

  async listAvatars(userId: string) {
    const [avatars, userAvatars, user] = await Promise.all([
      this.prisma.avatar.findMany({
        include: {
          variants: true
        }
      }),
      this.prisma.userAvatar.findMany({
        where: { userId }
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { activeAvatarVariantId: true }
      })
    ]);

    if (!user) {
      throw new NotFoundError(
        ErrorMessages[ErrorCode.USER_NOT_FOUND],
        ErrorCode.USER_NOT_FOUND
      );
    }

    const activeId = user.activeAvatarVariantId;
    const unlockedIds = new Set(userAvatars.map((ua: any) => ua.variantId));

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

  async selectAvatar(userId: string, variantId: string) {
    const variant = await this.prisma.avatarVariant.findUnique({
      where: { id: variantId },
      include: { avatar: true }
    });
    if (!variant) {
      throw new NotFoundError(
        ErrorMessages[ErrorCode.AVATAR_VARIANT_NOT_FOUND],
        ErrorCode.AVATAR_VARIANT_NOT_FOUND
      );
    }

    // Check if unlocked
    const userAvatar = await this.prisma.userAvatar.findUnique({
      where: {
        userId_variantId: { userId, variantId }
      }
    });

    if (!userAvatar) {
      throw new BadRequestError(
        ErrorMessages[ErrorCode.AVATAR_NOT_UNLOCKED],
        ErrorCode.AVATAR_NOT_UNLOCKED
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { activeAvatarVariantId: variantId }
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

  async unlockAvatar(userId: string, variantId: string) {
    return await this.prisma.$transaction(async (tx: any) => {
      const variant = await tx.avatarVariant.findUnique({
        where: { id: variantId },
        include: { avatar: true }
      });

      if (!variant) {
        throw new NotFoundError(
          ErrorMessages[ErrorCode.AVATAR_VARIANT_NOT_FOUND],
          ErrorCode.AVATAR_VARIANT_NOT_FOUND
        );
      }

      if (!variant.isPurchasable) {
        throw new BadRequestError(ErrorMessages[ErrorCode.REQUIREMENTS_NOT_MET], ErrorCode.REQUIREMENTS_NOT_MET);
      }

      const existingAvatar = await tx.userAvatar.findUnique({
        where: { userId_variantId: { userId, variantId } }
      });

      if (existingAvatar) {
        throw new BadRequestError(ErrorMessages[ErrorCode.ALREADY_CLAIMED], ErrorCode.ALREADY_CLAIMED);
      }

      const user = await tx.user.findUnique({
        where: { id: userId }
      });

      const costJltNum = variant.costJlt ? parseFloat(variant.costJlt.toString()) : 0;

      if (user.gp < variant.costGp || parseFloat(user.jlt.toString()) < costJltNum) {
        throw new BadRequestError(ErrorMessages[ErrorCode.INSUFFICIENT_GP], ErrorCode.INSUFFICIENT_GP);
      }

      // Deduct GP and log
      if (variant.costGp > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { gp: { decrement: variant.costGp } }
        });

        await tx.gpLedgerEntry.create({
          data: {
            userId,
            type: LedgerType.DEBIT,
            amount: -variant.costGp,
            source: LedgerSource.CONVERSION, // Using CONVERSION for store purchases for now
            refId: variantId
          }
        });
      }

      // Deduct JLT
      if (costJltNum > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { jlt: { decrement: costJltNum } }
        });
      }

      // Unlock avatar
      await tx.userAvatar.create({
        data: {
          userId,
          variantId
        }
      });

      return {
        success: true,
        message: 'Avatar unlocked successfully'
      };
    });
  }
}
