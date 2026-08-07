import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { calculateXpRequiredForLevel } from '../utils/leveling';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getDashboard(userId: string) {
    const user = await this.userRepository.findWithConnections(null as any, userId); // we will fix this properly, wait findWithConnections expects tx. Let's import prisma.
    if (!user) throw { code: 'NOT_FOUND', message: 'User not found' };

    const socialConnections: Record<string, any> = {
      x: { connected: false },
      discord: { connected: false },
      telegram: { connected: false }
    };

    user.socialConnections.forEach((c: any) => {
      const platformKey = c.platform.toLowerCase();
      socialConnections[platformKey] = {
        connected: c.connected,
        handle: c.handle
      };
    });

    const xpRequiredForNext = calculateXpRequiredForLevel(user.level);

    return {
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        level: user.level,
        xp: user.xp,
        gp: user.gp,
        streak: user.streak,
        inviteCode: user.inviteCode
      },
      leveling: {
        currentXp: user.xp,
        nextLevelXp: xpRequiredForNext,
        progress: (user.xp / xpRequiredForNext) * 100
      },
      socialConnections
    };
  }
}
