import { Request, Response } from 'express';
import { RarePassService } from '../../core/services/RarePassService';
import type {
  ApiResponse,
  RarePassStatusDto,
  RarePassLevelConfigDto,
  RarePassMissionDto,
  RarePassClaimResultDto,
  RarePassMissionClaimResultDto,
  RarePassPurchaseResultDto
} from '@jlt/types';

/**
 * Controller handling Rare Pass seasonal battlepass, rewards, missions, and premium upgrades.
 */
export class RarePassController {
  constructor(private rarePassService: RarePassService) {}

  /**
   * GET /api/v1/rarepass/status
   * Retrieve active Rare Pass season info, current RP XP, and user tier progress.
   */
  getStatus = async (req: Request, res: Response<ApiResponse<RarePassStatusDto>>) => {
    const data = await this.rarePassService.getPassStatus(req.user!.userId);
    res.status(200).json({ success: true, data, error: null });
  };

  /**
   * GET /api/v1/rarepass/rewards
   * List all track levels and rewards with user's claim status.
   */
  getRewards = async (req: Request, res: Response<ApiResponse<RarePassLevelConfigDto[]>>) => {
    const data = await this.rarePassService.getRewards(req.user!.userId);
    res.status(200).json({ success: true, data, error: null });
  };

  /**
   * POST /api/v1/rarepass/claim
   * Claim an unlocked free or premium track reward.
   */
  claimReward = async (req: Request, res: Response<ApiResponse<RarePassClaimResultDto>>) => {
    const { rewardId } = req.body;
    const data = await this.rarePassService.claimReward(req.user!.userId, rewardId);
    res.status(200).json({ success: true, data, error: null });
  };

  /**
   * GET /api/v1/rarepass/missions
   * List daily, weekly, and seasonal missions with user progress.
   */
  getMissions = async (req: Request, res: Response<ApiResponse<RarePassMissionDto[]>>) => {
    const data = await this.rarePassService.getMissions(req.user!.userId);
    res.status(200).json({ success: true, data, error: null });
  };

  /**
   * POST /api/v1/rarepass/missions/:missionId/claim
   * Claim RP XP reward for a completed mission.
   */
  claimMission = async (req: Request, res: Response<ApiResponse<RarePassMissionClaimResultDto>>) => {
    const { missionId } = req.params;
    const data = await this.rarePassService.claimMission(req.user!.userId, missionId as string);
    res.status(200).json({ success: true, data, error: null });
  };

  /**
   * POST /api/v1/rarepass/buy-premium
   * Unlock Premium Rare Pass using JLT balance.
   */
  buyPremium = async (req: Request, res: Response<ApiResponse<RarePassPurchaseResultDto>>) => {
    const data = await this.rarePassService.buyPremium(req.user!.userId);
    res.status(200).json({ success: true, data, error: null });
  };
}
