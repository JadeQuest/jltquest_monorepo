import { BadRequestError, ConflictError, NotFoundError } from '../errors/AppError';
import { ErrorCode, ErrorMessages, APP_CONFIG } from '@jlt/constants';
import { RarePassSeasonStatus, RarePassTrack, RarePassRewardType, RpXpSource, RarePassMissionType, LedgerSource } from '@jlt/database';

export class RarePassService {
  constructor(private prisma: any) {}

  async getActiveSeason(tx?: any) {
    const db = tx || this.prisma;
    const now = new Date();
    const season = await db.rarePassSeason.findFirst({
      where: {
        status: RarePassSeasonStatus.ACTIVE,
        startAt: { lte: now },
        endAt: { gte: now }
      },
      include: {
        levels: {
          orderBy: { level: 'asc' }
        }
      }
    });
    if (!season) {
      throw new NotFoundError(
        ErrorMessages[ErrorCode.SEASON_NOT_ACTIVE],
        ErrorCode.SEASON_NOT_ACTIVE
      );
    }
    return season;
  }

  async getPassStatus(userId: string) {
    const season = await this.getActiveSeason();
    
    // Sum user's total RP XP earned in this season
    const ledgerSum = await this.prisma.rpXpLedgerEntry.aggregate({
      _sum: { amount: true },
      where: { userId, seasonId: season.id }
    });
    const totalRpXp = ledgerSum._sum.amount || 0;

    // Find the user's current level
    let currentLevel = 1;
    for (const levelConfig of season.levels) {
      if (totalRpXp >= levelConfig.requiredRpXp) {
        currentLevel = levelConfig.level;
      } else {
        break;
      }
    }

    const nextLevelConfig = season.levels.find((l: any) => l.level === currentLevel + 1);
    const currentLevelConfig = season.levels.find((l: any) => l.level === currentLevel);
    
    const xpInCurrentLevel = totalRpXp - (currentLevelConfig?.requiredRpXp || 0);
    const xpRequiredForNext = nextLevelConfig 
      ? (nextLevelConfig.requiredRpXp - (currentLevelConfig?.requiredRpXp || 0))
      : 0;

    const progress = nextLevelConfig && xpRequiredForNext > 0
      ? (xpInCurrentLevel / xpRequiredForNext) * 100
      : 100;

    const purchase = await this.prisma.rarePassPurchase.findUnique({
      where: {
        userId_seasonId: { userId, seasonId: season.id }
      }
    });
    const isPremium = !!purchase;

    return {
      season: {
        id: season.id,
        name: season.name,
        startAt: season.startAt,
        endAt: season.endAt,
        maxLevel: season.maxLevel
      },
      progression: {
        totalRpXp,
        currentLevel,
        xpInCurrentLevel,
        xpRequiredForNext,
        progress,
        isPremium
      }
    };
  }

