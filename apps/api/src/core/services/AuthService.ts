import jwt from 'jsonwebtoken';
import { verifyMessage } from 'viem';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { prisma } from '../../infrastructure/database/prisma';
import { BadRequestError, UnauthorizedError } from '../errors/AppError';
import { ErrorCode, ErrorMessages, AuthMessages, APP_CONFIG } from '@jlt/constants';

const JWT_SECRET = process.env.JWT_SECRET || 'mock_secret';

/**
 * Service handling authentication, Web3 signature validation, and JWT token rotation.
 */
export class AuthService {
  constructor(private userRepository: UserRepository = new UserRepository()) {}

  // ───────────────────────────────────────────────────────────────────────────
  // 1. LOGIN & SIGNATURE VERIFICATION
  // ───────────────────────────────────────────────────────────────────────────
  async login(walletAddress?: string, signature?: string, message?: string) {
    if (!walletAddress || !signature || !message) {
      throw new BadRequestError(
        AuthMessages.MISSING_LOGIN_PARAMS,
        ErrorCode.INVALID_INPUT
      );
    }

    // 1.1 Verify message timestamp to prevent signature replay attacks
    const timestampMatch = message.match(/Timestamp:\s*(\d+)/i);
    if (!timestampMatch) {
      throw new BadRequestError(
        AuthMessages.MISSING_TIMESTAMP,
        ErrorCode.INVALID_INPUT
      );
    }

    const timestamp = Number(timestampMatch[1]);
    const fiveMinutes = 5 * 60 * 1000;
    const now = Date.now();

    if (Math.abs(now - timestamp) > fiveMinutes) {
      throw new BadRequestError(
        ErrorMessages[ErrorCode.SIGNATURE_EXPIRED],
        ErrorCode.SIGNATURE_EXPIRED
      );
    }

    // 1.2 Cryptographic signature verification using viem
    try {
      const isVerified = await verifyMessage({
        address: walletAddress as `0x${string}`,
        message,
        signature: signature as `0x${string}`
      });

      if (!isVerified) {
        throw new BadRequestError(
          AuthMessages.SIGNATURE_VERIFICATION_FAILED,
          ErrorCode.INVALID_SIGNATURE
        );
      }
    } catch (e: any) {
      throw new BadRequestError(
        `${AuthMessages.SIGNATURE_VERIFICATION_FAILED} (${e.message || e})`,
        ErrorCode.INVALID_SIGNATURE
      );
    }

    // 1.3 Upsert user in database repository
    const user = await this.userRepository.upsertByWallet(prisma, walletAddress);

    // 1.4 Generate access and refresh token pair
    const { token, refreshToken } = await this.generateTokenPair(user.id, user.walletAddress || '', user.role);

    // Audit log login success
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

  // ───────────────────────────────────────────────────────────────────────────
  // 2. TOKEN REFRESH & ROTATION
  // ───────────────────────────────────────────────────────────────────────────
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestError(AuthMessages.REFRESH_TOKEN_REQUIRED, ErrorCode.INVALID_INPUT);
    }

    // Look up refresh token in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken) {
      throw new UnauthorizedError(ErrorMessages[ErrorCode.INVALID_REFRESH_TOKEN], ErrorCode.INVALID_REFRESH_TOKEN);
    }

    // 2.1 Token reuse detection with 10-second grace window for concurrent requests
    if (storedToken.isRevoked) {
      const GRACE_PERIOD_MS = 10000;
      if (storedToken.createdAt && (Date.now() - new Date(storedToken.createdAt).getTime() < GRACE_PERIOD_MS)) {
        const latestToken = await prisma.refreshToken.findFirst({
          where: { userId: storedToken.userId, isRevoked: false },
          orderBy: { createdAt: 'desc' }
        });
        if (latestToken) {
          const newAccessToken = jwt.sign(
            { userId: storedToken.userId, walletAddress: storedToken.user.walletAddress, role: storedToken.user.role },
            JWT_SECRET,
            {
              expiresIn: APP_CONFIG.AUTH.TOKEN_EXPIRES_IN_STR as any,
              issuer: 'JLTQuest-Issuer',
              audience: 'JLTQuest-Audience'
            }
          );
          return {
            token: newAccessToken,
            refreshToken: latestToken.token,
            expiresIn: APP_CONFIG.AUTH.TOKEN_EXPIRES_IN_SECONDS
          };
        }
      }

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
      throw new UnauthorizedError(AuthMessages.TOKEN_REUSE_REVOKED, ErrorCode.REFRESH_TOKEN_REVOKED);
    }

    // 2.2 Check token expiration
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true }
      });
      throw new UnauthorizedError(ErrorMessages[ErrorCode.REFRESH_TOKEN_EXPIRED], ErrorCode.REFRESH_TOKEN_EXPIRED);
    }

    // 2.3 Revoke current refresh token (one-time use rotation)
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

  // ───────────────────────────────────────────────────────────────────────────
  // 3. USER LOGOUT
  // ───────────────────────────────────────────────────────────────────────────
  async logout(refreshToken: string) {
    if (!refreshToken) return;
    
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
