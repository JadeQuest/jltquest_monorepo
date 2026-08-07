import { Request, Response } from 'express';
import { SocialService } from '../../core/services/SocialService';

export class SocialController {
  constructor(private socialService: SocialService) {}

  getOAuthUrl = async (req: Request, res: Response) => {
    try {
      const { platform } = req.params;
      const data = await this.socialService.getOAuthUrl(platform as string, req.user!.userId);
      const oauthUrl = typeof data === 'string' ? data : (data?.url || data?.webUrl);
      res.json({ success: true, data: { oauthUrl, ...(typeof data === 'object' ? data : {}) }, error: null });
    } catch (err: any) {
      res.status(400).json({ success: false, data: null, error: { code: 'BAD_REQUEST', message: err?.message || 'Failed' } });
    }
  };

  callback = async (req: Request, res: Response) => {
    try {
      const { platform } = req.params;
      const payload = req.body || {};
      const data = await this.socialService.handleCallback(req.user!.userId, platform as string, payload);
      res.json({ success: true, data, error: null });
    } catch (err: any) {
      res.status(400).json({ success: false, data: null, error: { code: 'BAD_REQUEST', message: err?.message || 'Callback failed' } });
    }
  };

  disconnect = async (req: Request, res: Response) => {
    try {
      const { platform } = req.params;
      const data = await this.socialService.disconnect(req.user!.userId, platform as string);
      res.json({ success: true, data, error: null });
    } catch (err: any) {
      res.status(400).json({ success: false, data: null, error: { code: 'BAD_REQUEST', message: err?.message || 'Disconnect failed' } });
    }
  };

  listQuests = async (req: Request, res: Response) => {
    const data = [
      { questId: 'x_follow', platform: 'x', name: 'Follow official account', gpReward: 50, xpReward: 25, frequency: 'one_time', completed: false }
    ];
    res.json({ success: true, data, error: null });
  };

  claimQuest = async (req: Request, res: Response) => {
    res.json({ success: true, data: { gpAwarded: 50, xpAwarded: 25 }, error: null });
  };
}