  async getRewards(userId: string) {
    const status = await this.getPassStatus(userId);
    const seasonId = status.season.id;
    const userLevel = status.progression.currentLevel;
    const isPremium = status.progression.isPremium;

    const levelsWithRewards = await this.prisma.rarePassLevel.findMany({
      where: { seasonId },
      include: {
        rewards: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { level: 'asc' }
    });

    const claims = await this.prisma.rarePassRewardClaim.findMany({
      where: { userId, seasonId }
    });
    const claimedRewardIds = new Set(claims.map((c: any) => c.rewardId));

    return levelsWithRewards.map((levelConfig: any) => {
      return {
        level: levelConfig.level,
        requiredRpXp: levelConfig.requiredRpXp,
        rewards: levelConfig.rewards.map((reward: any) => {
          const isClaimed = claimedRewardIds.has(reward.id);
          const levelMet = userLevel >= levelConfig.level;
          const trackMet = reward.track === RarePassTrack.FREE || isPremium;
          const isClaimable = !isClaimed && levelMet && trackMet;

          return {
            id: reward.id,
            track: reward.track,
            rewardType: reward.rewardType,
            amount: reward.amount,
            metadata: reward.metadata,
            isClaimed,
            isClaimable
          };
        })
      };
    });
  }

  async claimReward(userId: string, rewardId: string) {
    return await this.prisma.$transaction(async (tx: any) => {
      const season = await this.getActiveSeason(tx);
      
      const reward = await tx.rarePassReward.findUnique({
        where: { id: rewardId },
        include: {
          level: true
        }
      });

      if (!reward || reward.level.seasonId !== season.id) {
        throw new NotFoundError(
          ErrorMessages[ErrorCode.REWARD_NOT_FOUND],
          ErrorCode.REWARD_NOT_FOUND
        );
      }

      // Check if already claimed
      const existingClaim = await tx.rarePassRewardClaim.findUnique({
        where: {
          userId_rewardId: { userId, rewardId }
        }
      });
      if (existingClaim) {
        throw new ConflictError(
          ErrorMessages[ErrorCode.REWARD_ALREADY_CLAIMED],
          ErrorCode.REWARD_ALREADY_CLAIMED
        );
      }

      // Calculate user's current level
      const ledgerSum = await tx.rpXpLedgerEntry.aggregate({
        _sum: { amount: true },
        where: { userId, seasonId: season.id }
      });
      const totalRpXp = ledgerSum._sum.amount || 0;

      let userLevel = 1;
      for (const levelConfig of season.levels) {
        if (totalRpXp >= levelConfig.requiredRpXp) {
          userLevel = levelConfig.level;
        } else {
          break;
        }
      }

      if (userLevel < reward.level.level) {
        throw new BadRequestError(
          ErrorMessages[ErrorCode.REWARD_LEVEL_NOT_REACHED],
          ErrorCode.REWARD_LEVEL_NOT_REACHED
        );
      }

      if (reward.track === RarePassTrack.PREMIUM) {
        const purchase = await tx.rarePassPurchase.findUnique({
          where: {
            userId_seasonId: { userId, seasonId: season.id }
          }
        });
        if (!purchase) {
          throw new BadRequestError(
            ErrorMessages[ErrorCode.PREMIUM_NOT_PURCHASED],
            ErrorCode.PREMIUM_NOT_PURCHASED
          );
        }
      }

      // Create the claim record
      await tx.rarePassRewardClaim.create({
        data: {
          userId,
          seasonId: season.id,
          rewardId
        }
      });

      // Grant actual reward
      let grantDetails: any = { type: reward.rewardType, amount: reward.amount };

      const { LedgerService } = require('./LedgerService');
      const { LedgerRepository } = require('../../infrastructure/database/repositories/LedgerRepository');
      const ledgerService = new LedgerService(new LedgerRepository());

      if (reward.rewardType === RarePassRewardType.GP) {
        await ledgerService.awardGp(tx, userId, reward.amount || 0, 'RARE_PASS' as any, reward.id);
      } else if (reward.rewardType === RarePassRewardType.XP) {
        await ledgerService.awardXp(tx, userId, reward.amount || 0, 'RARE_PASS' as any, reward.id);
      } else if (reward.rewardType === RarePassRewardType.FRAGMENT) {
        await tx.user.update({
          where: { id: userId },
          data: { fragments: { increment: reward.amount || 0 } }
        });
      } else if (reward.rewardType === RarePassRewardType.SPIN) {
        const spinState = await tx.spinState.findUnique({ where: { userId } });
        if (spinState) {
          await tx.spinState.update({
            where: { userId },
            data: { availableFreeSpins: { increment: reward.amount || 0 } }
          });
        } else {
          await tx.spinState.create({
            data: { userId, availableFreeSpins: reward.amount || 0 }
          });
        }
      } else if (reward.rewardType === RarePassRewardType.CARD) {
        // Pick a random card or specific if defined in metadata
        let cardId = reward.metadata && (reward.metadata as any).cardId;
        if (!cardId) {
          const allCards = await tx.rareCard.findMany();
          if (allCards.length === 0) {
            throw new NotFoundError(
              ErrorMessages[ErrorCode.NO_CARDS_AVAILABLE],
              ErrorCode.NO_CARDS_AVAILABLE
            );
          }
          const randomIndex = Math.floor(Math.random() * allCards.length);
          cardId = allCards[randomIndex].id;
        }

        const existingUserCard = await tx.userCard.findUnique({
          where: { userId_cardId: { userId, cardId } }
        });

        let cardResult;
        if (existingUserCard) {
          cardResult = await tx.userCard.update({
            where: { id: existingUserCard.id },
            data: { quantity: { increment: 1 } },
            include: { card: true }
          });
        } else {
          cardResult = await tx.userCard.create({
            data: { userId, cardId, quantity: 1 },
            include: { card: true }
          });
        }
        grantDetails.card = {
          id: cardResult.card.id,
          name: cardResult.card.name,
          imageUrl: cardResult.card.imageUrl
        };
      } else if (reward.rewardType === RarePassRewardType.AVATAR) {
        const variantId = reward.metadata && (reward.metadata as any).variantId;
        if (!variantId) {
          throw new BadRequestError('Avatar variant ID missing in reward metadata.');
        }

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

        const existingUserAvatar = await tx.userAvatar.findUnique({
          where: { userId_variantId: { userId, variantId } }
        });

        if (!existingUserAvatar) {
          await tx.userAvatar.create({
            data: { userId, variantId }
          });
        }

        grantDetails.avatar = {
          variantId,
          type: variant.type,
          name: variant.avatar.name,
          characterKey: variant.avatar.characterKey
        };
      }

      return {
        success: true,
        grantDetails
      };
    });
  }

  async awardRpXp(tx: any, userId: string, amount: number, source: RpXpSource, sourceId?: string, idempotencyKey?: string) {
    const db = tx || this.prisma;
    
    // Check if season active
    let season;
    try {
      season = await this.getActiveSeason(db);
    } catch (e) {
      // No active season, do not award
      return 0;
    }

    if (idempotencyKey) {
      const existing = await db.rpXpLedgerEntry.findUnique({
        where: { userId_idempotencyKey: { userId, idempotencyKey } }
      });
      if (existing) {
        return 0;
      }
    }

    // Check Caps
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    const dayOfWeek = now.getUTCDay();
    const diffToMonday = now.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diffToMonday));

