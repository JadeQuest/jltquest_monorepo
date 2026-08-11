import jwt from 'jsonwebtoken';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { prisma } from '../../infrastructure/database/prisma';
import { BadRequestError } from '../errors/AppError';
import { ErrorCode, APP_CONFIG } from '@jlt/constants';

const JWT_SECRET = process.env.JWT_SECRET || 'mock_secret';

export class AuthService {
  constructor(private userRepository: UserRepository = new UserRepository()) {}

  async login(walletAddress?: string) {
    if (!walletAddress) {
      throw new BadRequestError(
        APP_CONFIG.AUTH.WALLET_ADDRESS_REQUIRED_MSG,
        ErrorCode.INVALID_INPUT
      );
    }

    const user = await this.userRepository.upsertByWallet(prisma, walletAddress);
    const token = jwt.sign(
      { userId: user.id, walletAddress: user.walletAddress },
      JWT_SECRET,
      { expiresIn: APP_CONFIG.AUTH.TOKEN_EXPIRES_IN_STR as any }
    );

    return {
      token,
      expiresIn: APP_CONFIG.AUTH.TOKEN_EXPIRES_IN_SECONDS,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        walletConnected: user.walletConnected,
        level: user.level,
        xp: user.xp,
        gp: user.gp,
        streak: user.streak,
        spinState: user.spinState,
      }
    };
  }
}
