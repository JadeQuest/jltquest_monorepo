import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mock_secret';

export class AuthController {
  login = (req: Request, res: Response) => {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ success: false, data: null, error: { code: 'INVALID_INPUT', message: 'walletAddress required' }});
    }
    
    const token = jwt.sign({ userId: walletAddress }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, data: { token, expiresIn: 86400, userId: walletAddress }, error: null });
  };
}
