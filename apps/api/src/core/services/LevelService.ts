import { calculateXpRequiredForLevel, getLevelTier } from '../utils/leveling';

export class LevelService {
  async getRequirement(level: number) {
    return {
      level,
      levelTier: getLevelTier(level),
      xpRequired: calculateXpRequiredForLevel(level)
    };
  }
}
