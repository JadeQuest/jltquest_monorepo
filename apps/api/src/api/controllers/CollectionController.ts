import { Request, Response } from 'express';
import { CollectionService } from '../../core/services/CollectionService';

export class CollectionController {
  constructor(private collectionService: CollectionService) {}

  getCollection = async (req: Request, res: Response) => {
    const data = await this.collectionService.getCollection(req.user!.userId);
    res.json({ success: true, data, error: null });
  };

  mergeFragments = async (req: Request, res: Response) => {
    const data = await this.collectionService.mergeFragments(req.user!.userId);
    res.json({ success: true, data, error: null });
  };
}
