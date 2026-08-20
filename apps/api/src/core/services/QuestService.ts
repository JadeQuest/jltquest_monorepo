import { QuestRepository } from '../../infrastructure/database/repositories/QuestRepository';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { LedgerService } from './LedgerService';
import { RarePassService } from './RarePassService';
import { LedgerSource, RpXpSource } from '@jlt/database';
import { getQuestPeriodKey } from '../utils/questPeriod';
import { QuestValidator } from './QuestValidator';
import { BadRequestError, ConflictError, NotFoundError } from '../errors/AppError';
import { ErrorCode, ErrorMessages } from '@jlt/constants';
import { cacheService } from './CacheService';
import type { QuestDto, QuestClaimResultDto } from '@jlt/types';

export class QuestService {
  private validator: QuestValidator;

  constructor(
    private questRepository: QuestRepository,
    private userRepository: UserRepository,
    private ledgerService: LedgerService,
    private rarePassService: RarePassService,
    private prisma: any
  ) {
    this.validator = new QuestValidator(this.prisma);
  }

  async listQuests(userId: string): Promise<QuestDto[]> {
    let quests = cacheService.get<any[]>('active_quests');
    if (!quests) {
      quests = await this.questRepository.findActiveQuests(this.prisma);
      if (quests) {
        cacheService.set('active_quests', quests, 60);
      }
    }
    const activeQuests = quests || [];

    const completions = await this.questRepository.findCompletions(this.prisma, userId);

    // Attach completedCount before validation so repeatable quests know how many times they've been claimed
    const questsWithCounts = activeQuests.map((quest: any) => ({
      ...quest,
      completedCount: completions.filter((c: any) => c.questId === quest.id).length
    }));

    const canClaimMap = await this.validator.validateQuestConditions(userId, questsWithCounts);

    return questsWithCounts.map((quest: any) => {
      const periodKey = getQuestPeriodKey(quest.frequency);

      const isCompleted = completions.some(
        (c: any) => c.questId === quest.id && (c.periodKey === periodKey || quest.frequency === 'ONE_TIME' || quest.frequency === 'ACHIEVEMENT')
      );

      return {
        id: quest.id,
        code: quest.code,
        name: quest.name,
        description: quest.description,
        gpReward: quest.gpReward,
        xpReward: quest.xpReward,
        rpXpReward: quest.rpXpReward,
        fragmentReward: quest.fragmentReward,
        frequency: quest.frequency,
        category: quest.category,
        completed: isCompleted,
        canClaim: isCompleted ? false : (canClaimMap[quest.id] || false),
        completedCount: quest.completedCount,
      };
    });
  }

  async claim(userId: string, questId: string): Promise<QuestClaimResultDto> {
    const quest = await this.questRepository.findById(this.prisma, questId);
    if (!quest) {
      throw new NotFoundError(
        ErrorMessages[ErrorCode.QUEST_NOT_FOUND],
        ErrorCode.QUEST_NOT_FOUND
      );
    }

    const completions = await this.questRepository.findCompletions(this.prisma, userId);
    quest.completedCount = completions.filter((c: any) => c.questId === quest.id).length;

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
            await this.userRepository.update(tx, userId, {
              fragments: { increment: quest.fragmentReward }
            });
          }

          // Award Rare Pass XP & update mission progress
          let rpXpAwarded = 0;
          if (quest.rpXpReward > 0 && (quest.frequency === 'DAILY' || quest.frequency === 'WEEKLY')) {
            rpXpAwarded = await this.rarePassService.awardRpXp(
              tx,
              userId,
              quest.rpXpReward,
              RpXpSource.QUEST,
              questId,
              `quest_completion_rpxp:${userId}:${questId}:${periodKey}`
            );
          }

          await this.rarePassService.updateMissionProgress(tx, userId, 'mission_complete_quests_daily', 1);

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
