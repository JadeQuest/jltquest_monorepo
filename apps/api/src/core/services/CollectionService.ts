import { CollectionRepository } from '../../infrastructure/database/repositories/CollectionRepository';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { RarePassService } from './RarePassService';
import { BadRequestError, NotFoundError } from '../errors/AppError';
import { ErrorCode, ErrorMessages, APP_CONFIG } from '@jlt/constants';
import { RpXpSource } from '@jlt/database';
import type { CollectionDto, MergeFragmentsResultDto } from '@jlt/types';

export class CollectionService {
  constructor(
    private collectionRepository: CollectionRepository,
    private userRepository: UserRepository,
    private rarePassService: RarePassService,
    private prisma: any
  ) {}

  async getCollection(userId: string): Promise<CollectionDto> {
    const [user, cards] = await Promise.all([
      this.userRepository.findById(this.prisma, userId),
      this.collectionRepository.findUserCards(this.prisma, userId)
    ]);

    if (!user) {
      throw new NotFoundError(ErrorMessages[ErrorCode.USER_NOT_FOUND], ErrorCode.USER_NOT_FOUND);
    }

    return {
      fragments: user.fragments,
      cards: cards.map((c: any) => ({
        id: c.card.id,
        name: c.card.name,
        imageUrl: c.card.imageUrl,
        rarity: c.card.rarity,
        quantity: c.quantity,
        acquiredAt: c.updatedAt
      }))
    };
  }

  async mergeFragments(userId: string): Promise<MergeFragmentsResultDto> {
    const requiredFragments = APP_CONFIG.COLLECTION.MERGE_FRAGMENTS_REQUIRED;

    return await this.prisma.$transaction(async (tx: any) => {
      const user = await this.userRepository.findById(tx, userId);
      if (!user) {
        throw new NotFoundError(ErrorMessages[ErrorCode.USER_NOT_FOUND], ErrorCode.USER_NOT_FOUND);
      }

      if (user.fragments < requiredFragments) {
        throw new BadRequestError(
          ErrorMessages[ErrorCode.INSUFFICIENT_FRAGMENTS],
          ErrorCode.INSUFFICIENT_FRAGMENTS
        );
      }

      // Deduct fragments
      await this.userRepository.update(tx, userId, {
        fragments: { decrement: requiredFragments }
      });

      // Roll for card rarity first
      const probabilities = APP_CONFIG.COLLECTION.RARITY_PROBABILITIES;
      const roll = Math.random();
      let targetRarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' = 'COMMON';

      if (roll < probabilities.COMMON) {
        targetRarity = 'COMMON';
      } else if (roll < probabilities.COMMON + probabilities.RARE) {
        targetRarity = 'RARE';
      } else if (roll < probabilities.COMMON + probabilities.RARE + probabilities.EPIC) {
        targetRarity = 'EPIC';
      } else {
        targetRarity = 'LEGENDARY';
      }

      // Query cards matching targetRarity
      let eligibleCards = await this.collectionRepository.findRareCardsByRarity(tx, targetRarity);

      // Fallback: if no cards of that rarity exist, select from all non-mythical cards
      if (eligibleCards.length === 0) {
        eligibleCards = await this.collectionRepository.findRareCardsNonMythical(tx);
      }

      if (eligibleCards.length === 0) {
        throw new NotFoundError(
          ErrorMessages[ErrorCode.NO_CARDS_AVAILABLE],
          ErrorCode.NO_CARDS_AVAILABLE
        );
      }

      // Pick a random card
      const randomIndex = Math.floor(Math.random() * eligibleCards.length);
      const selectedCard = eligibleCards[randomIndex];

      // Add to user collection or increment quantity
      const existingUserCard = await this.collectionRepository.findUserCard(tx, userId, selectedCard.id);

      let result;
      if (existingUserCard) {
        result = await this.collectionRepository.incrementUserCard(tx, existingUserCard.id);
      } else {
        result = await this.collectionRepository.createUserCard(tx, {
          userId,
          cardId: selectedCard.id,
          quantity: 1
        });
      }

      // Award RP XP & update missions
      const rpXpAwarded = await this.rarePassService.awardRpXp(
        tx,
        userId,
        100,
        RpXpSource.CARD_CRAFT,
        result.id,
        `card_craft_rpxp:${userId}:${result.id}:${Date.now()}`
      );

      await this.rarePassService.updateMissionProgress(tx, userId, 'mission_craft_card_weekly', 1);

      return {
        success: true,
        fragmentsRemaining: user.fragments - requiredFragments,
        rpXpAwarded,
        cardAwarded: {
          id: result.card.id,
          name: result.card.name,
          imageUrl: result.card.imageUrl,
          rarity: result.card.rarity,
          quantity: result.quantity
        }
      };
    }, {
      maxWait: 15000,
      timeout: 30000
    });
  }
}
