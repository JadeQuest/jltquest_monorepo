import { BadRequestError, NotFoundError } from '../errors/AppError';
import { ErrorCode, ErrorMessages, APP_CONFIG } from '@jlt/constants';

export class CollectionService {
  constructor(private prisma: any) {}

  async getCollection(userId: string) {
    const [user, cards] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { fragments: true }
      }),
      this.prisma.userCard.findMany({
        where: { userId },
        select: {
          quantity: true,
          updatedAt: true,
          card: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
      })
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
        quantity: c.quantity,
        acquiredAt: c.updatedAt
      }))
    };
  }

  async mergeFragments(userId: string) {
    const requiredFragments = APP_CONFIG.COLLECTION.MERGE_FRAGMENTS_REQUIRED;

    return await this.prisma.$transaction(async (tx: any) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
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
      await tx.user.update({
        where: { id: userId },
        data: { fragments: { decrement: requiredFragments } }
      });

      // Get all available rare cards
      const allCards = await tx.rareCard.findMany();
      if (allCards.length === 0) {
        throw new NotFoundError(
          ErrorMessages[ErrorCode.NO_CARDS_AVAILABLE],
          ErrorCode.NO_CARDS_AVAILABLE
        );
      }

      // Pick a random card
      const randomIndex = Math.floor(Math.random() * allCards.length);
      const selectedCard = allCards[randomIndex];

      // Add to user collection or increment quantity
      const existingUserCard = await tx.userCard.findUnique({
        where: {
          userId_cardId: {
            userId,
            cardId: selectedCard.id
          }
        }
      });

      let result;
      if (existingUserCard) {
        result = await tx.userCard.update({
          where: { id: existingUserCard.id },
          data: { quantity: { increment: 1 } },
          include: { card: true }
        });
      } else {
        result = await tx.userCard.create({
          data: {
            userId,
            cardId: selectedCard.id,
            quantity: 1
          },
          include: { card: true }
        });
      }

      return {
        success: true,
        fragmentsRemaining: user.fragments - requiredFragments,
        cardAwarded: {
          id: result.card.id,
          name: result.card.name,
          imageUrl: result.card.imageUrl,
          quantity: result.quantity
        }
      };
    }, {
      maxWait: 15000,
      timeout: 30000
    });
  }
}
