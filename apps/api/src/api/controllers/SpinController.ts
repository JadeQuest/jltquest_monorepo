import { Request, Response } from 'express';
import { SpinService } from '../../core/services/SpinService';

export class SpinController {
  constructor(private spinService: SpinService) {}

  getStatus = async (req: Request, res: Response) => {
    try {
      const data = await this.spinService.getStatus(req.user!.userId);
      res.json({ success: true, data, error: null });
    } catch (error: any) {
      console.error('Spin getStatus error:', error);
      res.status(500).json({ success: false, data: null, error: error.message || 'Internal server error' });
    }
  };

  spin = async (req: Request, res: Response) => {
    try {
      const { useFreeSpin } = req.body;
      const data = await this.spinService.spin(req.user!.userId, !!useFreeSpin);
      res.json({ success: true, data, error: null });
    } catch (error: any) {
      console.error('Spin execution error:', error);
      const status = error.code ? 400 : 500;
      res.status(status).json({ success: false, data: null, error: error.message || 'Internal server error' });
    }
  };

  purchase = async (req: Request, res: Response) => {
    try {
      const data = await this.spinService.purchase(req.user!.userId);
      res.json({ success: true, data, error: null });
    } catch (error: any) {
      console.error('Spin purchase error:', error);
      const status = error.code ? 400 : 500;
      res.status(status).json({ success: false, data: null, error: error.message || 'Internal server error' });
    }
  };
}
