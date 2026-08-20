import { StreakRepository } from '../../infrastructure/database/repositories/StreakRepository';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { AuditLogRepository } from '../../infrastructure/database/repositories/AuditLogRepository';
import { LedgerService } from './LedgerService';
import { RarePassService } from './RarePassService';
import { LedgerSource, RpXpSource } from '@jlt/database';
import { ConflictError, NotFoundError } from '../errors/AppError';
import { ErrorCode, ErrorMessages, APP_CONFIG } from '@jlt/constants';
import type { CheckInStatusDto, CheckInClaimResultDto } from '@jlt/types';

export class CheckInService {
  constructor(
    private streakRepository: StreakRepository,
    private userRepository: UserRepository,
    private ledgerService: LedgerService,
    private rarePassService: RarePassService,
    private auditLogRepository: AuditLogRepository,
    private prisma: any
  ) {}

  async getStatus(userId: string): Promise<CheckInStatusDto> {
    const [user, streak] = await Promise.all([
      this.userRepository.findById(this.prisma, userId),
      this.streakRepository.findByUserId(this.prisma, userId)
    ]);
    if (!user) {
      throw new NotFoundError(ErrorMessages[ErrorCode.USER_NOT_FOUND], ErrorCode.USER_NOT_FOUND);
    }

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

  async claim(userId: string): Promise<CheckInClaimResultDto> {
    return await this.prisma.$transaction(
      async (tx: any) => {
        // 1. Lock the user row to prevent concurrent race conditions
        await tx.$executeRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;

        const user = await this.userRepository.findById(tx, userId);
        if (!user) {
          throw new NotFoundError(ErrorMessages[ErrorCode.USER_NOT_FOUND], ErrorCode.USER_NOT_FOUND);
        }

        const streak = await this.streakRepository.findByUserId(tx, userId);
        const now = new Date();

        let canClaim = true;
        let newStreakValue = 1;

        if (streak) {
          const lastDate = streak.lastCheckInAt || new Date(0);
          const lastClaim = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const diffDays = Math.floor((today.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24));

          canClaim = diffDays >= 1;
          if (!canClaim) {
            throw new ConflictError(
              ErrorMessages[ErrorCode.ALREADY_CLAIMED],
              ErrorCode.ALREADY_CLAIMED
            );
          }

          newStreakValue = diffDays > 1 ? 1 : streak.currentDay + 1;
          const currentLongest = (streak as any).longestStreak || streak.currentDay || 0;
          const newLongest = Math.max(currentLongest, newStreakValue);

          await this.streakRepository.update(tx, userId, {
            currentDay: newStreakValue,
            longestStreak: newLongest,
            lastCheckInDate: now,
            lastCheckInAt: now,
          });
        } else {
          await this.streakRepository.create(tx, {
            userId,
            currentDay: 1,
            longestStreak: 1,
            lastCheckInDate: now,
            lastCheckInAt: now,
          });
        }

        const gpAwarded = APP_CONFIG.CHECKIN.DAILY_REWARD_GP;
        const xpAwarded = APP_CONFIG.CHECKIN.DAILY_REWARD_XP;

        await this.ledgerService.awardGp(tx, userId, gpAwarded, LedgerSource.CHECKIN);
        await this.ledgerService.awardXp(tx, userId, xpAwarded, LedgerSource.CHECKIN);

        // Award RP XP & update missions
        const rpXpAmount = newStreakValue === 7 ? 50 : 10;
        const todayStr = now.toISOString().split('T')[0];

        const rpXpAwarded = await this.rarePassService.awardRpXp(
          tx,
          userId,
          rpXpAmount,
          RpXpSource.DAILY_CHECKIN,
          undefined,
          `checkin_rpxp:${userId}:${newStreakValue}:${todayStr}`
        );

        await this.rarePassService.updateMissionProgress(tx, userId, 'mission_checkin_daily', 1);

        // Create Audit Log
        await this.auditLogRepository.log(tx, {
          userId,
          action: 'CHECKIN_CLAIM',
          metadata: { streak: newStreakValue, gpAwarded, xpAwarded }
        });

        return {
          gpAwarded,
          xpAwarded,
          rpXpAwarded,
          newStreak: newStreakValue
        };
      },
      { maxWait: 10000, timeout: 20000 }
    );
  }
}
