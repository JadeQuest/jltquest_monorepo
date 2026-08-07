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
    const lastSpinUTC = new Date(Date.UTC(spinState.lastFreeSpinAt.getUTCFullYear(), spinState.lastFreeSpinAt.getUTCMonth(), spinState.lastFreeSpinAt.getUTCDate()));
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const diffDays = Math.floor((todayUTC.getTime() - lastSpinUTC.getTime()) / (1000 * 60 * 60 * 24));

    let freeSpins = spinState.availableFreeSpins;
    if (diffDays >= 1) freeSpins = Math.max(freeSpins, 1);

    return {
      availableFreeSpins: freeSpins,
      lastFreeSpinAt: spinState.lastFreeSpinAt,
      totalSpins: spinState.totalSpins
    };
  }

  async spin(userId: string, useFreeSpin: boolean) {
    return await this.prisma.$transaction(async (tx: any) => {
      let spinState = await this.spinRepository.findStateByUserId(tx, userId);
      
      if (!spinState) {
        spinState = await tx.spinState.create({
          data: { userId, availableFreeSpins: 1 }
        });
      }

      if (useFreeSpin) {
        if (spinState.availableFreeSpins <= 0) {
          throw { code: 'INSUFFICIENT_SPINS', message: 'No free spins available.' };
        }
        await this.spinRepository.updateState(tx, userId, {
          availableFreeSpins: { decrement: 1 },
          lastFreeSpinAt: new Date(),
          totalSpins: { increment: 1 }
        });
      } else {
        await this.spinRepository.updateState(tx, userId, {
          totalSpins: { increment: 1 }
        });
      }

      const rand = Math.random();
      let outcome: SpinOutcome = SpinOutcome.SMALL;
      let gpAwarded = 20;

      if (rand > 0.9) {
        outcome = SpinOutcome.LARGE;
        gpAwarded = 1000;
      } else if (rand > 0.6) {
        outcome = SpinOutcome.MEDIUM;
        gpAwarded = 100;
      }

      await this.spinRepository.createHistory(tx, {
        userId,
        outcome,
        gpAwarded,
        usedFreeSpin: useFreeSpin
      });

      await this.ledgerService.awardGp(tx, userId, gpAwarded, LedgerSource.SPIN);

      return {
        outcome,
        gpAwarded
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
