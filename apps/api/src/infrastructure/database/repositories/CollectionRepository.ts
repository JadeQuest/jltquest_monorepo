import { prisma } from '../prisma';

export class CollectionRepository {
  async findUserCards(tx: any, userId: string) {
    const db = tx || prisma;
    return db.userCard.findMany({
      where: { userId },
      select: {
        quantity: true,
        updatedAt: true,
        card: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            rarity: true,
          },
        },
      },
    });
  }

  async findRareCardsByRarity(tx: any, rarity: string) {
    const db = tx || prisma;
    return db.rareCard.findMany({
      where: { rarity: rarity as any },
    });
  }

  async findRareCardsNonMythical(tx: any) {
    const db = tx || prisma;
    return db.rareCard.findMany({
      where: { rarity: { not: 'MYTHICAL' } },
    });
  }

  async findUserCard(tx: any, userId: string, cardId: string) {
    const db = tx || prisma;
    return db.userCard.findUnique({
      where: {
        userId_cardId: {
          userId,
          cardId,
        },
      },
    });
  }

  async incrementUserCard(tx: any, userCardId: string) {
    const db = tx || prisma;
    return db.userCard.update({
      where: { id: userCardId },
      data: { quantity: { increment: 1 } },
      include: { card: true },
    });
  }

  async createUserCard(tx: any, data: any) {
    const db = tx || prisma;
    return db.userCard.create({
      data,
      include: { card: true },
    });
  }
}
