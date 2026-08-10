import { QuestRepository } from '../../infrastructure/database/repositories/QuestRepository';
import { LedgerService } from './LedgerService';
import { LedgerSource } from '@jlt/database';

export class QuestService {
  constructor(
    private questRepository: QuestRepository,
    private ledgerService: LedgerService,
    private prisma: any
  ) {}

  async listQuests(userId: string) {
    const quests = await this.questRepository.findActiveQuests(this.prisma);
    const completions = await this.questRepository.findCompletions(this.prisma, userId);

    return quests.map((quest: any) => {
      const isCompleted = completions.some((c: any) => c.questId === quest.id);
      return {
        ...quest,
        completed: isCompleted,
        completedCount: completions.filter((c: any) => c.questId === quest.id).length
      };
    });
  }

  async claim(userId: string, questId: string) {
    const quest = await this.questRepository.findById(this.prisma, questId);
    if (!quest) throw { code: 'NOT_FOUND', message: 'Quest not found.' };

    try {
      return await this.prisma.$transaction(async (tx: any) => {
        await this.questRepository.createCompletion(tx, {
          userId,
          questId
        });

        await this.ledgerService.awardGp(tx, userId, quest.gpReward, LedgerSource.QUEST, questId);
        await this.ledgerService.awardXp(tx, userId, quest.xpReward, LedgerSource.QUEST, questId);

        if (quest.fragmentReward > 0) {
          await tx.user.update({
            where: { id: userId },
            data: { fragments: { increment: quest.fragmentReward } }
          });
        }

        return {
          gpAwarded: quest.gpReward,
          xpAwarded: quest.xpReward,
          fragmentsAwarded: quest.fragmentReward
        };
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw { code: 'ALREADY_CLAIMED', message: 'Quest already claimed.' };
      }
      throw err;
    }
  }
}
