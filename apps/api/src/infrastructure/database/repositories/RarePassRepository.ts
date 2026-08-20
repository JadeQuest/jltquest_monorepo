import { prisma } from '../prisma';
import { RarePassSeasonStatus } from '@jlt/database';

export class RarePassRepository {
  async findActiveSeason(tx: any) {
    const db = tx || prisma;
    const now = new Date();
    return db.rarePassSeason.findFirst({
      where: {
        status: RarePassSeasonStatus.ACTIVE,
        startAt: { lte: now },
        endAt: { gte: now }
      },
      include: {
        levels: {
          orderBy: { level: 'asc' },
          include: {
            rewards: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      }
    });
  }

  async findSeasonById(tx: any, seasonId: string) {
    const db = tx || prisma;
    return db.rarePassSeason.findUnique({
      where: { id: seasonId },
      include: {
        levels: {
          orderBy: { level: 'asc' },
          include: {
            rewards: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      }
    });
  }

  async aggregateUserRpXp(tx: any, userId: string, seasonId: string) {
    const db = tx || prisma;
    return db.rpXpLedgerEntry.aggregate({
      _sum: { amount: true },
      where: { userId, seasonId }
    });
  }

  async findPurchase(tx: any, userId: string, seasonId: string) {
    const db = tx || prisma;
    return db.rarePassPurchase.findUnique({
      where: {
        userId_seasonId: { userId, seasonId }
      }
    });
  }

  async createPurchase(tx: any, data: any) {
    const db = tx || prisma;
    return db.rarePassPurchase.create({ data });
  }

  async createRpXpLedger(tx: any, data: any) {
    const db = tx || prisma;
    return db.rpXpLedgerEntry.create({ data });
  }

  async findRewardById(tx: any, rewardId: string) {
    const db = tx || prisma;
    return db.rarePassReward.findUnique({
      where: { id: rewardId },
      include: {
        level: {
          include: {
            season: true
          }
        }
      }
    });
  }

  async findRewardClaim(tx: any, userId: string, rewardId: string) {
    const db = tx || prisma;
    return db.rarePassRewardClaim.findUnique({
      where: {
        userId_rewardId: { userId, rewardId }
      }
    });
  }

  async createRewardClaim(tx: any, data: any) {
    const db = tx || prisma;
    return db.rarePassRewardClaim.create({ data });
  }

  async findUserRewardClaimsForSeason(tx: any, userId: string, seasonId: string) {
    const db = tx || prisma;
    return db.rarePassRewardClaim.findMany({
      where: { userId, seasonId }
    });
  }

  async findMissionsForSeason(tx: any, seasonId: string) {
    const db = tx || prisma;
    return db.rarePassMission.findMany({
      where: { seasonId }
    });
  }

  async findMissionByCode(tx: any, seasonId: string, code: string) {
    const db = tx || prisma;
    return db.rarePassMission.findFirst({
      where: { seasonId, code }
    });
  }

  async findMissionById(tx: any, missionId: string) {
    const db = tx || prisma;
    return db.rarePassMission.findUnique({
      where: { id: missionId },
      include: { season: true }
    });
  }

  async findMissionCompletions(tx: any, userId: string, missionIds: string[]) {
    const db = tx || prisma;
    return db.userRarePassMissionCompletion.findMany({
      where: {
        userId,
        missionId: { in: missionIds }
      }
    });
  }

  async findMissionCompletion(tx: any, userId: string, missionId: string, periodKey: string) {
    const db = tx || prisma;
    return db.userRarePassMissionCompletion.findUnique({
      where: {
        userId_missionId_periodKey: {
          userId,
          missionId,
          periodKey
        }
      }
    });
  }

  async upsertMissionCompletion(tx: any, userId: string, missionId: string, periodKey: string, progress: number, targetCount: number) {
    const db = tx || prisma;
    const isCompleted = progress >= targetCount;
    return db.userRarePassMissionCompletion.upsert({
      where: {
        userId_missionId_periodKey: {
          userId,
          missionId,
          periodKey
        }
      },
      update: {
        progress,
        completed: isCompleted
      },
      create: {
        userId,
        missionId,
        periodKey,
        progress,
        completed: isCompleted
      }
    });
  }

  async updateMissionCompletion(tx: any, id: string, data: any) {
    const db = tx || prisma;
    return db.userRarePassMissionCompletion.update({
      where: { id },
      data
    });
  }

  async aggregateSeasonRpXpPerUser(tx: any, seasonId: string) {
    const db = tx || prisma;
    return db.rpXpLedgerEntry.groupBy({
      by: ['userId'],
      where: { seasonId },
      _sum: { amount: true }
    });
  }
}
