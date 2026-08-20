import { prisma } from '../prisma';

export class SpinRepository {
  async findStateByUserId(tx: any, userId: string) {
    const db = tx || prisma;
    return db.spinState.findUnique({ where: { userId } });
  }

  async createState(tx: any, data: any) {
    const db = tx || prisma;
    return db.spinState.create({ data });
  }

  async updateState(tx: any, userId: string, data: any) {
    const db = tx || prisma;
    return db.spinState.update({
      where: { userId },
      data
    });
  }

  async createHistory(tx: any, data: any) {
    const db = tx || prisma;
    return db.spinResult.create({ data });
  }
}
