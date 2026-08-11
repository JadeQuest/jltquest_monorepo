import { Request, Response } from 'express';
import { AuthService } from '../../core/services/AuthService';
import { APP_CONFIG } from '@jlt/constants';

export class AuthController {
  constructor(private authService: AuthService) {}

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

  refresh = async (req: Request, res: Response) => {
    // Read refresh token from cookie or body (fallback)
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

    res.json({ success: true, data: { message: 'Logged out successfully' }, error: null });
  };
}
