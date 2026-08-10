import { SpinRepository } from '../../infrastructure/database/repositories/SpinRepository';
import { LedgerService } from './LedgerService';
import { LedgerSource, SpinOutcome } from '@jlt/database';

export class SpinService {
  constructor(
    private spinRepository: SpinRepository,
    private ledgerService: LedgerService,
    private prisma: any
  ) {}

  async getStatus(userId: string) {
    const spinState = await this.spinRepository.findStateByUserId(this.prisma, userId);
    
    if (!spinState) {
      return { availableFreeSpins: 1, lastFreeSpinAt: null, totalSpins: 0 };
    }

    const now = new Date();
    let freeSpins = spinState.availableFreeSpins ?? 1;
    
    if (spinState.lastFreeSpinAt) {
      const lastSpinUTC = new Date(Date.UTC(spinState.lastFreeSpinAt.getUTCFullYear(), spinState.lastFreeSpinAt.getUTCMonth(), spinState.lastFreeSpinAt.getUTCDate()));
      const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const diffDays = Math.floor((todayUTC.getTime() - lastSpinUTC.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays >= 1) {
        freeSpins = 1; // Reset to 1 at midnight UTC
      }
    } else {
       freeSpins = 1;
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
          data: { userId, availableFreeSpins: 1 }
        });
      }

      let freeSpins = spinState.availableFreeSpins ?? 1;
      if (spinState.lastFreeSpinAt) {
        const lastSpinUTC = new Date(Date.UTC(spinState.lastFreeSpinAt.getUTCFullYear(), spinState.lastFreeSpinAt.getUTCMonth(), spinState.lastFreeSpinAt.getUTCDate()));
        const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const diffDays = Math.floor((todayUTC.getTime() - lastSpinUTC.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays >= 1) {
          freeSpins = 1;
        }
      } else {
         freeSpins = 1;
      }

      if (useFreeSpin && freeSpins <= 0) {
        throw { code: 'INSUFFICIENT_SPINS', message: 'No free spins available.' };
      }

      const rand = Math.random();
      let outcome: SpinOutcome;
      let gpAwarded = 0;
      let fragmentsAwarded = 0;
      let xpAwarded = 0;
      let freeSpinAwarded = 0;

      if (rand < 0.20) {
        outcome = SpinOutcome.NOTHING;
      } else if (rand < 0.45) {
        outcome = SpinOutcome.GP_20;
        gpAwarded = 20;
      } else if (rand < 0.60) {
        outcome = SpinOutcome.GP_50;
        gpAwarded = 50;
      } else if (rand < 0.70) {
        outcome = SpinOutcome.GP_100;
        gpAwarded = 100;
      } else if (rand < 0.80) {
        outcome = SpinOutcome.XP_20;
        xpAwarded = 20;
      } else if (rand < 0.90) {
        outcome = SpinOutcome.FRAGMENT_1;
        fragmentsAwarded = 1;
      } else {
        outcome = SpinOutcome.FREE_SPIN_1;
        freeSpinAwarded = 1;
      }

      if (useFreeSpin) {
        await this.spinRepository.updateState(tx, userId, {
          availableFreeSpins: (freeSpins ?? 1) - 1 + freeSpinAwarded,
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

      return {
        outcome,
        gpAwarded,
        xpAwarded,
        fragmentsAwarded,
        freeSpinAwarded
      };
    });
  }

  async purchase(userId: string) {
    const COST = 200;
    return await this.prisma.$transaction(async (tx: any) => {
      const user = await tx.user.findUnique({ where: { id: userId }});
      if (!user || user.gp < COST) {
        throw { code: 'INSUFFICIENT_GP', message: 'Not enough GP to purchase a spin.' };
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
