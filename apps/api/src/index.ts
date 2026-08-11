import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import router from './api/routes';
import { APP_NAME, API_VERSION } from '@jlt/constants';
import type { ApiResponse } from '@jlt/types';
import { errorHandler } from './api/middlewares/errorHandler';
import { generalRateLimiter } from './api/middlewares/rateLimiter';

const app = express();
const PORT = process.env.API_PORT || 4000;

// Production Startup Assertions for Cryptographic Secrets
if (process.env.NODE_ENV === 'production') {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === 'your_jwt_secret_key_here' || jwtSecret === 'mock_secret' || jwtSecret.length < 16) {
    console.error('FATAL: A strong process.env.JWT_SECRET must be configured in production!');
    process.exit(1);
  }

  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey || encryptionKey === 'mock_encryption_key_32_bytes_long_!!!' || encryptionKey.length !== 32) {
    console.error('FATAL: A strong 32-character process.env.ENCRYPTION_KEY must be configured in production!');
    process.exit(1);
  }
}

// 1. Basic security headers
app.use(helmet());
app.disable('x-powered-by');
app.set('etag', 'strong');

// 2. Cookie parser for refresh token cookies
app.use(cookieParser());

// 3. Secure CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean) || [];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      // Allow if origin matches allowlist, or if in development
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS'));
      }
    },
    credentials: true,
    maxAge: 86400,
  }),
);

// 4. Maximum JSON payload limit (16KB)
app.use(express.json({ limit: '16kb' }));

// 5. Global Rate Limiter
app.use(generalRateLimiter);

// Health Endpoint
app.get(`/api/${API_VERSION}/health`, (_req, res) => {
  const response: ApiResponse<{ app: string; status: string }> = {
    success: true,
    data: { app: APP_NAME, status: 'healthy' },
    error: null
  };
  res
    .set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120')
    .json(response);
});

// API Routes
app.use(`/api/${API_VERSION}`, router);

// Central Error Handler Middleware
app.use(errorHandler);

process.on('unhandledRejection', (reason, promise) => {
  console.error('[API Server] Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[API Server] Uncaught Exception:', err);
});

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server listening on http://localhost:${PORT}`);
  }
});
