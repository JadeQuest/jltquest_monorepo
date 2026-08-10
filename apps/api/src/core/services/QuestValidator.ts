export class QuestValidator {
  constructor(private prisma: any) {}

  async validateQuestConditions(userId: string, quests: any[]): Promise<Record<string, boolean>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        streak: true,
        socialConnections: {
          where: { connected: true }
        }
      }
    });

    if (!user) {
      return quests.reduce((acc, q) => ({ ...acc, [q.id]: false }), {});
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const startOfDay = new Date(`${todayStr}T00:00:00.000Z`);

    const dailySpins = await this.prisma.spinResult.count({
      where: {
        userId,
        createdDate: { gte: startOfDay }
      }
    });

    const totalSpins = await this.prisma.spinResult.count({
      where: { userId }
    });

    const results: Record<string, boolean> = {};

    for (const quest of quests) {
      let canClaim = false;
      switch (quest.code) {
        case 'daily_checkin': {
          if (user.streak && user.streak.lastCheckInDate) {
            const lastCheckIn = new Date(user.streak.lastCheckInDate).toISOString().split('T')[0];
            canClaim = (todayStr === lastCheckIn);
          }
          break;
        }
        case 'daily_spin':
          canClaim = dailySpins > 0;
          break;
        case 'ms_lvl_5': canClaim = user.level >= 5; break;
        case 'ms_lvl_10': canClaim = user.level >= 10; break;
        case 'ms_lvl_20': canClaim = user.level >= 20; break;
        case 'ms_lvl_30': canClaim = user.level >= 30; break;
        case 'ach_connect_wallet': canClaim = user.walletAddress !== null; break;
        case 'ach_first_login': canClaim = true; break;
        case 'ach_first_spin': canClaim = totalSpins > 0; break;
        case 'earn_500gp': canClaim = user.gp >= 500; break;
        case 'earn_1000gp': canClaim = user.gp >= 1000; break;
        case 'earn_5000gp': canClaim = user.gp >= 5000; break;
        case 'soc_x_connect':
        case 'soc_discord_connect':
        case 'soc_instagram_connect':
        case 'soc_facebook_connect':
          canClaim = true;
          break;
        default:
          canClaim = false;
      }
      results[quest.id] = canClaim;
    }

    return results;
  }
}
