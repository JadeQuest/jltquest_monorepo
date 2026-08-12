import { QuestRepository } from '../../infrastructure/database/repositories/QuestRepository';
import { LedgerService } from './LedgerService';
import { RarePassService } from './RarePassService';
import { LedgerSource, RpXpSource } from '@jlt/database';
import { getQuestPeriodKey } from '../utils/questPeriod';
import { QuestValidator } from './QuestValidator';
import { BadRequestError, ConflictError, NotFoundError } from '../errors/AppError';
import { ErrorCode, ErrorMessages } from '@jlt/constants';

import { cacheService } from './CacheService';

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
    let quests = cacheService.get<any[]>('active_quests');
    if (!quests) {
      quests = await this.questRepository.findActiveQuests(this.prisma);
      if (quests) {
        cacheService.set('active_quests', quests, 60);
      }
    }
    const activeQuests = quests || [];

    const completions = await this.questRepository.findCompletions(this.prisma, userId);
    
    const canClaimMap = await this.validator.validateQuestConditions(userId, activeQuests);

    return activeQuests.map((quest: any) => {
      const periodKey = getQuestPeriodKey(quest.frequency);
      
      const isCompleted = completions.some(
        (c: any) => c.questId === quest.id && (c.periodKey === periodKey || quest.frequency === 'ONE_TIME' || quest.frequency === 'ACHIEVEMENT')
      );
      
      return {
        ...quest,
        completed: isCompleted,
        canClaim: isCompleted ? false : (canClaimMap[quest.id] || false),
        completedCount: completions.filter((c: any) => c.questId === quest.id).length
      };
    });
  }

  async claim(userId: string, questId: string) {
    const quest = await this.questRepository.findById(this.prisma, questId);
    if (!quest) {
      throw new NotFoundError(
        ErrorMessages[ErrorCode.QUEST_NOT_FOUND],
        ErrorCode.QUEST_NOT_FOUND
      );
    }

    const canClaimMap = await this.validator.validateQuestConditions(userId, [quest]);
    if (!canClaimMap[quest.id]) {
      throw new BadRequestError(
        ErrorMessages[ErrorCode.REQUIREMENTS_NOT_MET],
        ErrorCode.REQUIREMENTS_NOT_MET
      );
    }

    try {
      return await this.prisma.$transaction(
        async (tx: any) => {
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

          // Award Rare Pass XP & update mission progress
          const rarePassService = new RarePassService(this.prisma);
          
          let rpXpAwarded = 0;
          if (quest.rpXpReward > 0 && (quest.frequency === 'DAILY' || quest.frequency === 'WEEKLY')) {
            rpXpAwarded = await rarePassService.awardRpXp(
              tx,
              userId,
              quest.rpXpReward,
              RpXpSource.QUEST,
              questId,
              `quest_completion_rpxp:${userId}:${questId}:${periodKey}`
            );
          }

          await rarePassService.updateMissionProgress(tx, userId, 'mission_complete_quests_daily', 1);

          return {
            gpAwarded: quest.gpReward,
            xpAwarded: quest.xpReward,
            rpXpAwarded,
            fragmentsAwarded: quest.fragmentReward
          };
        },
        { maxWait: 10000, timeout: 20000 }
      );
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new ConflictError(
          ErrorMessages[ErrorCode.ALREADY_CLAIMED],
          ErrorCode.ALREADY_CLAIMED
        );
      }
      throw err;
    }
  }
}
