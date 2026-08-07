import { Request, Response } from 'express';
import { InviteService } from '../../core/services/InviteService';

export class InviteController {
  constructor(private inviteService: InviteService) {}

  list = async (req: Request, res: Response) => {
    const data = await this.inviteService.getInviteStats(req.user!.userId);
    res.json({ success: true, data, error: null });
  };

  redeem = async (req: Request, res: Response) => {
    const { inviteCode } = req.body;
    const data = await this.inviteService.redeem(inviteCode, req.user!.userId);
    res.json({ success: true, data, error: null });
  };
}
