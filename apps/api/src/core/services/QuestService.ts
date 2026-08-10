import { QuestRepository } from '../../infrastructure/database/repositories/QuestRepository';
import { LedgerService } from './LedgerService';
import { LedgerSource } from '@jlt/database';
import { getQuestPeriodKey } from '../utils/questPeriod';
import { QuestValidator } from './QuestValidator';

export class QuestService {
  private validator: QuestValidator;

  constructor(
    private questRepository: QuestRepository,
    private ledgerService: LedgerService,
    private prisma: any
  ) {
    this.validator = new QuestValidator(this.prisma);
  }

  async listQuests(userId: string) {
    const quests = await this.questRepository.findActiveQuests(this.prisma);
    const completions = await this.questRepository.findCompletions(this.prisma, userId);
    const canClaimMap = await this.validator.validateQuestConditions(userId, quests);

    return quests.map((quest: any) => {
      const periodKey = getQuestPeriodKey(quest.frequency);
      
      const isCompleted = completions.some(
        (c: any) => c.questId === quest.id && (c.periodKey === periodKey || quest.frequency === 'ONE_TIME' || quest.frequency === 'ACHIEVEMENT')
      );
      
      return {
        ...quest,
        completed: isCompleted,
        canClaim: canClaimMap[quest.id] || false,
        completedCount: completions.filter((c: any) => c.questId === quest.id).length
      };
    });
  }

  async claim(userId: string, questId: string) {
    const quest = await this.questRepository.findById(this.prisma, questId);
    if (!quest) throw { code: 'NOT_FOUND', message: 'Quest not found.' };

    const canClaimMap = await this.validator.validateQuestConditions(userId, [quest]);
    if (!canClaimMap[quest.id]) {
      throw { code: 'REQUIREMENTS_NOT_MET', message: 'Quest requirements are not met yet.' };
    }

    try {
      return await this.prisma.$transaction(async (tx: any) => {
        const periodKey = getQuestPeriodKey(quest.frequency);

        await this.questRepository.createCompletion(tx, {
          userId,
          questId,
          periodKey,
          gpAwarded: quest.gpReward,
          xpAwarded: quest.xpReward
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
