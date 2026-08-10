import { Request, Response, NextFunction } from 'express';
import { CollectionService } from '../../core/services/CollectionService';

export class CollectionController {
  constructor(private collectionService: CollectionService) {}

  async getCollection(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const data = await this.collectionService.getCollection(userId);
      res.json({ success: true, data, error: null });
    } catch (err) {
      next(err);
    }
  }

  async mergeFragments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await this.collectionService.mergeFragments(userId);
      res.json({ success: true, data: result, error: null });
    } catch (err) {
      next(err);
    }
  }
}
