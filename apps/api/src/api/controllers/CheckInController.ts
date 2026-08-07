import { Request, Response } from 'express';
import { CheckInService } from '../../core/services/CheckInService';

export class CheckInController {
  constructor(private checkInService: CheckInService) {}

  getStatus = async (req: Request, res: Response) => {
    const data = await this.checkInService.getStatus(req.user!.userId);
    res.json({ success: true, data, error: null });
  };

  claim = async (req: Request, res: Response) => {
    const data = await this.checkInService.claim(req.user!.userId);
    res.json({ success: true, data, error: null });
  };
}
