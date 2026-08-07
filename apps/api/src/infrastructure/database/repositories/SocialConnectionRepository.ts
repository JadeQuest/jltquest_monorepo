import { prisma } from '../prisma';

export class SocialConnectionRepository {
  async findManyByUserId(tx: any, userId: string) {
    const db = tx || prisma;
    return db.socialConnection.findMany({ where: { userId } });
  }

  async findByPlatformAndUserId(tx: any, platform: any, platformUserId: string) {
    const db = tx || prisma;
    return db.socialConnection.findUnique({
      where: { platform_platformUserId: { platform, platformUserId } }
    });
  }

  async findByUserAndPlatform(tx: any, userId: string, platform: any) {
    const db = tx || prisma;
    return db.socialConnection.findUnique({
      where: { userId_platform: { userId, platform } }
    });
  }

  async update(tx: any, id: string, data: any) {
    const db = tx || prisma;
    return db.socialConnection.update({
      where: { id },
      data
    });
  }

  async create(tx: any, data: any) {
    const db = tx || prisma;
    return db.socialConnection.create({ data });
  }
}

