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

  async findByInviterId(tx: any, inviterId: string) {
    const db = tx || prisma;
    return db.invite.findFirst({
      where: { inviterId },
      include: { redemptions: true }
    });
  }

  async createInvite(tx: any, data: any) {
    const db = tx || prisma;
    return db.invite.create({ data, include: { redemptions: true } });
  }

  async findRedemptionByUserId(tx: any, userId: string) {
    const db = tx || prisma;
    return db.inviteRedemption.findUnique({
      where: { redeemedByUserId: userId }
    });
  }

  async findRedemptionWithInvite(tx: any, userId: string) {
    const db = tx || prisma;
    return db.inviteRedemption.findUnique({
      where: { redeemedByUserId: userId },
      include: { invite: true }
    });
  }

  async findCircularRedemption(tx: any, inviterId: string, inviteeId: string) {
    const db = tx || prisma;
    return db.inviteRedemption.findFirst({
      where: {
        redeemedByUserId: inviterId,
        invite: {
          inviterId: inviteeId
        }
      }
    });
  }

  async createRedemption(tx: any, data: any) {
    const db = tx || prisma;
    return db.inviteRedemption.create({ data });
  }

  async updateRedemption(tx: any, id: string, data: any) {
    const db = tx || prisma;
    return db.inviteRedemption.update({
      where: { id },
      data
    });
  }

  async countLevel6Milestones(tx: any, inviterId: string) {
    const db = tx || prisma;
    return db.inviteRedemption.count({
      where: {
        invite: { inviterId },
        level6RewardClaimed: true
      }
    });
  }

  async findMilestoneClaim(tx: any, inviterId: string, inviteeCount: number, levelReached: number) {
    const db = tx || prisma;
    return db.inviteMilestoneClaim.findUnique({
      where: {
        inviterId_inviteeCount_levelReached: {
          inviterId,
          inviteeCount,
          levelReached
        }
      }
    });
  }

  async createMilestoneClaim(tx: any, data: any) {
    const db = tx || prisma;
    return db.inviteMilestoneClaim.create({ data });
  }
}
