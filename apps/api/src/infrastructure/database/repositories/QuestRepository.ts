export class QuestRepository {
  async findActiveQuests(tx: any) {
    return tx.quest.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
  }

  async findById(tx: any, questId: string) {
    return tx.quest.findUnique({ where: { id: questId } });
  }

  async findCompletions(tx: any, userId: string) {
    return tx.userQuestCompletion.findMany({
      where: { userId }
    });
  }

  async createCompletion(tx: any, data: any) {
    return tx.userQuestCompletion.create({ data });
  }
}
