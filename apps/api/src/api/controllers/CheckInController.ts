import { Request, Response } from 'express';
import { CheckInService } from '../../core/services/CheckInService';
import type { ApiResponse, CheckInStatusDto, CheckInClaimResultDto } from '@jlt/types';

/**
 * Controller handling daily login check-in streak and reward claiming endpoints.
 */
export class CheckInController {
  constructor(private checkInService: CheckInService) {}

  /**
   * GET /api/v1/checkin/status
   * Check current user streak day, claim eligibility, and upcoming rewards.
   */
  getStatus = async (req: Request, res: Response<ApiResponse<CheckInStatusDto>>) => {
    const data = await this.checkInService.getStatus(req.user!.userId);
    res.status(200).json({ success: true, data, error: null });
  };

  /**
   * POST /api/v1/checkin/claim
   * Claim daily streak check-in reward (GP + XP + RP XP).
   */
  claim = async (req: Request, res: Response<ApiResponse<CheckInClaimResultDto>>) => {
    const data = await this.checkInService.claim(req.user!.userId);
    res.status(200).json({ success: true, data, error: null });
  };
}