    const [dailySum, weeklySum] = await Promise.all([
      db.rpXpLedgerEntry.aggregate({
        _sum: { amount: true },
        where: {
          userId,
          seasonId: season.id,
          createdAt: { gte: startOfDay, lte: endOfDay }
        }
      }),
      db.rpXpLedgerEntry.aggregate({
        _sum: { amount: true },
        where: {
          userId,
          seasonId: season.id,
          createdAt: { gte: startOfWeek }
        }
      })
    ]);

    const currentDailyXp = dailySum._sum.amount || 0;
    const currentWeeklyXp = weeklySum._sum.amount || 0;

    let allowedAmount = amount;
    const dailyCap = APP_CONFIG.RARE_PASS.DAILY_CAP_RP_XP;
    const weeklyCap = APP_CONFIG.RARE_PASS.WEEKLY_CAP_RP_XP;

    if (currentDailyXp + allowedAmount > dailyCap) {
      allowedAmount = dailyCap - currentDailyXp;
    }
    if (currentWeeklyXp + allowedAmount > weeklyCap) {
      allowedAmount = weeklyCap - currentWeeklyXp;
    }

    if (allowedAmount <= 0) {
      return 0;
    }

    await db.rpXpLedgerEntry.create({
      data: {
        userId,
        seasonId: season.id,
        amount: allowedAmount,
        source,
        sourceId,
        idempotencyKey
      }
    });

