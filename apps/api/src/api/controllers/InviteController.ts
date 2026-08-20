import { Request, Response } from 'express';
import { InviteService } from '../../core/services/InviteService';
import type { ApiResponse, InviteStatsDto, RedeemInviteResultDto, ClaimMilestoneResultDto } from '@jlt/types';

/**
 * Controller handling invite referral stats, code redemption, and squad milestone claims.
 */
export class InviteController {
  constructor(private inviteService: InviteService) {}

  /**
   * GET /api/v1/invites
   * Fetch invite code, total referrals, reward earnings, and redemption list.
   */
  list = async (req: Request, res: Response<ApiResponse<InviteStatsDto>>) => {
    const data = await this.inviteService.getInviteStats(req.user!.userId);
    res.status(200).json({ success: true, data, error: null });
  };

  /**
   * POST /api/v1/invites/redeem
   * Redeem a friend's referral invite code to earn bonus GP.
   */
  redeem = async (req: Request, res: Response<ApiResponse<RedeemInviteResultDto>>) => {
    const inviteCode = req.body.inviteCode || req.body.code;
    const data = await this.inviteService.redeem(inviteCode, req.user!.userId);
    res.status(200).json({ success: true, data, error: null });
  };

  /**
   * POST /api/v1/invites/claim-milestone
   * Claim bonus reward when referred friends reach level milestones.
   */
  claimMilestone = async (req: Request, res: Response<ApiResponse<ClaimMilestoneResultDto>>) => {
    const { inviteeCount, levelReached } = req.body;
    const data = await this.inviteService.claimMilestone(req.user!.userId, Number(inviteeCount), Number(levelReached));
    res.status(200).json({ success: true, data, error: null });
  };
}
