import { Request, Response } from 'express';
import { LeaderboardService } from '../../core/services/LeaderboardService';

export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  getLeaderboard = async (req: Request, res: Response) => {
    const type = (req.query.type as 'gp' | 'xp' | 'streak') || 'gp';
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const data = await this.leaderboardService.getLeaderboard(type, limit);
    res.json({ success: true, data, error: null });
  };
}
