import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../core/errors/AppError';
import { ErrorCode, ErrorMessages } from '@jlt/constants';
import type { ApiResponse } from '@jlt/types';

export const errorHandler = (err: any, _req: Request, res: Response<ApiResponse<null>>, _next: NextFunction) => {
  // Server-side error logging
  console.error('[API Error Handler]:', err);

  let statusCode = 500;
  let code: string = ErrorCode.INTERNAL_ERROR;
  let message: string = ErrorMessages[ErrorCode.INTERNAL_ERROR] || 'An unexpected error occurred.';

  const isProduction = process.env.NODE_ENV === 'production';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else if (err && typeof err === 'object') {
    code = err.code || ErrorCode.BAD_REQUEST;

    // Sanitize database internal details in production
    if (isProduction) {
      if (
        err.code?.startsWith('P2') ||
        err.message?.includes('Prisma') ||
        err.message?.includes('database') ||
        err.message?.includes('Connection')
      ) {
        message = 'A secure database error occurred. Please try again.';
      } else {
        message = 'An unexpected server error occurred.';
      }
    } else {
      message = err.message || message;
    }

    if (err.status) {
      statusCode = err.status;
    } else if (code === ErrorCode.UNAUTHORIZED) {
      statusCode = 401;
    } else if (code === ErrorCode.FORBIDDEN) {
      statusCode = 403;
    } else if (code.includes('NOT_FOUND')) {
      statusCode = 404;
    } else if (code === ErrorCode.ALREADY_CLAIMED || code === ErrorCode.ACCOUNT_ALREADY_LINKED || err.code === 'P2002') {
      statusCode = 409;
      if (err.code === 'P2002') {
        code = ErrorCode.ALREADY_CLAIMED;
        message = 'Action already completed or resource already claimed.';
      }
    }
  }

  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message
    }
  });
};
