import { StreakRepository } from '../../infrastructure/database/repositories/StreakRepository';
import { LedgerService } from './LedgerService';
import { LedgerSource } from '@jlt/database';

export class CheckInService {
  constructor(
    private streakRepository: StreakRepository,
    private ledgerService: LedgerService,
    private prisma: any // passing prisma instance directly to initiate transactions
  ) {}

  async getStatus(userId: string) {
    const streak = await this.streakRepository.findByUserId(this.prisma, userId);
    
    if (!streak) {
      return { streak: 0, canClaim: true, nextRewardGp: 50, nextRewardXp: 50 };
    }

    const now = new Date();
    const lastDate = streak.lastCheckInAt || new Date(0);
    const lastClaimUTC = new Date(Date.UTC(lastDate.getUTCFullYear(), lastDate.getUTCMonth(), lastDate.getUTCDate()));
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const diffDays = Math.floor((todayUTC.getTime() - lastClaimUTC.getTime()) / (1000 * 60 * 60 * 24));
    
    const canClaim = diffDays >= 1;
    let nextStreak = streak.currentDay;
    if (diffDays > 1) {
      nextStreak = 0; // streak broken
    } else if (canClaim) {
      nextStreak++;
    }

    const nextRewardGp = 50;
    const nextRewardXp = 50;

    return {
      streak: streak.currentDay,
      canClaim,
      nextRewardGp,
      nextRewardXp
    };
  }

  async claim(userId: string) {
    const status = await this.getStatus(userId);
    if (!status.canClaim) throw { code: 'ALREADY_CLAIMED', message: 'You have already checked in today.' };

    const gpAwarded = status.nextRewardGp;
    const xpAwarded = status.nextRewardXp;

    return await this.prisma.$transaction(async (tx: any) => {
      let streak = await this.streakRepository.findByUserId(tx, userId);
      let newStreakValue = streak ? (streak.currentDay + 1) : 1;
      
      const now = new Date();
      if (streak) {
        const lastDate = streak.lastCheckInAt || new Date(0);
        const lastClaimUTC = new Date(Date.UTC(lastDate.getUTCFullYear(), lastDate.getUTCMonth(), lastDate.getUTCDate()));
        const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const diffDays = Math.floor((todayUTC.getTime() - lastClaimUTC.getTime()) / (1000 * 60 * 60 * 24));
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

      return {
        gpAwarded,
        xpAwarded,
        newStreak: newStreakValue
      };
    });
  }
}
