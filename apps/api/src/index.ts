import express from 'express';
import cors from 'cors';
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
    data: { app: APP_NAME, status: 'healthy' }
  };
  res
    .set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120')
    .json(response);
});

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server listening on http://localhost:${PORT}`);
  }
});
