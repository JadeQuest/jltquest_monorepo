import { Request, Response } from 'express';
import { AuthService } from '../../core/services/AuthService';
import { APP_CONFIG, AuthMessages } from '@jlt/constants';

/**
 * Controller exposing Authentication HTTP REST endpoints.
 */
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /api/v1/auth/login
   * Validates Web3 signature & returns access JWT token with HttpOnly refresh cookie.
   */
  login = async (req: Request, res: Response) => {
    const { walletAddress, signature, message } = req.body;
    const data = await this.authService.login(walletAddress, signature, message);
    
    // Set refresh token in secure HttpOnly cookie
    res.cookie('jlt_refresh_token', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: APP_CONFIG.AUTH.REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000
    });

    // Strip refreshToken from json response to avoid client exposure
    const { refreshToken, ...clientData } = data;

    res.json({ success: true, data: clientData, error: null });
  };

  /**
   * POST /api/v1/auth/refresh
   * Rotates refresh token & issues new access token.
   */
  refresh = async (req: Request, res: Response) => {
    // Read refresh token from cookie or body fallback
    const refreshToken = req.cookies?.jlt_refresh_token || req.body?.refreshToken;
    const data = await this.authService.refresh(refreshToken);

    // Rotate refresh token cookie
    res.cookie('jlt_refresh_token', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: APP_CONFIG.AUTH.REFRESH_TOKEN_EXPIRES_IN_SECONDS * 1000
    });

    res.json({ 
      success: true, 
      data: {
        token: data.token,
        expiresIn: data.expiresIn
      }, 
      error: null 
    });
  };

  /**
   * POST /api/v1/auth/logout
   * Revokes refresh token in database & clears client cookie.
   */
  logout = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.jlt_refresh_token || req.body?.refreshToken;
    await this.authService.logout(refreshToken);

    // Clear cookies
    res.clearCookie('jlt_refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    res.json({ success: true, data: { message: AuthMessages.LOGOUT_SUCCESS }, error: null });
  };
}
