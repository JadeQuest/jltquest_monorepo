import { calculateXpRequiredForLevel, getLevelTier } from '../utils/leveling';
import type { LevelRequirementDto } from '@jlt/types';

export class LevelService {
  async getRequirement(level: number): Promise<LevelRequirementDto> {
    return {
      level,
      levelTier: getLevelTier(level),
      xpRequired: calculateXpRequiredForLevel(level)
    };
  }
}
