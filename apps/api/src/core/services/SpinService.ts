import { SpinRepository } from '../../infrastructure/database/repositories/SpinRepository';
import { LedgerService } from './LedgerService';
import { RarePassService } from './RarePassService';
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
      return { 
        availableFreeSpins: APP_CONFIG.SPIN.FREE_SPINS_DEFAULT, 
        purchasedSpinsAvailable: 0,
        lastFreeSpinAt: null, 
        totalSpins: 0 
      };
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
      purchasedSpinsAvailable: spinState.purchasedSpinsAvailable || 0,
      lastFreeSpinAt: spinState.lastFreeSpinAt,
      totalSpins: spinState.totalSpins
    };
  }

  async spin(userId: string, useFreeSpin: boolean) {
    return await this.prisma.$transaction(
      async (tx: any) => {
        // 1. Lock the user row to prevent race conditions
        await tx.$executeRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;

        let spinState = await this.spinRepository.findStateByUserId(tx, userId);
        
        const now = new Date();
        if (!spinState) {
          spinState = await tx.spinState.create({
            data: { userId, availableFreeSpins: APP_CONFIG.SPIN.FREE_SPINS_DEFAULT, purchasedSpinsAvailable: 0 }
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

        // 2. Validate and deduct spin balance based on type
        if (useFreeSpin) {
          if (freeSpins <= 0) {
            throw new BadRequestError(
              ErrorMessages[ErrorCode.INSUFFICIENT_SPINS],
              ErrorCode.INSUFFICIENT_SPINS
            );
          }
          
          await this.spinRepository.updateState(tx, userId, {
            availableFreeSpins: freeSpins - 1,
            lastFreeSpinAt: now,
            totalSpins: (spinState.totalSpins || 0) + 1
          });
        } else {
          const purchasedAvailable = spinState.purchasedSpinsAvailable || 0;
          if (purchasedAvailable <= 0) {
            throw new BadRequestError(
              'No purchased spins available. Please purchase one with GP first.',
              ErrorCode.INSUFFICIENT_SPINS
            );
          }
          
          await this.spinRepository.updateState(tx, userId, {
            purchasedSpinsAvailable: purchasedAvailable - 1,
            totalSpins: (spinState.totalSpins || 0) + 1
          });
        }

        // 3. Random outcome determination
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

        // 4. Award free spin if won
        if (freeSpinAwarded > 0) {
          const updatedState = await this.spinRepository.findStateByUserId(tx, userId);
          const currentFree = updatedState?.availableFreeSpins ?? 0;
          await this.spinRepository.updateState(tx, userId, {
            availableFreeSpins: currentFree + freeSpinAwarded
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
        const rarePassService = new RarePassService(this.prisma);
        
        let finalRpXpAwarded = 0;
        if (rpXpAwarded > 0) {
          finalRpXpAwarded = await rarePassService.awardRpXp(
            tx,
            userId,
            rpXpAwarded,
            RpXpSource.SPIN,
            undefined,
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
      },
      { maxWait: 10000, timeout: 20000 }
    );
  }

  async purchase(userId: string) {
    const COST = APP_CONFIG.SPIN.COST_GP;
    return await this.prisma.$transaction(
      async (tx: any) => {
      // Lock user row
      await tx.$executeRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;

      const user = await tx.user.findUnique({ where: { id: userId }});
      if (!user || user.gp < COST) {
        throw new BadRequestError(
          ErrorMessages[ErrorCode.INSUFFICIENT_GP],
          ErrorCode.INSUFFICIENT_GP
        );
      }

      // Deduct GP
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

      // Increment purchased spins counter
      let spinState = await this.spinRepository.findStateByUserId(tx, userId);
      if (!spinState) {
        await tx.spinState.create({
          data: { userId, availableFreeSpins: APP_CONFIG.SPIN.FREE_SPINS_DEFAULT, purchasedSpinsAvailable: 1 }
        });
      } else {
        await this.spinRepository.updateState(tx, userId, {
          purchasedSpinsAvailable: (spinState.purchasedSpinsAvailable || 0) + 1
        });
      }

      // Log spin purchase audit trail
      await tx.auditLog.create({
        data: {
          userId,
          action: 'SPIN_PURCHASE',
          metadata: { cost: COST }
        }
      });

      return { success: true };
    }, { maxWait: 10000, timeout: 20000 });
  }
}
