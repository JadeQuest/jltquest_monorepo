export class InviteRepository {
  async findStats(tx: any, userId: string) {
    return tx.invite.findUnique({
      where: { userId },
      include: {
        redemptions: true
      }
    });
  }

  async findByCode(tx: any, code: string) {
    return tx.invite.findUnique({
      where: { code },
      include: { redemptions: true }
    });
  }

  async createRedemption(tx: any, data: any) {
    return tx.inviteRedemption.create({ data });
  }
}
