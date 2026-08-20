import { prisma } from '../prisma';

export class StreakRepository {
  async findByUserId(tx: any, userId: string) {
    const db = tx || prisma;
    return db.streak.findUnique({ where: { userId } });
  }

  async create(tx: any, data: any) {
    const db = tx || prisma;
    return db.streak.create({ data });
  }

  async update(tx: any, userId: string, data: any) {
    const db = tx || prisma;
    return db.streak.update({
      where: { userId },
      data
    });
  }

  async findAllStreaks(tx: any) {
    const db = tx || prisma;
    return db.streak.findMany({
      select: {
        userId: true,
        currentDay: true,
        longestStreak: true
      }
    });
  }
}
