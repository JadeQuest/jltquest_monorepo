import { Request, Response } from 'express';
import { LevelService } from '../../core/services/LevelService';
import type { ApiResponse, LevelRequirementDto } from '@jlt/types';

/**
 * Controller handling level requirements and leveling progression curves.
 */
export class LevelController {
  constructor(private levelService: LevelService) {}

  /**
   * GET /api/v1/levels/:level/requirement
   * Get XP requirement and tier classification for a target level.
   */
  getRequirement = async (req: Request, res: Response<ApiResponse<LevelRequirementDto>>) => {
    const level = parseInt(req.params.level as string, 10);
    const data = await this.levelService.getRequirement(level);
    res.status(200).json({ success: true, data, error: null });
  };
}
