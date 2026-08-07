import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { prisma } from '../../infrastructure/database/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'mock_secret';

export class AuthController {
  constructor(private userRepository: UserRepository = new UserRepository()) {}

  login = async (req: Request, res: Response) => {
    try {
      const { walletAddress } = req.body;
      if (!walletAddress) {
        return res.status(400).json({ success: false, data: null, error: { code: 'INVALID_INPUT', message: 'walletAddress required' }});
      }

      // Upsert User in database with walletAddress & streak
      const user = await this.userRepository.upsertByWallet(prisma, walletAddress);
      
      const token = jwt.sign({ userId: user.id, walletAddress: user.walletAddress }, JWT_SECRET, { expiresIn: '1d' });

      return res.json({
        success: true,
        data: {
          token,
          expiresIn: 86400,
          user: {
            id: user.id,
            walletAddress: user.walletAddress,
            walletConnected: user.walletConnected,
            level: user.level,
            xp: user.xp,
            gp: user.gp,
          }
        },
        error: null
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        data: null,
        error: { code: 'SERVER_ERROR', message: err?.message || 'Login failed' }
      });
    }
  };
}

