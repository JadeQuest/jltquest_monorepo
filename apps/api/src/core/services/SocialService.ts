import { SocialConnectionRepository } from '../../infrastructure/database/repositories/SocialConnectionRepository';
import { LedgerService } from './LedgerService';
import { SocialPlatform, LedgerSource } from '@jlt/database';
import { BadRequestError, ConflictError, NotFoundError } from '../errors/AppError';
import { ErrorCode, ErrorMessages, APP_CONFIG } from '@jlt/constants';

export class SocialService {
  constructor(
    private socialRepo: SocialConnectionRepository,
    private ledgerService: LedgerService,
    private prisma: any
  ) {}

  private parsePlatform(platformString: string): SocialPlatform {
    const p = platformString.toLowerCase();
    if (p === 'x' || p === 'twitter') return SocialPlatform.X;
    if (p === 'discord') return SocialPlatform.DISCORD;
    if (p === 'telegram') return SocialPlatform.TELEGRAM;
    if (p === 'linkedin') return (SocialPlatform as any).LINKEDIN || 'LINKEDIN';
    if (p === 'whatsapp') return (SocialPlatform as any).WHATSAPP || 'WHATSAPP';
    if (p === 'email') return (SocialPlatform as any).EMAIL || 'EMAIL';
    throw new BadRequestError(
      `${ErrorMessages[ErrorCode.INVALID_PLATFORM]}: ${platformString}`,
      ErrorCode.INVALID_PLATFORM
    );
  }

  async getOAuthUrl(platformString: string, userId: string) {
    const platform = this.parsePlatform(platformString);

    switch (platform) {
      case SocialPlatform.TELEGRAM:
        return {
          type: 'deeplink',
          url: `tg://resolve?domain=JLTQuestBot&start=${userId}`,
          webUrl: `https://t.me/JLTQuestBot?start=${userId}`
        };
      case (SocialPlatform as any).WHATSAPP || 'WHATSAPP':
        return {
          type: 'deeplink',
          url: `whatsapp://send?text=Verify%20JLTQuest%20User%20${userId}`,
          webUrl: `https://wa.me/?text=Verify%20JLTQuest%20User%20${userId}`
        };
      case (SocialPlatform as any).EMAIL || 'EMAIL':
        return {
          type: 'deeplink',
          url: `mailto:verify@jltquest.io?subject=JLTQuest%20Verification&body=Verification%20Code:%20${userId}`,
          webUrl: `mailto:verify@jltquest.io?subject=JLTQuest%20Verification&body=Verification%20Code:%20${userId}`
        };
      case (SocialPlatform as any).LINKEDIN || 'LINKEDIN':
        return {
          type: 'oauth',
          url: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=jltquest&redirect_uri=https://jltquest.io/callback/linkedin&state=${userId}`
        };
      case SocialPlatform.DISCORD:
        return {
          type: 'oauth',
          url: `https://discord.com/api/oauth2/authorize?client_id=jltquest&redirect_uri=https://jltquest.io/callback/discord&response_type=code&scope=identify%20email&state=${userId}`
        };
      case SocialPlatform.X:
      default:
        return {
          type: 'oauth',
          url: `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=jltquest&redirect_uri=https://jltquest.io/callback/x&scope=users.read%20tweet.read&state=${userId}`
        };
    }
  }

  async handleCallback(userId: string, platformString: string, payload: any) {
    const platform = this.parsePlatform(platformString);
    const code = typeof payload === 'string' ? payload : (payload?.code || payload?.handle || 'verified');
    const handle = payload?.handle || `@${platformString}_${userId.substring(0, 6)}`;
    const email = payload?.email || (platform === ((SocialPlatform as any).EMAIL || 'EMAIL') ? payload?.handle : undefined);
    const accessToken = payload?.accessToken || `mock_access_token_${platformString}_${Date.now()}`;

    return await this.prisma.$transaction(async (tx: any) => {
      const platformUserId = payload?.platformUserId || `${platformString.toLowerCase()}_${userId}`;

      const existingConnection = await this.socialRepo.findByPlatformAndUserId(tx, platform, platformUserId);

      if (existingConnection && existingConnection.userId !== userId) {
        throw new ConflictError(
          ErrorMessages[ErrorCode.ACCOUNT_ALREADY_LINKED],
          ErrorCode.ACCOUNT_ALREADY_LINKED
        );
      }

      let connection = await this.socialRepo.findByUserAndPlatform(tx, userId, platform);

      if (connection && connection.connected) {
        throw new ConflictError(
          ErrorMessages[ErrorCode.ALREADY_CLAIMED],
          ErrorCode.ALREADY_CLAIMED
        );
      }

      let gpAwarded = 0;
      let xpAwarded = 0;
      let connectionBonusAwarded = false;

      if (connection) {
        connection = await this.socialRepo.update(tx, connection.id, {
          connected: true,
          handle,
          email,
          accessToken,
          unlinkedAt: null
        });
      } else {
        connection = await this.socialRepo.create(tx, {
          userId,
          platform,
          platformUserId,
          handle,
          email,
          accessToken,
          metadata: JSON.stringify({ code, linkedAt: new Date().toISOString() }),
          connected: true,
          connectionBonusPaid: true
        });
        
        connectionBonusAwarded = true;
        gpAwarded = APP_CONFIG.SOCIAL.CONNECTION_GP_REWARD;
        xpAwarded = APP_CONFIG.SOCIAL.CONNECTION_XP_REWARD;

        await this.ledgerService.awardGp(tx, userId, gpAwarded, LedgerSource.SOCIAL, platform);
        await this.ledgerService.awardXp(tx, userId, xpAwarded, LedgerSource.SOCIAL, platform);
      }

      return {
        platform: platformString,
        connected: true,
        connectionBonusAwarded,
        gpAwarded,
        xpAwarded,
        connection
      };
    });
  }

  async disconnect(userId: string, platformString: string) {
    const platform = this.parsePlatform(platformString);

    return await this.prisma.$transaction(async (tx: any) => {
      const connection = await this.socialRepo.findByUserAndPlatform(tx, userId, platform);

      if (!connection || !connection.connected) {
        throw new NotFoundError(
          ErrorMessages[ErrorCode.NOT_CONNECTED],
          ErrorCode.NOT_CONNECTED
        );
      }

      let clawbackApplied = false;
      let gpClawedBack = 0;

      if (connection.connectionBonusPaid && !connection.clawbackApplied) {
        clawbackApplied = true;
        gpClawedBack = APP_CONFIG.SOCIAL.CLAWBACK_GP_AMOUNT;
        
        await tx.user.update({
          where: { id: userId },
          data: { gp: { decrement: gpClawedBack } }
        });
        
        await tx.gpLedgerEntry.create({
          data: { userId, amount: -gpClawedBack, type: 'DEBIT', source: 'SOCIAL_CLAWBACK', refId: platform }
        });
      }

      await this.socialRepo.update(tx, connection.id, {
        connected: false, 
        unlinkedAt: new Date(),
        clawbackApplied: clawbackApplied ? true : connection.clawbackApplied
      });

      return {
        platform: platformString,
        connected: false,
        clawbackApplied,
        gpClawedBack
      };
    });
  }

  async listQuests(_userId: string) {
    return [
      { questId: 'x_follow', platform: 'x', name: 'Follow official account', gpReward: 50, xpReward: 25, frequency: 'one_time', completed: false }
    ];
  }

  async claimQuest(_userId: string, _questId?: string) {
    return { gpAwarded: 50, xpAwarded: 25 };
  }
}
