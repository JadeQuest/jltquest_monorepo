import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../core/errors/AppError';
import { ErrorCode } from '@jlt/constants';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  // Detailed log on secure server console
  console.error('[API Error Handler]:', err);

  let statusCode = 400;
  let code = 'BAD_REQUEST';
  let message = 'An unexpected error occurred.';

  const isProduction = process.env.NODE_ENV === 'production';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else if (err && typeof err === 'object') {
    code = err.code || 'INTERNAL_ERROR';
    
    // Protect raw error messages from leaking in production
    if (isProduction) {
      if (err.code?.startsWith('P2') || err.message?.includes('Prisma') || err.message?.includes('database') || err.message?.includes('Connection')) {
        message = 'A secure database error occurred. Please try again.';
      } else {
        message = 'An unexpected server error occurred.';
      }
    } else {
      message = err.message || message;
    }
    
    if (err.status) {
      statusCode = err.status;
    } else if (code === 'UNAUTHORIZED') {
      statusCode = 401;
    } else if (code === 'FORBIDDEN') {
      statusCode = 403;
    } else if (code.includes('NOT_FOUND')) {
      statusCode = 404;
    } else if (code === 'ALREADY_CLAIMED' || code === 'ACCOUNT_ALREADY_LINKED' || err.code === 'P2002') {
      statusCode = 409;
      if (err.code === 'P2002') {
        code = 'ALREADY_CLAIMED';
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
