import { InviteRepository } from '../../infrastructure/database/repositories/InviteRepository';
import { LedgerService } from './LedgerService';
import { RarePassService } from './RarePassService';
import { LedgerSource } from '@jlt/database';
import { BadRequestError, ConflictError } from '../errors/AppError';
import { ErrorCode, ErrorMessages, APP_CONFIG } from '@jlt/constants';

export class InviteService {
  constructor(
    private inviteRepository: InviteRepository,
    private ledgerService: LedgerService,
    private prisma: any
  ) {}

  async getInviteStats(userId: string) {
    let invite = await this.inviteRepository.findStats(this.prisma, userId);
    if (!invite) {
      const code = `JLT_${userId.substring(0, 8).toUpperCase()}`;
      invite = await this.prisma.invite.create({
        data: {
          inviterId: userId,
          code
        },
        include: { redemptions: true }
      });
    }

    const totalInvited = invite.redemptions?.length || 0;
    const gpEarnedFromInvites = invite.redemptions?.reduce((acc: number, r: any) => acc + (r.inviterGpAwarded || 0), 0) || 0;

    return {
      inviteCode: invite.code,
      totalInvited,
      gpEarnedFromInvites,
      redemptions: invite.redemptions || []
    };
  }

  async redeem(inviteCode: string, newUserId: string) {
    return await this.prisma.$transaction(
      async (tx: any) => {
        if (!inviteCode) {
          throw new BadRequestError(
            ErrorMessages[ErrorCode.INVITE_CODE_INVALID],
            ErrorCode.INVITE_CODE_INVALID
          );
        }

        const invite = await this.inviteRepository.findByCode(tx, inviteCode);
        if (!invite) {
          throw new BadRequestError(
            ErrorMessages[ErrorCode.INVITE_CODE_INVALID],
            ErrorCode.INVITE_CODE_INVALID
          );
        }

        if (invite.inviterId === newUserId) {
          throw new BadRequestError(
            ErrorMessages[ErrorCode.INVALID_SELF_INVITE],
            ErrorCode.INVALID_SELF_INVITE
          );
        }

        const existingRedemption = await tx.inviteRedemption.findUnique({
          where: { redeemedByUserId: newUserId }
        });

        if (existingRedemption) {
          throw new ConflictError(
            ErrorMessages[ErrorCode.ALREADY_REDEEMED],
            ErrorCode.ALREADY_REDEEMED
          );
        }

        const inviterGp = APP_CONFIG.INVITE.INVITER_GP_REWARD;
        const inviteeGp = APP_CONFIG.INVITE.INVITEE_GP_REWARD;
        const inviterXp = 75; // Invite 1 Friend repeatable quest gives 75 XP

        await this.inviteRepository.createRedemption(tx, {
          inviteId: invite.id,
          redeemedByUserId: newUserId,
          inviterGpAwarded: inviterGp,
          inviterXpAwarded: inviterXp
        });

        await this.ledgerService.awardGp(tx, invite.inviterId, inviterGp, LedgerSource.INVITE, newUserId);
        await this.ledgerService.awardXp(tx, invite.inviterId, inviterXp, LedgerSource.INVITE, newUserId);
        await this.ledgerService.awardGp(tx, newUserId, inviteeGp, LedgerSource.INVITE, invite.inviterId);

        // Increment Rare Pass invite friends weekly mission progress
        const rarePassService = new RarePassService(this.prisma);
        await rarePassService.updateMissionProgress(tx, invite.inviterId, 'mission_invite_friends_weekly', 1);

        return {
          success: true,
          inviteeGpAwarded: inviteeGp
        };
      },
      { maxWait: 10000, timeout: 20000 }
    );
  }
}
