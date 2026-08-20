import { Request, Response } from 'express';
import { CollectionService } from '../../core/services/CollectionService';
import type { ApiResponse, CollectionDto, MergeFragmentsResultDto } from '@jlt/types';

/**
 * Controller handling user card collection and fragment merging into rare cards.
 */
export class CollectionController {
  constructor(private collectionService: CollectionService) {}

  /**
   * GET /api/v1/collection
   * Retrieve user's card collection and available fragment balance.
   */
  getCollection = async (req: Request, res: Response<ApiResponse<CollectionDto>>) => {
    const data = await this.collectionService.getCollection(req.user!.userId);
    res.status(200).json({ success: true, data, error: null });
  };

  /**
   * POST /api/v1/collection/merge
   * Merge 10 fragments to forge a new rare collectible card.
   */
  mergeFragments = async (req: Request, res: Response<ApiResponse<MergeFragmentsResultDto>>) => {
    const data = await this.collectionService.mergeFragments(req.user!.userId);
    res.status(200).json({ success: true, data, error: null });
  };
}
