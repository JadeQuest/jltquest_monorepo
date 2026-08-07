import { Request, Response } from 'express';
import { SocialService } from '../../core/services/SocialService';

export class SocialController {
  constructor(private socialService: SocialService) {}

  getOAuthUrl = async (req: Request, res: Response) => {
    const { platform } = req.params;
    const data = await this.socialService.getOAuthUrl(platform as string, req.user!.userId);
    res.json({ success: true, data: { oauthUrl: data }, error: null });
  };

  callback = async (req: Request, res: Response) => {
    const { platform } = req.params;
    const { code } = req.body;
    const data = await this.socialService.handleCallback(req.user!.userId, platform as string, code);
    res.json({ success: true, data, error: null });
  };

  disconnect = async (req: Request, res: Response) => {
    const { platform } = req.params;
    const data = await this.socialService.disconnect(req.user!.userId, platform as string);
    res.json({ success: true, data, error: null });
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
