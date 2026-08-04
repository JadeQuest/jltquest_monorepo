import express from 'express';
import cors from 'cors';
import { APP_NAME, API_VERSION } from '@jlt/constants';
import type { ApiResponse } from '@jlt/types';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get(`/api/${API_VERSION}/health`, (_req, res) => {
  const response: ApiResponse<{ app: string; status: string }> = {
    success: true,
    data: { app: APP_NAME, status: 'healthy' }
  };
  res.json(response);
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
