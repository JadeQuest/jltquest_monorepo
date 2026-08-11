import { StreakRepository } from '../../infrastructure/database/repositories/StreakRepository';
import { LedgerService } from './LedgerService';
import { LedgerSource, RpXpSource } from '@jlt/database';
import { ConflictError } from '../errors/AppError';
import { ErrorCode, ErrorMessages, APP_CONFIG } from '@jlt/constants';

export class CheckInService {
  constructor(
    private streakRepository: StreakRepository,
    private ledgerService: LedgerService,
    private prisma: any
  ) {}

  async getStatus(userId: string) {
    const streak = await this.streakRepository.findByUserId(this.prisma, userId);
    
    const nextRewardGp = APP_CONFIG.CHECKIN.DAILY_REWARD_GP;
    const nextRewardXp = APP_CONFIG.CHECKIN.DAILY_REWARD_XP;

    if (!streak) {
      return { streak: 0, canClaim: true, nextRewardGp, nextRewardXp };
    }

    const now = new Date();
    const lastDate = streak.lastCheckInAt || new Date(0);
    const lastClaim = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((today.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24));
    
    const canClaim = diffDays >= 1;
    let currentStreak = streak.currentDay;
    if (diffDays > 1) {
      currentStreak = 0;
    }

    return {
      streak: currentStreak,
      canClaim,
      nextRewardGp,
      nextRewardXp
    };
  }

  async claim(userId: string) {
    const status = await this.getStatus(userId);
    if (!status.canClaim) {
      throw new ConflictError(
        ErrorMessages[ErrorCode.ALREADY_CLAIMED],
        ErrorCode.ALREADY_CLAIMED
      );
    }

    const gpAwarded = status.nextRewardGp;
    const xpAwarded = status.nextRewardXp;

    return await this.prisma.$transaction(async (tx: any) => {
      let streak = await this.streakRepository.findByUserId(tx, userId);
      let newStreakValue = streak ? (streak.currentDay + 1) : 1;
      
      const now = new Date();
      if (streak) {
        const lastDate = streak.lastCheckInAt || new Date(0);
        const lastClaim = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const diffDays = Math.floor((today.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 1) newStreakValue = 1;

        await this.streakRepository.update(tx, userId, {
          currentDay: newStreakValue,
          lastCheckInDate: now,
          lastCheckInAt: now
        });
      } else {
        await tx.streak.create({
          data: { userId, currentDay: 1, lastCheckInDate: now, lastCheckInAt: now }
        });
      }

      await this.ledgerService.awardGp(tx, userId, gpAwarded, LedgerSource.CHECKIN);
      await this.ledgerService.awardXp(tx, userId, xpAwarded, LedgerSource.CHECKIN);

      // Award RP XP & update missions
      const { RarePassService } = require('./RarePassService');
      const rarePassService = new RarePassService(this.prisma);
      const rpXpAmount = newStreakValue === 7 ? 50 : 10;
      const todayStr = now.toISOString().split('T')[0];

      const rpXpAwarded = await rarePassService.awardRpXp(
        tx,
        userId,
        rpXpAmount,
        RpXpSource.DAILY_CHECKIN,
        null,
        `checkin_rpxp:${userId}:${newStreakValue}:${todayStr}`
      );

      await rarePassService.updateMissionProgress(tx, userId, 'mission_checkin_daily', 1);

      return {
        gpAwarded,
        xpAwarded,
        rpXpAwarded,
        newStreak: newStreakValue
      };
    });
  }
}
