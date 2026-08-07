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
      include: { socialConnections: true }
    });
  }

  async update(tx: any, userId: string, data: any) {
    return tx.user.update({
      where: { id: userId },
      data
    });
  }
}