    return allowedAmount;
  }

  async buyPremium(userId: string) {
    const season = await this.getActiveSeason();
    const COST = APP_CONFIG.RARE_PASS.PREMIUM_COST_GP;
    
    return await this.prisma.$transaction(async (tx: any) => {
      // 1. Lock user row to prevent race conditions
      await tx.$executeRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;

      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundError(ErrorMessages[ErrorCode.USER_NOT_FOUND], ErrorCode.USER_NOT_FOUND);
      }

      // Check if already premium
      const existingPurchase = await tx.rarePassPurchase.findUnique({
        where: {
          userId_seasonId: {
            userId,
            seasonId: season.id
          }
        }
      });

      if (existingPurchase) {
        return { success: true, message: 'Already premium' };
      }

      // Verify GP balance
      if (user.gp < COST) {
        throw new BadRequestError(
          ErrorMessages[ErrorCode.INSUFFICIENT_GP],
          ErrorCode.INSUFFICIENT_GP
        );
      }

      // Debit GP
      await tx.user.update({
        where: { id: userId },
        data: { gp: { decrement: COST } }
      });

      // Create GP ledger debit
      await tx.gpLedgerEntry.create({
        data: {
          userId,
          amount: -COST,
          type: 'DEBIT',
          source: LedgerSource.RARE_PASS,
          refId: season.id
        }
      });

      // Create Rare Pass purchase
      await tx.rarePassPurchase.create({
        data: {
          userId,
          seasonId: season.id
        }
      });

      // Log audit trail
      await tx.auditLog.create({
        data: {
          userId,
          action: 'RARE_PASS_PREMIUM_PURCHASE',
          metadata: { cost: COST, seasonId: season.id }
        }
      });

      return { success: true };
    });
  }

  async getMissions(userId: string) {
    const season = await this.getActiveSeason();
    
    const missions = await this.prisma.rarePassMission.findMany({
      where: { seasonId: season.id }
    });

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
    
    const dayOfWeek = now.getUTCDay();
    const diffToMonday = now.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diffToMonday));
    // Simple week representation: e.g. "2026-W32"
    const getWeekKey = (d: Date) => {
      const oneJan = new Date(d.getFullYear(), 0, 1);
      const numberOfDays = Math.floor((d.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
      const result = Math.ceil((d.getDay() + 1 + numberOfDays) / 7);
      return `${d.getFullYear()}-W${String(result).padStart(2, '0')}`;
    };
    const weekStr = getWeekKey(now);

    const completionRecords = await this.prisma.userRarePassMissionCompletion.findMany({
      where: {
        userId,
        missionId: { in: missions.map((m: any) => m.id) }
      }
    });

    return missions.map((mission: any) => {
      let periodKey = 'ALL';
      if (mission.type === RarePassMissionType.DAILY) {
        periodKey = todayStr;
      } else if (mission.type === RarePassMissionType.WEEKLY) {
        periodKey = weekStr;
      }

      const record = completionRecords.find(
        (r: any) => r.missionId === mission.id && r.periodKey === periodKey
      );

      const progress = record ? record.progress : 0;
      const completed = record ? record.completed : false;

      return {
        id: mission.id,
        code: mission.code,
        name: mission.name,
        description: mission.description,
        rpXpReward: mission.rpXpReward,
        type: mission.type,
        targetCount: mission.targetCount,
        progress: Math.min(progress, mission.targetCount),
        completed,
        canClaim: progress >= mission.targetCount && !completed
      };
    });
  }

  async claimMission(userId: string, missionId: string) {
    return await this.prisma.$transaction(async (tx: any) => {
      const season = await this.getActiveSeason(tx);
      const mission = await tx.rarePassMission.findUnique({
        where: { id: missionId }
      });
      if (!mission || mission.seasonId !== season.id) {
        throw new NotFoundError(
          ErrorMessages[ErrorCode.MISSION_NOT_FOUND],
          ErrorCode.MISSION_NOT_FOUND
        );
      }

      const now = new Date();
      let periodKey = 'ALL';
      const todayStr = now.toISOString().split('T')[0];
      
      const getWeekKey = (d: Date) => {
        const oneJan = new Date(d.getFullYear(), 0, 1);
        const numberOfDays = Math.floor((d.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
        const result = Math.ceil((d.getDay() + 1 + numberOfDays) / 7);
        return `${d.getFullYear()}-W${String(result).padStart(2, '0')}`;
      };

      if (mission.type === RarePassMissionType.DAILY) {
        periodKey = todayStr;
      } else if (mission.type === RarePassMissionType.WEEKLY) {
        periodKey = getWeekKey(now);
      }

      const completion = await tx.userRarePassMissionCompletion.findUnique({
        where: {
          userId_missionId_periodKey: { userId, missionId, periodKey }
        }
      });

      if (!completion || completion.progress < mission.targetCount) {
        throw new BadRequestError(
          ErrorMessages[ErrorCode.REQUIREMENTS_NOT_MET],
          ErrorCode.REQUIREMENTS_NOT_MET
        );
      }

      if (completion.completed) {
        throw new ConflictError(
          ErrorMessages[ErrorCode.MISSION_ALREADY_COMPLETED],
          ErrorCode.MISSION_ALREADY_COMPLETED
        );
      }

      const updated = await tx.userRarePassMissionCompletion.update({
        where: { id: completion.id },
        data: {
          completed: true,
          rpXpAwarded: mission.rpXpReward
        }
      });

      const awarded = await this.awardRpXp(
        tx,
        userId,
        mission.rpXpReward,
        RpXpSource.QUEST,
        mission.id,
        `mission_claim:${userId}:${mission.id}:${periodKey}`
      );

      return {
        success: true,
        rpXpAwarded: awarded
      };
    });
  }

  async updateMissionProgress(tx: any, userId: string, missionCode: string, increment: number) {
    const db = tx || this.prisma;

    // Check active season
    let season;
    try {
      season = await this.getActiveSeason(db);
    } catch (e) {
      return;
    }

    const mission = await db.rarePassMission.findFirst({
      where: { seasonId: season.id, code: missionCode }
    });
    if (!mission) {
      return;
    }

    const now = new Date();
    let periodKey = 'ALL';
    const todayStr = now.toISOString().split('T')[0];
    
    const getWeekKey = (d: Date) => {
      const oneJan = new Date(d.getFullYear(), 0, 1);
      const numberOfDays = Math.floor((d.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
      const result = Math.ceil((d.getDay() + 1 + numberOfDays) / 7);
      return `${d.getFullYear()}-W${String(result).padStart(2, '0')}`;
    };

    if (mission.type === RarePassMissionType.DAILY) {
      periodKey = todayStr;
    } else if (mission.type === RarePassMissionType.WEEKLY) {
      periodKey = getWeekKey(now);
    }

    const completion = await db.userRarePassMissionCompletion.findUnique({
      where: {
        userId_missionId_periodKey: { userId, missionId: mission.id, periodKey }
      }
    });

    if (completion && completion.completed) {
      return;
    }

    if (completion) {
      const newProgress = completion.progress + increment;
      await db.userRarePassMissionCompletion.update({
        where: { id: completion.id },
        data: {
          progress: newProgress
        }
      });
    } else {
      await db.userRarePassMissionCompletion.create({
        data: {
          userId,
          missionId: mission.id,
          periodKey,
          progress: increment,
          completed: false
        }
      });
    }
  }
}
