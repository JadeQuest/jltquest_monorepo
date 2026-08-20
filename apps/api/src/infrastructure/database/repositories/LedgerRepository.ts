import { prisma } from '../prisma';

export class LedgerRepository {
  async createGpLedger(tx: any, data: any) {
    const db = tx || prisma;
    return db.gpLedgerEntry.create({ data });
  }

  async createXpLedger(tx: any, data: any) {
    const db = tx || prisma;
    return db.xpLedgerEntry.create({ data });
  }

  async aggregateLifetimeGpCredits(tx: any) {
    const db = tx || prisma;
    return db.gpLedgerEntry.groupBy({
      by: ['userId'],
      where: { amount: { gt: 0 } },
      _sum: { amount: true },
    });
  }

  async aggregateLifetimeXpCredits(tx: any) {
    const db = tx || prisma;
    return db.xpLedgerEntry.groupBy({
      by: ['userId'],
      where: { amount: { gt: 0 } },
      _sum: { amount: true },
    });
  }
}
