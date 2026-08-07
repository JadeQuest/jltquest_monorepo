export class SpinRepository {
  async findStateByUserId(tx: any, userId: string) {
    return tx.spinState.findUnique({ where: { userId } });
  }

  async updateState(tx: any, userId: string, data: any) {
    return tx.spinState.update({
      where: { userId },
      data
    });
  }

  async createHistory(tx: any, data: any) {
    return tx.spinHistory.create({ data });
  }
}
