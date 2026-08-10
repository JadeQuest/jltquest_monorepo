export class CollectionService {
  constructor(private prisma: any) {}

  async getCollection(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fragments: true }
    });

    if (!user) throw { code: 'NOT_FOUND', message: 'User not found' };

    const cards = await this.prisma.userCard.findMany({
      where: { userId },
      include: {
        card: true
      }
    });

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
    return await this.prisma.$transaction(async (tx: any) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw { code: 'NOT_FOUND', message: 'User not found' };

      if (user.fragments < 10) {
        throw { code: 'INSUFFICIENT_FRAGMENTS', message: 'Not enough fragments. 10 required.' };
      }

      // Deduct 10 fragments
      await tx.user.update({
        where: { id: userId },
        data: { fragments: { decrement: 10 } }
      });

      // Get all available rare cards
      const allCards = await tx.rareCard.findMany();
      if (allCards.length === 0) {
         throw { code: 'NO_CARDS_AVAILABLE', message: 'No rare cards exist in the system.' };
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
        fragmentsRemaining: user.fragments - 10,
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
