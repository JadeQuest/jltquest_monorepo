export const LEVEL_XP_REQUIREMENTS: Record<number, number> = {
  1: 100,
  2: 150,
  3: 225,
  4: 325,
  5: 450,
  6: 600,
  7: 775,
  8: 975,
  9: 1200,
  10: 1450,
  11: 1725,
  12: 2025,
  13: 2350,
  14: 2700,
  15: 3075,
  16: 3475,
  17: 3900,
  18: 4350,
  19: 4825,
  20: 5325,
  21: 5850,
  22: 6400,
  23: 6975,
  24: 7575,
  25: 8200,
  26: 8850,
  27: 9525,
  28: 10225,
  29: 10950,
  30: 11700
};

export function calculateXpRequiredForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level <= 30) {
    return LEVEL_XP_REQUIREMENTS[level] || 100;
  }
  
  // After level 30, increase by 10% per level
  const base = LEVEL_XP_REQUIREMENTS[30];
  return Math.round(base * Math.pow(1.10, level - 30));
}
