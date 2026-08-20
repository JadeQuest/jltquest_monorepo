import { Request, Response } from 'express';
import { UserService } from '../../core/services/UserService';
import type { ApiResponse, UserDashboardDto, ConvertGpResultDto } from '@jlt/types';

/**
 * Controller handling user profile dashboard statistics and GP->JLT conversions.
 */
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * GET /api/v1/users/me
   * Fetch authenticated user's profile, level tier, balances, and connected socials.
   */
  getMe = async (req: Request, res: Response<ApiResponse<UserDashboardDto>>) => {
    const data = await this.userService.getDashboard(req.user!.userId);
    res.status(200).json({ success: true, data, error: null });
  };

  /**
   * POST /api/v1/users/convert-gp
   * Convert Gold Points (GP) balance into spendable JLT tokens.
   */
  convertGp = async (req: Request, res: Response<ApiResponse<ConvertGpResultDto>>) => {
    const { gpAmount } = req.body;
    const data = await this.userService.convertGp(req.user!.userId, Number(gpAmount));
    res.status(200).json({ success: true, data, error: null });
  };
}
