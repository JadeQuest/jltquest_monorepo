export class LedgerRepository {
  async createGpLedger(tx: any, data: any) {
    return tx.gpLedgerEntry.create({ data });
  }

  async createXpLedger(tx: any, data: any) {
    return tx.xpLedgerEntry.create({ data });
  }
}
