import { Request, Response } from 'express';
import { AvatarService } from '../../core/services/AvatarService';
import type { ApiResponse, AvatarDto, AvatarSelectResultDto, AvatarUnlockResultDto } from '@jlt/types';

/**
 * Controller handling user avatar selection, listing, and unlocking endpoints.
 */
export class AvatarController {
  constructor(private avatarService: AvatarService) {}

  /**
   * GET /api/v1/avatars
   * Fetch list of available avatars and user's unlock/active status.
   */
  list = async (req: Request, res: Response<ApiResponse<AvatarDto[]>>) => {
    const data = await this.avatarService.listAvatars(req.user!.userId);
    res.status(200).json({ success: true, data, error: null });
  };

  /**
   * POST /api/v1/avatars/select
   * Equip/select an unlocked avatar variant as active profile avatar.
   */
  select = async (req: Request, res: Response<ApiResponse<AvatarSelectResultDto>>) => {
    const { variantId } = req.body;
    const data = await this.avatarService.selectAvatar(req.user!.userId, variantId);
    res.status(200).json({ success: true, data, error: null });
  };

  /**
   * POST /api/v1/avatars/unlock
   * Purchase/unlock an avatar variant using GP/JLT balance.
   */
  unlock = async (req: Request, res: Response<ApiResponse<AvatarUnlockResultDto>>) => {
    const { variantId } = req.body;
    const data = await this.avatarService.unlockAvatar(req.user!.userId, variantId);
    res.status(200).json({ success: true, data, error: null });
  };
}
