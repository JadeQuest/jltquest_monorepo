import { PrismaClient } from '@jlt/database';

export class UserRepository {
  async findById(tx: any, userId: string) {
    return tx.user.findUnique({ where: { id: userId } });
  }

  async findByWallet(tx: any, walletAddress: string) {
    return tx.user.findUnique({ where: { walletAddress } });
  }

  async findWithConnections(tx: any, userId: string) {
    return tx.user.findUnique({ 
      where: { id: userId },
      include: { socialConnections: true, streak: true }
    });
  }

  async upsertByWallet(tx: any, walletAddress: string) {
    const existing = await tx.user.findUnique({ where: { walletAddress } });
    if (existing) {
      return tx.user.update({
        where: { id: existing.id },
        data: { walletConnected: true },
        include: { streak: true }
      });
    }

    return tx.user.create({
      data: {
        walletAddress,
        walletConnected: true,
        streak: {
          create: {
            currentDay: 0
          }
        }
      },
      include: { streak: true }
    });
  }

  async update(tx: any, userId: string, data: any) {
    return tx.user.update({
      where: { id: userId },
      data
    });
  }
}

