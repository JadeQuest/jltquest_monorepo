export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}

export interface UserAuthPayload {
  userId: string;
  walletAddress?: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserAuthPayload;
    }
  }
}
