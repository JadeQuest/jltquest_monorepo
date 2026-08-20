import { Request, Response } from 'express';
import { SocialService } from '../../core/services/SocialService';
import type {
  ApiResponse,
  SocialOAuthUrlDto,
  SocialCallbackResultDto,
  SocialDisconnectResultDto,
  SocialQuestDto,
  SocialQuestClaimResultDto
} from '@jlt/types';

/**
 * Controller handling social account connections (X, Discord, Telegram, etc.) and social quests.
 */
export class SocialController {
  constructor(private socialService: SocialService) {}

  /**
   * GET /api/v1/social/:platform/oauth-url
   * Generate OAuth authentication URL or deep link for a specific platform.
   */
  getOAuthUrl = async (req: Request, res: Response<ApiResponse<SocialOAuthUrlDto>>) => {
    const { platform } = req.params;
    const data = await this.socialService.getOAuthUrl(platform as string, req.user!.userId);
    res.status(200).json({ success: true, data, error: null });
  };

  /**
   * POST /api/v1/social/:platform/callback
   * Complete social authorization callback and link provider account to user.
   */
  callback = async (req: Request, res: Response<ApiResponse<SocialCallbackResultDto>>) => {
    const { platform } = req.params;
    const payload = req.body || {};
    const data = await this.socialService.handleCallback(req.user!.userId, platform as string, payload);
    res.status(200).json({ success: true, data, error: null });
  };

  /**
   * DELETE /api/v1/social/:platform
   * Disconnect a linked social platform and apply clawbacks if eligible.
   */
  disconnect = async (req: Request, res: Response<ApiResponse<SocialDisconnectResultDto>>) => {
    const { platform } = req.params;
    const data = await this.socialService.disconnect(req.user!.userId, platform as string);
    res.status(200).json({ success: true, data, error: null });
  };

  /**
   * GET /api/v1/social/quests
   * List all social media quests and user's claim eligibility.
   */
  listQuests = async (req: Request, res: Response<ApiResponse<SocialQuestDto[]>>) => {
    const data = await this.socialService.listQuests(req.user!.userId);
    res.status(200).json({ success: true, data, error: null });
  };

  /**
   * POST /api/v1/social/quests/:questId/claim
   * Claim completion reward for a verified social quest.
   */
  claimQuest = async (req: Request, res: Response<ApiResponse<SocialQuestClaimResultDto>>) => {
    const { questId } = req.params;
    const data = await this.socialService.claimQuest(req.user!.userId, questId as string);
    res.status(200).json({ success: true, data, error: null });
  };
}
