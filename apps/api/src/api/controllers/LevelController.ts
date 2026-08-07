import { Request, Response } from 'express';
import { calculateXpRequiredForLevel } from '../../core/utils/leveling';

export class LevelController {
  getRequirement = async (req: Request, res: Response) => {
    const level = parseInt(req.params.level as string, 10);
    const data = { level, xpRequired: calculateXpRequiredForLevel(level) };
    res.json({ success: true, data, error: null });
  };
}
