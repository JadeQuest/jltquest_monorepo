import { prisma } from '../prisma';

export class InviteRepository {
  async findStats(tx: any, userId: string) {
    const db = tx || prisma;
    return db.invite.findFirst({
      where: { inviterId: userId },
      include: {
        redemptions: {
          include: {
            redeemedByUser: {
              select: {
                level: true,
                displayName: true
              }
            }
          }
        }
      }
    });
  }

  async findByCode(tx: any, code: string) {
    const db = tx || prisma;
    return db.invite.findUnique({
      where: { code },
      include: { redemptions: true }
    });
  }

  async createRedemption(tx: any, data: any) {
    const db = tx || prisma;
    return db.inviteRedemption.create({ data });
  }
}
