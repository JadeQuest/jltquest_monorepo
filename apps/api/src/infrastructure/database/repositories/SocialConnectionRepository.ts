import { prisma } from '../prisma';

export class SocialConnectionRepository {
  async findManyByUserId(tx: any, userId: string) {
    const db = tx || prisma;
    return db.socialConnection.findMany({ where: { userId } });
  }

  async findActiveByUserId(tx: any, userId: string) {
    const db = tx || prisma;
    return db.socialConnection.findMany({ where: { userId, connected: true } });
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

  // Social Quests
  async findAllSocialQuests(tx: any) {
    const db = tx || prisma;
    return db.socialQuest.findMany({
      where: { isHidden: false }
    });
  }

  async findSocialQuestByIdOrCode(tx: any, questIdOrCode: string) {
    const db = tx || prisma;
    return db.socialQuest.findFirst({
      where: {
        OR: [
          { id: questIdOrCode },
          { code: questIdOrCode }
        ]
      }
    });
  }

  async findSocialQuestClaims(tx: any, connectionIds: string[]) {
    const db = tx || prisma;
    return db.socialQuestClaim.findMany({
      where: { socialConnectionId: { in: connectionIds } }
    });
  }

  async findSocialQuestClaim(tx: any, socialConnectionId: string, socialQuestId: string, periodKey: string) {
    const db = tx || prisma;
    return db.socialQuestClaim.findUnique({
      where: {
        socialConnectionId_socialQuestId_periodKey: {
          socialConnectionId,
          socialQuestId,
          periodKey
        }
      }
    });
  }

  async createSocialQuestClaim(tx: any, data: any) {
    const db = tx || prisma;
    return db.socialQuestClaim.create({ data });
  }
}
