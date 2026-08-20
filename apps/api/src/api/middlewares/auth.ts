import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ErrorCode, ErrorMessages } from '@jlt/constants';
import { userRepository } from '../../di/container';
import { prisma } from '../../infrastructure/database/prisma';
import type { DecodedToken } from '@jlt/types';

const JWT_SECRET = process.env.JWT_SECRET || 'mock_secret';

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next({ code: ErrorCode.UNAUTHORIZED, message: 'Missing or invalid token', status: 401 });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'JLTQuest-Issuer',
      audience: 'JLTQuest-Audience'
    }) as DecodedToken;

    // Validate user is active in DB repository
    const user = await userRepository.findById(prisma, decoded.userId);

    if (!user || !user.isActive || user.isDelete) {
      return next({ code: ErrorCode.UNAUTHORIZED, message: 'User session is inactive or deactivated.', status: 401 });
    }

    req.user = {
      userId: decoded.userId,
      walletAddress: decoded.walletAddress || user.walletAddress || undefined,
      role: user.role
    };

    next();
  } catch (err) {
    return next({ code: ErrorCode.UNAUTHORIZED, message: 'Invalid or expired token', status: 401 });
  }
};

// RBAC Authorization Middleware
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next({ code: ErrorCode.UNAUTHORIZED, message: 'Authentication required', status: 401 });
    }

    const role = req.user.role || 'USER';
    if (!allowedRoles.includes(role)) {
      return next({ code: ErrorCode.FORBIDDEN, message: ErrorMessages[ErrorCode.FORBIDDEN], status: 403 });
    }

    next();
  };
};

// CSRF Double Submit Cookie Middleware
export const verifyCsrf = (req: Request, _res: Response, next: NextFunction) => {
  // If request uses Bearer token authorization in header, CSRF protection is not needed
  if (req.headers.authorization) {
    return next();
  }

  const csrfCookie = req.cookies?.jlt_csrf;
  const csrfHeader = req.headers['x-csrf-token'] || req.headers['X-CSRF-Token'] || req.headers['X-Csrf-Token'];

  if (!csrfCookie || csrfCookie !== csrfHeader) {
    return next({ code: ErrorCode.CSRF_TOKEN_INVALID, message: ErrorMessages[ErrorCode.CSRF_TOKEN_INVALID], status: 403 });
  }

  next();
};
