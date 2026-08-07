import express from 'express';
import cors from 'cors';
import router from './api/routes';
import { Request, Response, NextFunction } from 'express';
import { APP_NAME, API_VERSION } from '@jlt/constants';
import type { ApiResponse } from '@jlt/types';

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean);

app.disable('x-powered-by');
app.set('etag', 'strong');
app.use(
  cors({
    origin: allowedOrigins?.length ? allowedOrigins : true,
    maxAge: 86400,
  }),
);
app.use(express.json({ limit: '16kb' }));

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

// Error Handler Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred.';
  const status = err.status || (code === 'UNAUTHORIZED' ? 401 : code.includes('NOT_FOUND') ? 404 : 400);

  res.status(status).json({
    success: false,
    data: null,
    error: {
      code,
      message
    }
  });
});

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server listening on http://localhost:${PORT}`);
  }
});
