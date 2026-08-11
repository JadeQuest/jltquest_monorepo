import { prisma } from '../prisma';

export class UserRepository {
  async findById(tx: any, userId: string) {
    const db = tx || prisma;
    return db.user.findUnique({ where: { id: userId } });
  }

  async findByWallet(tx: any, walletAddress: string) {
    const db = tx || prisma;
    return db.user.findUnique({ where: { walletAddress } });
  }

  async findWithConnections(tx: any, userId: string) {
    const db = tx || prisma;
    return db.user.findUnique({ 
      where: { id: userId },
      include: { 
        socialConnections: true, 
        streak: true,
        activeAvatarVariant: {
          include: {
            avatar: true
          }
        }
      }
    });
  }

  async upsertByWallet(tx: any, rawWalletAddress: string) {
    const db = tx || prisma;
    const normalizedAddress = rawWalletAddress.toLowerCase();
    const existing = await db.user.findUnique({ where: { walletAddress: normalizedAddress } });
    if (existing) {
      return db.user.update({
        where: { id: existing.id },
        data: { walletConnected: true, updatedBy: normalizedAddress },
        include: { streak: true, spinState: true }
      });
    }

    return db.user.create({
      data: {
        walletAddress: normalizedAddress,
        walletConnected: true,
        createdBy: normalizedAddress,
        updatedBy: normalizedAddress,
        streak: {
          create: {
            currentDay: 0,
            createdBy: normalizedAddress
          }
        },
        spinState: {
          create: {
            purchasedSpinsAvailable: 0,
            createdBy: normalizedAddress
          }
        }
      },
      include: { streak: true, spinState: true }
    });
  }

  async update(tx: any, userId: string, data: any) {
    const db = tx || prisma;
    return db.user.update({
      where: { id: userId },
      data
    });
  }
}


