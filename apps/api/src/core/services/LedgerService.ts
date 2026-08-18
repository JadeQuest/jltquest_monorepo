import { LedgerType, LedgerSource } from '@jlt/database';
import { LedgerRepository } from '../../infrastructure/database/repositories/LedgerRepository';

export class LedgerService {
  constructor(private ledgerRepository: LedgerRepository) {}

  async awardGp(tx: any, userId: string, amount: number, source: LedgerSource, refId?: string) {
    if (amount <= 0) return;
    await tx.user.update({
      where: { id: userId },
      data: { gp: { increment: amount } }
    });
    await this.ledgerRepository.createGpLedger(tx, {
      userId,
      amount,
      type: LedgerType.CREDIT,
      source,
      refId
    });
  }

  async awardXp(tx: any, userId: string, amount: number, source: LedgerSource, refId?: string) {
    if (amount <= 0) return;

    // We need to fetch the user to check their current level and xp
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const { calculateXpRequiredForLevel } = require('../utils/leveling');
    
    let currentXp = user.xp + amount;
    let currentLevel = user.level;
    let fragmentsAwarded = 0;

    let xpRequired = calculateXpRequiredForLevel(currentLevel);

    while (currentXp >= xpRequired) {
      currentXp -= xpRequired;
      currentLevel += 1;
      fragmentsAwarded += 1;
      xpRequired = calculateXpRequiredForLevel(currentLevel);
    }

    await tx.user.update({
      where: { id: userId },
      data: { 
        xp: currentXp,
        level: currentLevel,
        fragments: { increment: fragmentsAwarded }
      }
    });

    // Check for level-up unlocks
    if (currentLevel > user.level) {
      const newlyUnlockedVariants = await tx.avatarVariant.findMany({
        where: {
          unlockLevel: {
            gt: user.level,
            lte: currentLevel
          }
        }
      });

      if (newlyUnlockedVariants.length > 0) {
        for (const variant of newlyUnlockedVariants) {
          await tx.userAvatar.upsert({
            where: { userId_variantId: { userId, variantId: variant.id } },
            update: {},
            create: { userId, variantId: variant.id }
          });
        }
      }
      
      // Check for referral milestones
      const redemption = await tx.inviteRedemption.findUnique({
        where: { redeemedByUserId: userId },
        include: { invite: true }
      });

      if (redemption) {
        const inviterId = redemption.invite.inviterId;
        const milestones = [
          { level: 6, flag: 'level6RewardClaimed', gp: 150, xp: 75 },
          { level: 11, flag: 'level11RewardClaimed', gp: 300, xp: 150 },
          { level: 16, flag: 'level16RewardClaimed', gp: 450, xp: 225 },
          { level: 21, flag: 'level21RewardClaimed', gp: 600, xp: 300 },
          { level: 26, flag: 'level26RewardClaimed', gp: 750, xp: 375 }
        ];

        for (const ms of milestones) {
          if (currentLevel >= ms.level && !(redemption as any)[ms.flag]) {
            // Mark flag true
            await tx.inviteRedemption.update({
              where: { id: redemption.id },
              data: { [ms.flag]: true }
            });

            // Award inviter
            await this.awardGp(tx, inviterId, ms.gp, LedgerSource.INVITE, redemption.id);
            if (ms.xp > 0) {
              await this.awardXp(tx, inviterId, ms.xp, LedgerSource.INVITE, redemption.id);
            }

            // If it's the Level 6 milestone, check for the 5-referral quest
            if (ms.level === 6) {
              const count = await tx.inviteRedemption.count({
                where: {
                  invite: { inviterId: inviterId },
                  level6RewardClaimed: true
                }
              });

              if (count === 5) {
                const quest = await tx.quest.findUnique({ where: { code: 'quest_invite_5_level_6' } });
                if (quest) {
                  const existingCompletion = await tx.userQuestCompletion.findUnique({
                    where: {
                      userId_questId_periodKey: {
                        userId: inviterId,
                        questId: quest.id,
                        periodKey: 'ALL'
                      }
                    }
                  });

                  if (!existingCompletion) {
                    await tx.userQuestCompletion.create({
                      data: {
                        userId: inviterId,
                        questId: quest.id,
                        periodKey: 'ALL',
                        gpAwarded: quest.gpReward,
                        xpAwarded: quest.xpReward
                      }
                    });
                    await this.awardGp(tx, inviterId, quest.gpReward, LedgerSource.QUEST, quest.id);
                    if (quest.xpReward > 0) {
                      await this.awardXp(tx, inviterId, quest.xpReward, LedgerSource.QUEST, quest.id);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    await this.ledgerRepository.createXpLedger(tx, {
      userId,
      amount,
      source,
      refId
    });
  }
}
