import jwt from 'jsonwebtoken';
import { verifyMessage } from 'viem';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { prisma } from '../../infrastructure/database/prisma';
import { BadRequestError, UnauthorizedError } from '../errors/AppError';
import { ErrorCode, APP_CONFIG } from '@jlt/constants';

const JWT_SECRET = process.env.JWT_SECRET || 'mock_secret';

export class AuthService {
  constructor(private userRepository: UserRepository = new UserRepository()) {}

  async login(walletAddress?: string, signature?: string, message?: string) {
    if (!walletAddress || !signature || !message) {
      throw new BadRequestError(
        'walletAddress, signature, and message are required for login',
        ErrorCode.INVALID_INPUT
      );
    }

    // 1. Verify message timestamp to prevent signature replay attacks
    const timestampMatch = message.match(/Timestamp:\s*(\d+)/i);
    if (!timestampMatch) {
      throw new BadRequestError(
        'Message must contain a valid Timestamp value.',
        ErrorCode.INVALID_INPUT
      );
    }

    const timestamp = Number(timestampMatch[1]);
    const fiveMinutes = 5 * 60 * 1000;
    const now = Date.now();

    if (Math.abs(now - timestamp) > fiveMinutes) {
      throw new BadRequestError(
        'Signature challenge expired. Please re-sign.',
        ErrorCode.SIGNATURE_EXPIRED
      );
    }

    // 2. Cryptographic signature check
    try {
      const isVerified = await verifyMessage({
        address: walletAddress as `0x${string}`,
        message,
        signature: signature as `0x${string}`
      });

      if (!isVerified) {
        throw new BadRequestError(
          'Cryptographic verification failed: wallet signature does not match address.',
          ErrorCode.INVALID_SIGNATURE
        );
      }
    } catch (e: any) {
      throw new BadRequestError(
        `Failed to verify signature: ${e.message || e}`,
        ErrorCode.INVALID_SIGNATURE
      );
    }

    // 3. Upsert user
    const user = await this.userRepository.upsertByWallet(prisma, walletAddress);

    // 4. Generate Access and Refresh Tokens
    const { token, refreshToken } = await this.generateTokenPair(user.id, user.walletAddress || '', user.role);

    // Log login success
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'AUTH_LOGIN_SUCCESS',
        metadata: { walletAddress: user.walletAddress }
      }
    });

    return {
      token,
      refreshToken,
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

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required', ErrorCode.INVALID_INPUT);
    }

    // Look up refresh token in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token', ErrorCode.INVALID_REFRESH_TOKEN);
    }

    // Token reuse detection: if token is already revoked, it suggests token theft.
    // Revoke all sessions for this user for security.
    if (storedToken.isRevoked) {
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { isRevoked: true }
      });
      await prisma.auditLog.create({
        data: {
          userId: storedToken.userId,
          action: 'AUTH_REFRESH_TOKEN_REUSE_DETECTED',
          metadata: { token: refreshToken }
        }
      });
      throw new UnauthorizedError('Session revoked due to token reuse detection', ErrorCode.REFRESH_TOKEN_REVOKED);
    }

    // Check expiration
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true }
      });
      throw new UnauthorizedError('Refresh token expired', ErrorCode.REFRESH_TOKEN_EXPIRED);
    }

    // Revoke current refresh token (one-time use)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true }
    });

    // Generate new token pair
    const tokenPair = await this.generateTokenPair(storedToken.userId, storedToken.user.walletAddress || '', storedToken.user.role);

    return {
      token: tokenPair.token,
      refreshToken: tokenPair.refreshToken,
      expiresIn: APP_CONFIG.AUTH.TOKEN_EXPIRES_IN_SECONDS
    };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return;
    
    // Revoke token in DB
    try {
      const storedToken = await prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { isRevoked: true }
      });
      
      await prisma.auditLog.create({
        data: {
          userId: storedToken.userId,
          action: 'AUTH_LOGOUT',
          metadata: { token: refreshToken }
        }
      });
    } catch (e) {
      // Fail silently if token doesn't exist
    }
  }

  private async generateTokenPair(userId: string, walletAddress: string, role: string) {
    const token = jwt.sign(
      { userId, walletAddress, role },
      JWT_SECRET,
      { 
        expiresIn: APP_CONFIG.AUTH.TOKEN_EXPIRES_IN_STR as any,
        issuer: 'JLTQuest-Issuer',
        audience: 'JLTQuest-Audience'
      }
    );

    const refreshJwt = crypto.randomUUID(); // Secure random unique string for DB tracking
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + APP_CONFIG.AUTH.REFRESH_TOKEN_EXPIRES_IN_SECONDS);

    // Save refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshJwt,
        userId,
        expiresAt
      }
    });

    return { token, refreshToken: refreshJwt };
  }
}
