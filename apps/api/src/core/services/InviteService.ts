import { InviteRepository } from '../../infrastructure/database/repositories/InviteRepository';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { LedgerService } from './LedgerService';
import { RarePassService } from './RarePassService';
import { LedgerSource } from '@jlt/database';
import { BadRequestError, ConflictError } from '../errors/AppError';
import { ErrorCode, ErrorMessages, APP_CONFIG } from '@jlt/constants';
import type { InviteStatsDto, RedeemInviteResultDto, ClaimMilestoneResultDto } from '@jlt/types';

export class InviteService {
  constructor(
    private inviteRepository: InviteRepository,
    private userRepository: UserRepository,
    private ledgerService: LedgerService,
    private rarePassService: RarePassService,
    private prisma: any
  ) {}

  async getInviteStats(userId: string): Promise<InviteStatsDto> {
    const [statsResult, userRedemption] = await Promise.all([
      this.inviteRepository.findStats(this.prisma, userId),
      this.inviteRepository.findRedemptionByUserId(this.prisma, userId)
    ]);

    let { invite, milestoneClaims } = statsResult;
    if (!invite) {
      const code = `JLT_${userId.substring(0, 8).toUpperCase()}`;
      invite = await this.inviteRepository.createInvite(this.prisma, {
        inviterId: userId,
        code
      });
      milestoneClaims = [];
    }
    const totalInvited = invite.redemptions?.length || 0;
    const gpEarnedFromInvites = invite.redemptions?.reduce((acc: number, r: any) => acc + (r.inviterGpAwarded || 0), 0) || 0;

    return {
      inviteCode: invite.code,
      totalInvited,
      gpEarnedFromInvites,
      hasRedeemed: !!userRedemption,
      redemptions: invite.redemptions || [],
      milestoneClaims: milestoneClaims || []
    };
  }

  async redeem(rawInviteCode: string, newUserId: string): Promise<RedeemInviteResultDto> {
    return await this.prisma.$transaction(
      async (tx: any) => {
        if (!rawInviteCode || typeof rawInviteCode !== 'string' || !rawInviteCode.trim()) {
          throw new BadRequestError(
            ErrorMessages[ErrorCode.INVITE_CODE_INVALID],
            ErrorCode.INVITE_CODE_INVALID
          );
        }

        let inviteCode = rawInviteCode.trim();

        // If URL or query param was passed, extract the ref parameter
        if (inviteCode.includes('ref=')) {
          const match = inviteCode.match(/ref=([a-zA-Z0-9_-]+)/i);
          if (match && match[1]) {
            inviteCode = match[1];
          }
        } else if (inviteCode.startsWith('http://') || inviteCode.startsWith('https://')) {
          const parts = inviteCode.split('/');
          inviteCode = parts[parts.length - 1] || inviteCode;
        }

        inviteCode = inviteCode.toUpperCase().replace(/^JLT-/, 'JLT_');

        // Prepend JLT_ if user supplied just the 8-char hex code
        if (/^[A-F0-9]{8}$/i.test(inviteCode)) {
          inviteCode = `JLT_${inviteCode}`;
        }

        let invite = await this.inviteRepository.findByCode(tx, inviteCode);

        // Lazy creation if inviter hasn't visited their dashboard yet
        if (!invite && inviteCode.startsWith('JLT_')) {
          const shortId = inviteCode.substring(4).toLowerCase();
          const inviterUser = await tx.user.findFirst({
            where: { id: { startsWith: shortId } }
          });

          if (inviterUser) {
            const existingInvite = await this.inviteRepository.findByInviterId(tx, inviterUser.id);

            if (existingInvite) {
              invite = existingInvite;
            } else {
              invite = await this.inviteRepository.createInvite(tx, {
                inviterId: inviterUser.id,
                code: inviteCode
              });
            }
          }
        }

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

        const existingRedemption = await this.inviteRepository.findRedemptionByUserId(tx, newUserId);

        if (existingRedemption) {
          throw new ConflictError(
            ErrorMessages[ErrorCode.ALREADY_REDEEMED],
            ErrorCode.ALREADY_REDEEMED
          );
        }

        // Prevent circular invites: if newUserId's invite code was already redeemed by the inviter
        const circularRedemption = await this.inviteRepository.findCircularRedemption(tx, invite.inviterId, newUserId);

        if (circularRedemption) {
          throw new ConflictError(
            ErrorMessages[ErrorCode.CIRCULAR_INVITE_NOT_ALLOWED],
            ErrorCode.CIRCULAR_INVITE_NOT_ALLOWED
          );
        }

        const inviterGp = APP_CONFIG.INVITE.INVITER_GP_REWARD;
        const inviteeGp = APP_CONFIG.INVITE.INVITEE_GP_REWARD;
        const inviterXp = 0; // XP is awarded at Level 6 milestone

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
        await this.rarePassService.updateMissionProgress(tx, invite.inviterId, 'mission_invite_friends_weekly', 1);

        return {
          success: true,
          inviteeGpAwarded: inviteeGp
        };
      },
      { maxWait: 10000, timeout: 20000 }
    );
  }

  async claimMilestone(inviterId: string, inviteeCount: number, levelReached: number): Promise<ClaimMilestoneResultDto> {
    return await this.prisma.$transaction(
      async (tx: any) => {
        // Verify milestones constraints
        const validCounts = [1, 5, 10];
        const validLevels = [6, 11, 16];

        if (!validCounts.includes(inviteeCount) || !validLevels.includes(levelReached)) {
          throw new BadRequestError(
            'Invalid milestone parameters',
            ErrorCode.BAD_REQUEST
          );
        }

        // Check if already claimed
        const existingClaim = await this.inviteRepository.findMilestoneClaim(tx, inviterId, inviteeCount, levelReached);

        if (existingClaim) {
          throw new ConflictError(
            ErrorMessages[ErrorCode.ALREADY_CLAIMED],
            ErrorCode.ALREADY_CLAIMED
          );
        }

        // Verify the user actually met the criteria
        const { invite } = await this.inviteRepository.findStats(tx, inviterId);
        if (!invite) {
          throw new BadRequestError(
            'No invites found',
            ErrorCode.NOT_FOUND
          );
        }

        const eligibleRedemptions = invite.redemptions.filter(
          (r: any) => r.redeemedByUser && r.redeemedByUser.level >= levelReached
        );

        if (eligibleRedemptions.length < inviteeCount) {
          throw new BadRequestError(
            ErrorMessages[ErrorCode.REQUIREMENTS_NOT_MET],
            ErrorCode.REQUIREMENTS_NOT_MET
          );
        }

        // Grant reward
        const gpAwarded = inviteeCount * levelReached * 20;
        const xpAwarded = inviteeCount * levelReached * 10;

        await this.inviteRepository.createMilestoneClaim(tx, {
          inviterId,
          inviteeCount,
          levelReached
        });

        await this.ledgerService.awardGp(tx, inviterId, gpAwarded, LedgerSource.INVITE, `milestone_${inviteeCount}_${levelReached}`);
        await this.ledgerService.awardXp(tx, inviterId, xpAwarded, LedgerSource.INVITE, `milestone_${inviteeCount}_${levelReached}`);

        return {
          success: true,
          gpAwarded,
          xpAwarded
        };
      },
      { maxWait: 10000, timeout: 20000 }
    );
  }
}
