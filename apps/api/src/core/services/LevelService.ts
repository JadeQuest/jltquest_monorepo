import { calculateXpRequiredForLevel } from '../utils/leveling';

export class LevelService {
  async getRequirement(level: number) {
    return {
      level,
      xpRequired: calculateXpRequiredForLevel(level)
    };
  }
}
