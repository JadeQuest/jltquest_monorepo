export class StreakRepository {
  async findByUserId(tx: any, userId: string) {
    return tx.streak.findUnique({ where: { userId } });
  }

  async update(tx: any, userId: string, data: any) {
    return tx.streak.update({
      where: { userId },
      data
    });
  }
}
