import { Request, Response } from 'express';
import { LeaderboardService } from '../../core/services/LeaderboardService';
import type { ApiResponse, LeaderboardEntryDto, LeaderboardCategory } from '@jlt/types';

/**
 * Controller exposing competitive rankings and player leaderboards.
 */
export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  /**
   * GET /api/v1/leaderboard
   * Query top rankings sorted by GP, JLT, Level, Streak, or Rare Pass Season XP.
   */
  getLeaderboard = async (req: Request, res: Response<ApiResponse<LeaderboardEntryDto[]>>) => {
    const type = (req.query.type as LeaderboardCategory) || 'total_gp';
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const data = await this.leaderboardService.getLeaderboard(type, limit);
    res.status(200).json({ success: true, data, error: null });
  };
}
