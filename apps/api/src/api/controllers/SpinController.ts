import { Request, Response } from 'express';
import { SpinService } from '../../core/services/SpinService';

export class SpinController {
  constructor(private spinService: SpinService) {}

  getStatus = async (req: Request, res: Response) => {
    const data = await this.spinService.getStatus(req.user!.userId);
    res.json({ success: true, data, error: null });
  };

  spin = async (req: Request, res: Response) => {
    const { useFreeSpin } = req.body;
    const data = await this.spinService.spin(req.user!.userId, !!useFreeSpin);
    res.json({ success: true, data, error: null });
  };

  purchase = async (req: Request, res: Response) => {
    const data = await this.spinService.purchase(req.user!.userId);
    res.json({ success: true, data, error: null });
  };
}
