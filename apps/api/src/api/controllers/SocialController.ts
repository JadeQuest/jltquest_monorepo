import { Request, Response } from 'express';
import { SocialService } from '../../core/services/SocialService';

export class SocialController {
  constructor(private socialService: SocialService) {}

  getOAuthUrl = async (req: Request, res: Response) => {
    const { platform } = req.params;
    const data = await this.socialService.getOAuthUrl(platform as string, req.user!.userId);
    const oauthUrl = typeof data === 'string' ? data : (data?.url || data?.webUrl);
    res.json({ success: true, data: { oauthUrl, ...(typeof data === 'object' ? data : {}) }, error: null });
  };

  callback = async (req: Request, res: Response) => {
    const { platform } = req.params;
    const payload = req.body || {};
    const data = await this.socialService.handleCallback(req.user!.userId, platform as string, payload);
    res.json({ success: true, data, error: null });
  };

  disconnect = async (req: Request, res: Response) => {
    const { platform } = req.params;
    const data = await this.socialService.disconnect(req.user!.userId, platform as string);
    res.json({ success: true, data, error: null });
  };

  listQuests = async (req: Request, res: Response) => {
    const data = await this.socialService.listQuests(req.user!.userId);
    res.json({ success: true, data, error: null });
  };

  claimQuest = async (req: Request, res: Response) => {
    const { questId } = req.params;
    const data = await this.socialService.claimQuest(req.user!.userId, questId as string);
    res.json({ success: true, data, error: null });
  };
}
