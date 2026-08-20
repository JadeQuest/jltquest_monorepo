import { prisma } from '../prisma';

export class AvatarRepository {
  async findAllAvatarsWithVariants(tx: any) {
    const db = tx || prisma;
    return db.avatar.findMany({
      include: {
        variants: true,
      },
    });
  }

  async findUserAvatars(tx: any, userId: string) {
    const db = tx || prisma;
    return db.userAvatar.findMany({
      where: { userId },
    });
  }

  async findVariantById(tx: any, variantId: string) {
    const db = tx || prisma;
    return db.avatarVariant.findUnique({
      where: { id: variantId },
      include: { avatar: true },
    });
  }

  async findUserAvatar(tx: any, userId: string, variantId: string) {
    const db = tx || prisma;
    return db.userAvatar.findUnique({
      where: {
        userId_variantId: { userId, variantId },
      },
    });
  }

  async createUserAvatar(tx: any, data: any) {
    const db = tx || prisma;
    return db.userAvatar.create({ data });
  }

  async createManyUserAvatars(tx: any, data: any[]) {
    const db = tx || prisma;
    return db.userAvatar.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async upsertUserAvatar(tx: any, userId: string, variantId: string) {
    const db = tx || prisma;
    return db.userAvatar.upsert({
      where: { userId_variantId: { userId, variantId } },
      update: {},
      create: { userId, variantId },
    });
  }

  async findNewlyUnlockedVariants(tx: any, previousLevel: number, newLevel: number) {
    const db = tx || prisma;
    return db.avatarVariant.findMany({
      where: {
        unlockLevel: {
          gt: previousLevel,
          lte: newLevel,
        },
      },
    });
  }
}
