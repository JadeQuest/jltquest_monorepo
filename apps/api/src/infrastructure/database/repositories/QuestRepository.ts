export class QuestRepository {
  async findActiveQuests(tx: any) {
    return tx.quest.findMany({
      where: { isActive: true },
      orderBy: { createdDate: 'asc' }
    });
  }

  async findById(tx: any, questId: string) {
    return tx.quest.findUnique({ where: { id: questId } });
  }

  async findByCode(tx: any, code: string) {
    return tx.quest.findUnique({ where: { code } });
  }

  async findCompletions(tx: any, userId: string) {
    return tx.userQuestCompletion.findMany({
      where: { userId },
      select: { questId: true, periodKey: true }
    });
  }

  async createCompletion(tx: any, data: any) {
    return tx.userQuestCompletion.create({ data });
  }
}
