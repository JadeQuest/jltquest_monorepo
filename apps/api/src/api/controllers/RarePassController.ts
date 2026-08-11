import { Request, Response } from 'express';
import { RarePassService } from '../../core/services/RarePassService';

export class RarePassController {
  constructor(private rarePassService: RarePassService) {}

  getStatus = async (req: Request, res: Response) => {
    const data = await this.rarePassService.getPassStatus(req.user!.userId);
    res.json({ success: true, data, error: null });
  };

  getRewards = async (req: Request, res: Response) => {
    const data = await this.rarePassService.getRewards(req.user!.userId);
    res.json({ success: true, data, error: null });
  };

  claimReward = async (req: Request, res: Response) => {
    const { rewardId } = req.body;
    const data = await this.rarePassService.claimReward(req.user!.userId, rewardId);
    res.json({ success: true, data, error: null });
  };

  getMissions = async (req: Request, res: Response) => {
    const data = await this.rarePassService.getMissions(req.user!.userId);
    res.json({ success: true, data, error: null });
  };

  claimMission = async (req: Request, res: Response) => {
    const { missionId } = req.params;
    const data = await this.rarePassService.claimMission(req.user!.userId, missionId as string);
    res.json({ success: true, data, error: null });
  };

  buyPremium = async (req: Request, res: Response) => {
    const data = await this.rarePassService.buyPremium(req.user!.userId);
    res.json({ success: true, data, error: null });
  };
}
