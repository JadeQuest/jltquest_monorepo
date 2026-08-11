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

    const inviteCount = await this.prisma.inviteRedemption.count({
      where: { invite: { inviterId: userId } }
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
        case 'ach_connect_wallet':
        case 'quest_connect_wallet':
          canClaim = user.walletConnected || user.walletAddress !== null;
          break;
        case 'quest_complete_profile':
          canClaim = user.profileCompleted;
          break;
        case 'quest_invite_friend': {
          const completionsCount = await this.prisma.userQuestCompletion.count({
            where: { userId, quest: { code: 'quest_invite_friend' } }
          });
          canClaim = inviteCount > completionsCount;
          break;
        }
        case 'quest_3_daily_spins':
          canClaim = dailySpins >= 3;
          break;
        case 'ach_first_login': canClaim = true; break;
        case 'ach_first_spin': canClaim = totalSpins > 0; break;
        case 'earn_500gp': canClaim = user.gp >= 500; break;
        case 'earn_1000gp': canClaim = user.gp >= 1000; break;
        case 'earn_5000gp': canClaim = user.gp >= 5000; break;
        case 'soc_x_connect':
        case 'quest_connect_x':
          canClaim = user.socialConnections.some((c: any) => c.platform === 'X' && c.connected);
          break;
        case 'soc_discord_connect':
        case 'quest_connect_discord':
          canClaim = user.socialConnections.some((c: any) => c.platform === 'DISCORD' && c.connected);
          break;
        case 'soc_telegram_connect':
        case 'quest_connect_telegram':
          canClaim = user.socialConnections.some((c: any) => c.platform === 'TELEGRAM' && c.connected);
          break;
        default:
          canClaim = false;
      }
      results[quest.id] = canClaim;
    }

    return results;
  }
}
