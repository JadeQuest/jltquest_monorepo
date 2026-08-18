import { getLevelTier } from '../utils/leveling';

export type LeaderboardCategory =
  | 'gp'
  | 'jlt'
  | 'level'
  | 'streak'
  | 'pass'
  | 'total_gp'
  | 'total_jlt'
  | 'highest_streak'
  | 'season_rank'
  | 'xp';

export class LeaderboardService {
  constructor(private prisma: any) {}

  async getLeaderboard(type: LeaderboardCategory = 'gp', limit = 20) {
    const take = Math.min(Math.max(1, limit), 100);

    // Normalize category names
    let category = type;
    if (category === 'gp') category = 'total_gp';
    if (category === 'jlt') category = 'total_jlt';
    if (category === 'xp') category = 'level';
    if (category === 'streak') category = 'highest_streak';
    if (category === 'pass') category = 'season_rank';

    // 1. Fetch active Rare Pass Season for season_rank
    const activeSeason = await this.prisma.rarePassSeason.findFirst({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true },
    });

    // 2. Aggregate lifetime earned GP per user (sum of all credit/positive GP entries)
    const gpSums = await this.prisma.gpLedgerEntry.groupBy({
      by: ['userId'],
      where: { amount: { gt: 0 } },
      _sum: { amount: true },
    });
    const lifetimeGpMap = new Map<string, number>();
    for (const g of gpSums) {
      lifetimeGpMap.set(g.userId, g._sum.amount || 0);
    }

    // 3. Aggregate lifetime total XP per user
    const xpSums = await this.prisma.xpLedgerEntry.groupBy({
      by: ['userId'],
      where: { amount: { gt: 0 } },
      _sum: { amount: true },
    });
    const lifetimeXpMap = new Map<string, number>();
    for (const x of xpSums) {
      lifetimeXpMap.set(x.userId, x._sum.amount || 0);
    }

    // 4. Aggregate active season RP XP per user
    const rpXpMap = new Map<string, number>();
    if (activeSeason) {
      const rpXpSums = await this.prisma.rpXpLedgerEntry.groupBy({
        by: ['userId'],
        where: { seasonId: activeSeason.id },
        _sum: { amount: true },
      });
      for (const r of rpXpSums) {
        rpXpMap.set(r.userId, r._sum.amount || 0);
      }
    }

    // 5. Query streaks
    const streakMap = new Map<string, { currentDay: number; longestStreak: number }>();
    try {
      const allStreaks = (await this.prisma.$queryRawUnsafe(
        'SELECT "userId", "currentDay", "longestStreak" FROM "streaks"'
      )) as any[];
      for (const s of allStreaks) {
        streakMap.set(s.userId, {
          currentDay: s.currentDay || 0,
          longestStreak: Math.max(s.longestStreak || 0, s.currentDay || 0),
        });
      }
    } catch (e) {
      // Fallback
    }

    // 6. Query all users
    const users = await this.prisma.user.findMany({
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
            avatar: { select: { name: true, characterKey: true } },
          },
        },
      },
    });

    // 7. Map and sort based on chosen category
    const mapped = users.map((u: any) => {
      // Lifetime GP: if user has ledger credits use ledger sum, else fallback to current balance
      const totalGp = Math.max(lifetimeGpMap.get(u.id) || 0, u.gp || 0);
      const totalJlt = Number(u.jlt || 0);
      const totalLifetimeXp = Math.max(lifetimeXpMap.get(u.id) || 0, u.xp || 0);
      const userStreak = streakMap.get(u.id);
      const currentStreak = userStreak?.currentDay || 0;
      const longestStreak = userStreak?.longestStreak || currentStreak;
      const seasonRpXp = rpXpMap.get(u.id) || 0;

      return {
        id: u.id,
        walletAddress: u.walletAddress,
        maskedAddress: u.walletAddress
          ? `${u.walletAddress.substring(0, 6)}...${u.walletAddress.substring(u.walletAddress.length - 4)}`
          : 'Anonymous',
        level: u.level,
        levelTier: getLevelTier(u.level),
        xp: u.xp,
        totalLifetimeXp,
        gp: u.gp,
        totalGp,
        jlt: totalJlt,
        totalJlt,
        currentStreak: u.streak?.currentDay || 0,
        longestStreak,
        seasonRpXp,
        seasonName: activeSeason?.name || 'Season 01',
        avatarUrl: u.activeAvatarVariant?.imageUrl || '/avatar/avatar.webp',
      };
    });

    // Sorting according to selected category
    if (category === 'total_gp') {
      mapped.sort((a: any, b: any) => b.totalGp - a.totalGp || b.level - a.level);
    } else if (category === 'total_jlt') {
      mapped.sort((a: any, b: any) => b.totalJlt - a.totalJlt || b.totalGp - a.totalGp);
    } else if (category === 'level') {
      mapped.sort((a: any, b: any) => b.totalLifetimeXp - a.totalLifetimeXp || b.level - a.level || b.xp - a.xp);
    } else if (category === 'highest_streak') {
      mapped.sort((a: any, b: any) => b.longestStreak - a.longestStreak || b.currentStreak - a.currentStreak);
    } else if (category === 'season_rank') {
      mapped.sort((a: any, b: any) => b.seasonRpXp - a.seasonRpXp || b.totalGp - a.totalGp);
    }

    const sliced = mapped.slice(0, take);

    return sliced.map((u: any, idx: number) => ({
      rank: idx + 1,
      ...u,
    }));
  }
}
