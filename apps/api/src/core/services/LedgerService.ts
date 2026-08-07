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
    await tx.user.update({
      where: { id: userId },
      data: { xp: { increment: amount } }
    });
    await this.ledgerRepository.createXpLedger(tx, {
      userId,
      amount,
      source,
      refId
    });
  }
}
