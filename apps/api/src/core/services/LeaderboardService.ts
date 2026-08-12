import { getLevelTier } from '../utils/leveling';

export class LeaderboardService {
  constructor(private prisma: any) {}

  async getLeaderboard(type: 'gp' | 'xp' | 'streak' = 'gp', limit = 20) {
    const take = Math.min(Math.max(1, limit), 100);

    let orderBy: any = { gp: 'desc' };
    if (type === 'xp') {
      orderBy = { xp: 'desc' };
    }

    const users = await this.prisma.user.findMany({
      take: type === 'streak' ? 100 : take,
      orderBy,
      select: {
        id: true,
        walletAddress: true,
        level: true,
        xp: true,
        gp: true,
        jlt: true,
        activeAvatarVariant: {
          select: {
            id: true,
            imageUrl: true,
            avatar: { select: { name: true, characterKey: true } }
          }
        },
        streak: { select: { currentStreak: true, longestStreak: true } }
      }
    });

    if (type === 'streak') {
      users.sort((a: any, b: any) => (b.streak?.currentStreak || 0) - (a.streak?.currentStreak || 0));
    }

    const sliced = users.slice(0, take);

    return sliced.map((u: any, idx: number) => ({
      rank: idx + 1,
      id: u.id,
      walletAddress: u.walletAddress,
      maskedAddress: u.walletAddress ? `${u.walletAddress.substring(0, 6)}...${u.walletAddress.substring(u.walletAddress.length - 4)}` : 'Anonymous',
      level: u.level,
      levelTier: getLevelTier(u.level),
      xp: u.xp,
      gp: u.gp,
      jlt: Number(u.jlt),
      currentStreak: u.streak?.currentStreak || 0,
      avatarUrl: u.activeAvatarVariant?.imageUrl || '/optimized/avatars/cosmic_explorer_basic.webp'
    }));
  }
}
