import { Request, Response } from 'express';
import { AvatarService } from '../../core/services/AvatarService';

export class AvatarController {
  constructor(private avatarService: AvatarService) {}

  list = async (req: Request, res: Response) => {
    const data = await this.avatarService.listAvatars(req.user!.userId);
    res.json({ success: true, data, error: null });
  };

  select = async (req: Request, res: Response) => {
    const { variantId } = req.body;
    const data = await this.avatarService.selectAvatar(req.user!.userId, variantId);
    res.json({ success: true, data, error: null });
  };

  unlock = async (req: Request, res: Response) => {
    const { variantId } = req.body;
    const data = await this.avatarService.unlockAvatar(req.user!.userId, variantId);
    res.json({ success: true, data, error: null });
  };
}
