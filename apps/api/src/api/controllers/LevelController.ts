import { Request, Response } from 'express';
import { LevelService } from '../../core/services/LevelService';

export class LevelController {
  constructor(private levelService: LevelService) {}

  getRequirement = async (req: Request, res: Response) => {
    const level = parseInt(req.params.level as string, 10);
    const data = await this.levelService.getRequirement(level);
    res.json({ success: true, data, error: null });
  };
}
