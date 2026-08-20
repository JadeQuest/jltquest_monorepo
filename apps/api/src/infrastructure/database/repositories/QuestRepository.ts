import { prisma } from '../prisma';

export class QuestRepository {
  async findActiveQuests(tx?: any) {
    const db = tx || prisma;
    return db.quest.findMany({
      where: { isActive: true },
      orderBy: { createdDate: 'asc' }
    });
  }

  async findById(tx: any, questId: string) {
    const db = tx || prisma;
    return db.quest.findUnique({ where: { id: questId } });
  }

  async findByCode(tx: any, code: string) {
    const db = tx || prisma;
    return db.quest.findUnique({ where: { code } });
  }

  async findCompletions(tx: any, userId: string) {
    const db = tx || prisma;
    return db.userQuestCompletion.findMany({
      where: { userId },
      select: { questId: true, periodKey: true }
    });
  }

  async findCompletionByPeriod(tx: any, userId: string, questId: string, periodKey: string) {
    const db = tx || prisma;
    return db.userQuestCompletion.findUnique({
      where: {
        userId_questId_periodKey: {
          userId,
          questId,
          periodKey
        }
      }
    });
  }

  async createCompletion(tx: any, data: any) {
    const db = tx || prisma;
    return db.userQuestCompletion.create({ data });
  }
}
