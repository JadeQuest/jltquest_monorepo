import { Request, Response } from 'express';
import { QuestService } from '../../core/services/QuestService';

export class QuestController {
  constructor(private questService: QuestService) {}

  list = async (req: Request, res: Response) => {
    const data = await this.questService.listQuests(req.user!.userId);
    res.json({ success: true, data, error: null });
  };

  claim = async (req: Request, res: Response) => {
    const { questId } = req.params;
    const data = await this.questService.claim(req.user!.userId, questId as string);
    res.json({ success: true, data, error: null });
  };
}
