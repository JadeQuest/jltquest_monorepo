import { Request, Response } from 'express';
import { SpinService } from '../../core/services/SpinService';

/**
 * Controller handling Spin to Win wheel status, spinning, and spin purchases.
 */
export class SpinController {
  constructor(private spinService: SpinService) {}

  /**
   * GET /api/v1/spin/status
   * Retrieve remaining free spins, purchased spins balance, and spin history.
   */
  getStatus = async (req: Request, res: Response) => {
    const data = await this.spinService.getStatus(req.user!.userId);
    res.json({ success: true, data, error: null });
  };

  /**
   * POST /api/v1/spin/spin
   * Execute a wheel spin using free or purchased spins.
   */
  spin = async (req: Request, res: Response) => {
    const { useFreeSpin } = req.body;
    const data = await this.spinService.spin(req.user!.userId, !!useFreeSpin);
    res.json({ success: true, data, error: null });
  };

  /**
   * POST /api/v1/spin/purchase
   * Purchase an extra spin using Gold Points (GP).
   */
  purchase = async (req: Request, res: Response) => {
    const data = await this.spinService.purchase(req.user!.userId);
    res.json({ success: true, data, error: null });
  };
}
