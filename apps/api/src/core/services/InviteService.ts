import { InviteRepository } from '../../infrastructure/database/repositories/InviteRepository';
import { LedgerService } from './LedgerService';
import { LedgerSource } from '@jlt/database';

export class InviteService {
  constructor(
    private inviteRepository: InviteRepository,
    private ledgerService: LedgerService,
    private prisma: any
  ) {}

  async getInviteStats(userId: string) {
    const invite = await this.inviteRepository.findStats(this.prisma, userId);
    if (!invite) {
      return { inviteCode: null, totalInvited: 0, gpEarnedFromInvites: 0 };
    }

    const totalInvited = invite.redemptions.length;
    const gpEarnedFromInvites = invite.redemptions.reduce((acc: number, r: any) => acc + r.inviterGpAwarded, 0);

    return {
      inviteCode: invite.code,
      totalInvited,
      gpEarnedFromInvites
    };
  }

  async redeem(inviteCode: string, newUserId: string) {
    return await this.prisma.$transaction(async (tx: any) => {
      if (!inviteCode) throw { code: 'INVITE_CODE_INVALID', message: 'Invalid invite code.' };

      const invite = await this.inviteRepository.findByCode(tx, inviteCode);
      if (!invite) throw { code: 'INVITE_CODE_INVALID', message: 'Invalid invite code.' };

      if (invite.userId === newUserId) {
        throw { code: 'INVALID_SELF_INVITE', message: 'Cannot use your own invite code.' };
      }

      const existingRedemption = await tx.inviteRedemption.findUnique({
        where: { inviteeId: newUserId }
      });

      if (existingRedemption) {
        throw { code: 'ALREADY_REDEEMED', message: 'You have already redeemed an invite code.' };
      }

      const inviterGp = 100;
      const inviteeGp = 50;

      await this.inviteRepository.createRedemption(tx, {
        inviteId: invite.id,
        inviteeId: newUserId,
        inviterGpAwarded: inviterGp,
        inviteeGpAwarded: inviteeGp
      });

      await this.ledgerService.awardGp(tx, invite.userId, inviterGp, LedgerSource.INVITE, newUserId);
      await this.ledgerService.awardGp(tx, newUserId, inviteeGp, LedgerSource.INVITE, invite.userId);

      return {
        success: true,
        inviteeGpAwarded: inviteeGp
      };
    });
  }
}
