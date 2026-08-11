import { Request, Response } from 'express';
import { AuthService } from '../../core/services/AuthService';

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: Request, res: Response) => {
    const data = await this.authService.login(req.body.walletAddress);
    res.json({ success: true, data, error: null });
  };
}
