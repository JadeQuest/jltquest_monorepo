import { Request, Response } from 'express';
import { UserService } from '../../core/services/UserService';

/**
 * Controller handling user profile dashboard statistics and GP->JLT conversions.
 */
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * GET /api/v1/users/me
   * Fetch authenticated user's profile, level tier, balances, and connected socials.
   */
  getMe = async (req: Request, res: Response) => {
    const data = await this.userService.getDashboard(req.user!.userId);
    res.json({ success: true, data, error: null });
  };

  /**
   * POST /api/v1/users/convert-gp
   * Convert Gold Points (GP) balance into spendable JLT tokens.
   */
  convertGp = async (req: Request, res: Response) => {
    const { gpAmount } = req.body;
    const data = await this.userService.convertGp(req.user!.userId, Number(gpAmount));
    res.json({ success: true, data, error: null });
  };
}
