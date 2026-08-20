import { Request, Response } from 'express';
import { QuestService } from '../../core/services/QuestService';
import type { ApiResponse, QuestDto, QuestClaimResultDto } from '@jlt/types';

/**
 * Controller handling user onboarding and repeatable quests listing and claiming.
 */
export class QuestController {
  constructor(private questService: QuestService) {}

  /**
   * GET /api/v1/quests
   * List all active quests with user completion status and claim eligibility.
   */
  list = async (req: Request, res: Response<ApiResponse<QuestDto[]>>) => {
    const data = await this.questService.listQuests(req.user!.userId);
    res.status(200).json({ success: true, data, error: null });
  };

  /**
   * POST /api/v1/quests/:questId/claim
   * Claim completion reward for an eligible quest.
   */
  claim = async (req: Request, res: Response<ApiResponse<QuestClaimResultDto>>) => {
    const { questId } = req.params;
    const data = await this.questService.claim(req.user!.userId, questId as string);
    res.status(200).json({ success: true, data, error: null });
  };
}
