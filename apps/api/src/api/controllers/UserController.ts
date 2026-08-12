import { Request, Response } from 'express';
import { UserService } from '../../core/services/UserService';

export class UserController {
  constructor(private userService: UserService) {}

  getMe = async (req: Request, res: Response) => {
    const data = await this.userService.getDashboard(req.user!.userId);
    res.json({ success: true, data, error: null });
  };

  convertGp = async (req: Request, res: Response) => {
    const { gpAmount } = req.body;
    const data = await this.userService.convertGp(req.user!.userId, Number(gpAmount));
    res.json({ success: true, data, error: null });
  };
}
