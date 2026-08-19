import { prisma } from '../prisma';

export class InviteRepository {
  async findStats(tx: any, userId: string) {
    const db = tx || prisma;
    const invite = await db.invite.findFirst({
      where: { inviterId: userId },
      include: {
        redemptions: {
          include: {
            redeemedByUser: {
              select: {
                level: true,
                displayName: true,
                walletAddress: true,
                activeAvatarVariant: {
                  select: {
                    imageUrl: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const milestoneClaims = await db.inviteMilestoneClaim.findMany({
      where: { inviterId: userId }
    });

    return {
      invite,
      milestoneClaims
    };
  }

  async findByCode(tx: any, code: string) {
    const db = tx || prisma;
    return db.invite.findFirst({
      where: {
        code: {
          equals: code,
          mode: 'insensitive'
        }
      },
      include: { redemptions: true }
    });
  }

  async createRedemption(tx: any, data: any) {
    const db = tx || prisma;
    return db.inviteRedemption.create({ data });
  }
}
