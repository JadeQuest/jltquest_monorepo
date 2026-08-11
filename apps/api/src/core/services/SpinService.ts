import { SpinRepository } from '../../infrastructure/database/repositories/SpinRepository';
import { LedgerService } from './LedgerService';
import { LedgerSource, SpinOutcome, RpXpSource } from '@jlt/database';
import { BadRequestError } from '../errors/AppError';
import { ErrorCode, ErrorMessages, APP_CONFIG } from '@jlt/constants';

export class SpinService {
  constructor(
    private spinRepository: SpinRepository,
    private ledgerService: LedgerService,
    private prisma: any
  ) {}

  async getStatus(userId: string) {
    const spinState = await this.spinRepository.findStateByUserId(this.prisma, userId);
    
    if (!spinState) {
      return { availableFreeSpins: APP_CONFIG.SPIN.FREE_SPINS_DEFAULT, lastFreeSpinAt: null, totalSpins: 0 };
    }

    const now = new Date();
    let freeSpins = spinState.availableFreeSpins ?? APP_CONFIG.SPIN.FREE_SPINS_DEFAULT;
    
    if (spinState.lastFreeSpinAt) {
      const lastSpinUTC = new Date(Date.UTC(spinState.lastFreeSpinAt.getUTCFullYear(), spinState.lastFreeSpinAt.getUTCMonth(), spinState.lastFreeSpinAt.getUTCDate()));
      const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const diffDays = Math.floor((todayUTC.getTime() - lastSpinUTC.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays >= 1) {
        freeSpins = APP_CONFIG.SPIN.FREE_SPINS_DEFAULT; // Reset to default at midnight UTC
      }
    } else {
       freeSpins = APP_CONFIG.SPIN.FREE_SPINS_DEFAULT;
    }

    return {
      availableFreeSpins: freeSpins,
      lastFreeSpinAt: spinState.lastFreeSpinAt,
      totalSpins: spinState.totalSpins
    };
  }

  async spin(userId: string, useFreeSpin: boolean) {
    return await this.prisma.$transaction(async (tx: any) => {
      let spinState = await this.spinRepository.findStateByUserId(tx, userId);
      
      const now = new Date();
      if (!spinState) {
        spinState = await tx.spinState.create({
          data: { userId, availableFreeSpins: APP_CONFIG.SPIN.FREE_SPINS_DEFAULT }
        });
      }

      let freeSpins = spinState.availableFreeSpins ?? APP_CONFIG.SPIN.FREE_SPINS_DEFAULT;
      if (spinState.lastFreeSpinAt) {
        const lastSpinUTC = new Date(Date.UTC(spinState.lastFreeSpinAt.getUTCFullYear(), spinState.lastFreeSpinAt.getUTCMonth(), spinState.lastFreeSpinAt.getUTCDate()));
        const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const diffDays = Math.floor((todayUTC.getTime() - lastSpinUTC.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays >= 1) {
          freeSpins = APP_CONFIG.SPIN.FREE_SPINS_DEFAULT;
        }
      } else {
         freeSpins = APP_CONFIG.SPIN.FREE_SPINS_DEFAULT;
      }

      if (useFreeSpin && freeSpins <= 0) {
        throw new BadRequestError(
          ErrorMessages[ErrorCode.INSUFFICIENT_SPINS],
          ErrorCode.INSUFFICIENT_SPINS
        );
      }

      const rand = Math.random();
      let outcome: SpinOutcome;
      let gpAwarded = 0;
      let fragmentsAwarded = 0;
      let xpAwarded = 0;
      let freeSpinAwarded = 0;
      let rpXpAwarded = 0;

      const rates = APP_CONFIG.SPIN.RATES;

      if (rand < rates.NOTHING) {
        outcome = (SpinOutcome as any).NOTHING || 'NOTHING';
      } else if (rand < rates.GP_20) {
        outcome = (SpinOutcome as any).GP_20 || 'GP_20';
        gpAwarded = 20;
      } else if (rand < rates.GP_50) {
        outcome = (SpinOutcome as any).GP_50 || 'GP_50';
        gpAwarded = 50;
      } else if (rand < rates.GP_100) {
        outcome = (SpinOutcome as any).GP_100 || 'GP_100';
        gpAwarded = 100;
      } else if (rand < rates.XP_20) {
        outcome = (SpinOutcome as any).XP_20 || 'XP_20';
        xpAwarded = 20;
      } else if (rand < rates.FRAGMENT_1) {
        outcome = (SpinOutcome as any).FRAGMENT_1 || 'FRAGMENT_1';
        fragmentsAwarded = 1;
      } else if (rand < rates.RP_XP_20) {
        outcome = (SpinOutcome as any).RP_XP_20 || 'RP_XP_20';
        rpXpAwarded = 20;
      } else {
        outcome = (SpinOutcome as any).FREE_SPIN_1 || 'FREE_SPIN_1';
        freeSpinAwarded = 1;
      }

      if (useFreeSpin) {
        await this.spinRepository.updateState(tx, userId, {
          availableFreeSpins: (freeSpins ?? APP_CONFIG.SPIN.FREE_SPINS_DEFAULT) - 1 + freeSpinAwarded,
          lastFreeSpinAt: now,
          totalSpins: (spinState.totalSpins || 0) + 1
        });
      } else {
        await this.spinRepository.updateState(tx, userId, {
          totalSpins: (spinState.totalSpins || 0) + 1
        });
      }

      await this.spinRepository.createHistory(tx, {
        userId,
        outcome,
        gpAwarded,
        usedFree: useFreeSpin
      });

      if (gpAwarded > 0) {
        await this.ledgerService.awardGp(tx, userId, gpAwarded, LedgerSource.SPIN);
      }

      if (xpAwarded > 0) {
        await this.ledgerService.awardXp(tx, userId, xpAwarded, LedgerSource.SPIN);
      }

      if (fragmentsAwarded > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { fragments: { increment: fragmentsAwarded } }
        });
      }

      // Award Rare Pass XP & update mission progress
      const { RarePassService } = require('./RarePassService');
      const rarePassService = new RarePassService(this.prisma);
      
      let finalRpXpAwarded = 0;
      if (rpXpAwarded > 0) {
        finalRpXpAwarded = await rarePassService.awardRpXp(
          tx,
          userId,
          rpXpAwarded,
          RpXpSource.SPIN,
          null,
          `spin_rpxp:${userId}:${now.toISOString()}`
        );
      }

      await rarePassService.updateMissionProgress(tx, userId, 'mission_spin_daily', 1);

      return {
        outcome,
        gpAwarded,
        xpAwarded,
        rpXpAwarded: finalRpXpAwarded,
        fragmentsAwarded,
        freeSpinAwarded
      };
    });
  }

  async purchase(userId: string) {
    const COST = APP_CONFIG.SPIN.COST_GP;
    return await this.prisma.$transaction(async (tx: any) => {
      const user = await tx.user.findUnique({ where: { id: userId }});
      if (!user || user.gp < COST) {
        throw new BadRequestError(
          ErrorMessages[ErrorCode.INSUFFICIENT_GP],
          ErrorCode.INSUFFICIENT_GP
        );
      }

      await tx.user.update({
        where: { id: userId },
        data: { gp: { decrement: COST } }
      });
      
      await tx.gpLedgerEntry.create({
        data: {
          userId,
          amount: -COST,
          type: 'DEBIT',
          source: 'SPIN_PURCHASE'
        }
      });

      return { success: true };
    });
  }
}
