import { BadRequestError, NotFoundError } from '../errors/AppError';
import { ErrorCode, ErrorMessages } from '@jlt/constants';

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
            active: v.id === activeId
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
}
