import { LedgerType, LedgerSource } from '@jlt/database';
import { LedgerRepository } from '../../infrastructure/database/repositories/LedgerRepository';

export class LedgerService {
  constructor(private ledgerRepository: LedgerRepository) {}

  async awardGp(tx: any, userId: string, amount: number, source: LedgerSource, refId?: string) {
    if (amount <= 0) return;
    await tx.user.update({
      where: { id: userId },
      data: { gp: { increment: amount } }
    });
    await this.ledgerRepository.createGpLedger(tx, {
      userId,
      amount,
      type: LedgerType.CREDIT,
      source,
      refId
    });
  }

  async awardXp(tx: any, userId: string, amount: number, source: LedgerSource, refId?: string) {
    if (amount <= 0) return;

    // We need to fetch the user to check their current level and xp
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const { calculateXpRequiredForLevel } = require('../utils/leveling');
    
    let currentXp = user.xp + amount;
    let currentLevel = user.level;
    let fragmentsAwarded = 0;

    let xpRequired = calculateXpRequiredForLevel(currentLevel);

    while (currentXp >= xpRequired) {
      currentXp -= xpRequired;
      currentLevel += 1;
      fragmentsAwarded += 1;
      xpRequired = calculateXpRequiredForLevel(currentLevel);
    }

    await tx.user.update({
      where: { id: userId },
      data: { 
        xp: currentXp,
        level: currentLevel,
        fragments: { increment: fragmentsAwarded }
      }
    });

    await this.ledgerRepository.createXpLedger(tx, {
      userId,
      amount,
      source,
      refId
    });
  }
}
