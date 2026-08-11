import rateLimit from 'express-rate-limit';
import { ErrorCode } from '@jlt/constants';

export const loginRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP/wallet to 10 login requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: {
      code: ErrorCode.BAD_REQUEST,
      message: 'Too many login attempts. Please try again after a minute.'
    }
  }
});

export const transactionRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 transaction attempts per window (spins, claims, Pass purchase)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: {
      code: ErrorCode.BAD_REQUEST,
      message: 'Rate limit exceeded for financial transactions. Please slow down.'
    }
  }
});

export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 150, // Limit each IP to 150 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: {
      code: ErrorCode.BAD_REQUEST,
      message: 'Too many requests. Please try again later.'
    }
  }
});
