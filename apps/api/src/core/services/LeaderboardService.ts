import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { StreakRepository } from '../../infrastructure/database/repositories/StreakRepository';
import { LedgerRepository } from '../../infrastructure/database/repositories/LedgerRepository';
import { RarePassRepository } from '../../infrastructure/database/repositories/RarePassRepository';
import { getLevelTier } from '../utils/leveling';
import { cacheService } from './CacheService';
import type { LeaderboardCategory, LeaderboardEntryDto } from '@jlt/types';

export class LeaderboardService {
  constructor(
    private userRepository: UserRepository,
    private streakRepository: StreakRepository,
    private ledgerRepository: LedgerRepository,
    private rarePassRepository: RarePassRepository,
    private prisma: any
  ) {}

  async getLeaderboard(type: LeaderboardCategory = 'total_gp', limit = 20): Promise<LeaderboardEntryDto[]> {
    const take = Math.min(Math.max(1, limit), 100);

    // Normalize category names
    let category: string = type;
    if (category === 'gp') category = 'total_gp';
    if (category === 'jlt') category = 'total_jlt';
    if (category === 'xp') category = 'level';
    if (category === 'streak') category = 'highest_streak';
    if (category === 'pass') category = 'season_rank';

    const cacheKey = `leaderboard:${category}:${take}`;
    const cachedResult = cacheService.get<LeaderboardEntryDto[]>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Run independent queries in parallel
    const [activeSeason, gpSums, xpSums, allStreaks, users] = await Promise.all([
      // 1. Active Rare Pass Season
      this.rarePassRepository.findActiveSeason(this.prisma).catch(() => null),

      // 2. Aggregate lifetime earned GP per user
      this.ledgerRepository.aggregateLifetimeGpCredits(this.prisma),

      // 3. Aggregate lifetime total XP per user
      this.ledgerRepository.aggregateLifetimeXpCredits(this.prisma),

      // 4. Streaks
      this.streakRepository.findAllStreaks(this.prisma).catch(() => []),

      // 5. Users
      this.userRepository.findAllUsersForLeaderboard(this.prisma),
    ]);

    const lifetimeGpMap = new Map<string, number>();
    for (const g of (gpSums as any[]) || []) {
      lifetimeGpMap.set(g.userId, g._sum.amount || 0);
    }

    const lifetimeXpMap = new Map<string, number>();
    for (const x of (xpSums as any[]) || []) {
      lifetimeXpMap.set(x.userId, x._sum.amount || 0);
    }

    // 4. Aggregate active season RP XP per user
    const rpXpMap = new Map<string, number>();
    if (activeSeason) {
      const rpXpSums = await this.rarePassRepository.aggregateSeasonRpXpPerUser(this.prisma, activeSeason.id);
      for (const r of (rpXpSums as any[]) || []) {
        rpXpMap.set(r.userId, r._sum.amount || 0);
      }
    }

    // 5. Query streaks
    const streakMap = new Map<string, { currentDay: number; longestStreak: number }>();
    for (const s of (allStreaks as any[]) || []) {
      streakMap.set(s.userId, {
        currentDay: s.currentDay || 0,
        longestStreak: Math.max(s.longestStreak || 0, s.currentDay || 0),
      });
    }

    // 6. Map and sort based on chosen category
    const mapped = users.map((u: any) => {
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

    const result: LeaderboardEntryDto[] = sliced.map((u: any, idx: number) => ({
      rank: idx + 1,
      ...u,
    }));

    // Cache computed leaderboard for 30 seconds
    cacheService.set(cacheKey, result, 30);

    return result;
  }
}
