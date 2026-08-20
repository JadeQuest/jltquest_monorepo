import { SocialConnectionRepository } from '../../infrastructure/database/repositories/SocialConnectionRepository';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { LedgerRepository } from '../../infrastructure/database/repositories/LedgerRepository';
import { AuditLogRepository } from '../../infrastructure/database/repositories/AuditLogRepository';
import { LedgerService } from './LedgerService';
import { RarePassService } from './RarePassService';
import { SocialPlatform, LedgerSource, RpXpSource, LedgerType } from '@jlt/database';
import { BadRequestError, ConflictError, NotFoundError } from '../errors/AppError';
import { ErrorCode, ErrorMessages, APP_CONFIG } from '@jlt/constants';
import { encrypt } from '../utils/encryption';
import { getQuestPeriodKey } from '../utils/questPeriod';
import type {
  SocialOAuthUrlDto,
  SocialCallbackResultDto,
  SocialDisconnectResultDto,
  SocialQuestDto,
  SocialQuestClaimResultDto
} from '@jlt/types';

export class SocialService {
  constructor(
    private socialRepo: SocialConnectionRepository,
    private userRepository: UserRepository,
    private ledgerRepository: LedgerRepository,
    private ledgerService: LedgerService,
    private rarePassService: RarePassService,
    private auditLogRepository: AuditLogRepository,
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
    if (p === 'instagram') return (SocialPlatform as any).INSTAGRAM || 'INSTAGRAM';
    if (p === 'facebook') return (SocialPlatform as any).FACEBOOK || 'FACEBOOK';
    throw new BadRequestError(
      `${ErrorMessages[ErrorCode.INVALID_PLATFORM]}: ${platformString}`,
      ErrorCode.INVALID_PLATFORM
    );
  }

  async getOAuthUrl(platformString: string, userId: string): Promise<SocialOAuthUrlDto> {
    const platform = this.parsePlatform(platformString);

    switch (platform) {
      case SocialPlatform.TELEGRAM:
        return {
          type: 'deeplink',
          oauthUrl: `tg://resolve?domain=JLTQuestBot&start=${userId}`,
          url: `tg://resolve?domain=JLTQuestBot&start=${userId}`,
          webUrl: `https://t.me/JLTQuestBot?start=${userId}`
        };
      case (SocialPlatform as any).WHATSAPP || 'WHATSAPP':
        return {
          type: 'deeplink',
          oauthUrl: `whatsapp://send?text=Verify%20JLTQuest%20User%20${userId}`,
          url: `whatsapp://send?text=Verify%20JLTQuest%20User%20${userId}`,
          webUrl: `https://wa.me/?text=Verify%20JLTQuest%20User%20${userId}`
        };
      case (SocialPlatform as any).EMAIL || 'EMAIL':
        return {
          type: 'deeplink',
          oauthUrl: `mailto:verify@jltquest.io?subject=JLTQuest%20Verification&body=Verification%20Code:%20${userId}`,
          url: `mailto:verify@jltquest.io?subject=JLTQuest%20Verification&body=Verification%20Code:%20${userId}`,
          webUrl: `mailto:verify@jltquest.io?subject=JLTQuest%20Verification&body=Verification%20Code:%20${userId}`
        };
      case (SocialPlatform as any).LINKEDIN || 'LINKEDIN':
        return {
          type: 'oauth',
          oauthUrl: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=jltquest&redirect_uri=https://jltquest.io/callback/linkedin&state=${userId}`
        };
      case (SocialPlatform as any).INSTAGRAM || 'INSTAGRAM':
        return {
          type: 'oauth',
          oauthUrl: `https://www.instagram.com/oauth/authorize?client_id=jltquest&redirect_uri=https://jltquest.io/callback/instagram&response_type=code&state=${userId}`
        };
      case (SocialPlatform as any).FACEBOOK || 'FACEBOOK':
        return {
          type: 'oauth',
          oauthUrl: `https://www.facebook.com/v12.0/dialog/oauth?client_id=jltquest&redirect_uri=https://jltquest.io/callback/facebook&state=${userId}`
        };
      case SocialPlatform.DISCORD:
        return {
          type: 'oauth',
          oauthUrl: `https://discord.com/api/oauth2/authorize?client_id=jltquest&redirect_uri=https://jltquest.io/callback/discord&response_type=code&scope=identify%20email&state=${userId}`
        };
      case SocialPlatform.X:
      default:
        return {
          type: 'oauth',
          oauthUrl: `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=jltquest&redirect_uri=https://jltquest.io/callback/x&scope=users.read%20tweet.read&state=${userId}`
        };
    }
  }

  async handleCallback(userId: string, platformString: string, payload: any): Promise<SocialCallbackResultDto> {
    const platform = this.parsePlatform(platformString);
    const code = typeof payload === 'string' ? payload : (payload?.code || payload?.handle || 'verified');
    const handle = payload?.handle || `@${platformString}_${userId.substring(0, 6)}`;
    const email = payload?.email || (platform === ((SocialPlatform as any).EMAIL || 'EMAIL') ? payload?.handle : undefined);

    // Encrypt sensitive tokens before database write
    const rawAccessToken = payload?.accessToken || `mock_access_token_${platformString}_${Date.now()}`;
    const rawRefreshToken = payload?.refreshToken || `mock_refresh_token_${platformString}_${Date.now()}`;
    const encryptedAccessToken = encrypt(rawAccessToken);
    const encryptedRefreshToken = encrypt(rawRefreshToken);

    return await this.prisma.$transaction(async (tx: any) => {
      // Lock user row
      await tx.$executeRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;

      const platformUserId = payload?.platformUserId || `${platformString.toLowerCase()}_${userId}`;

      const existingConnection = await this.socialRepo.findByPlatformAndUserId(tx, platform, platformUserId);

      if (existingConnection && existingConnection.userId !== userId) {
        throw new ConflictError(
          ErrorMessages[ErrorCode.ACCOUNT_ALREADY_LINKED],
          ErrorCode.ACCOUNT_ALREADY_LINKED
        );
      }

      let connection = await this.socialRepo.findByUserAndPlatform(tx, userId, platform);

      let gpAwarded = 0;
      let xpAwarded = 0;
      let connectionBonusAwarded = false;

      if (connection) {
        if (connection.connected) {
          const { accessToken, refreshToken, ...scrubbedConnection } = connection;
          return {
            platform: platformString,
            connected: true,
            connectionBonusAwarded: false,
            gpAwarded: 0,
            xpAwarded: 0,
            connection: scrubbedConnection
          };
        }

        connection = await this.socialRepo.update(tx, connection.id, {
          connected: true,
          handle,
          email,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          unlinkedAt: null
        });
      } else {
        connection = await this.socialRepo.create(tx, {
          userId,
          platform,
          platformUserId,
          handle,
          email,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
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

      // Log audit trail
      await this.auditLogRepository.log(tx, {
        userId,
        action: 'SOCIAL_ACCOUNT_CONNECTED',
        metadata: { platform: platformString, platformUserId }
      });

      // Scrub credentials from JSON response to prevent client leakage
      const { accessToken, refreshToken, ...scrubbedConnection } = connection;

      return {
        platform: platformString,
        connected: true,
        connectionBonusAwarded,
        gpAwarded,
        xpAwarded,
        connection: scrubbedConnection
      };
    }, { maxWait: 10000, timeout: 20000 });
  }

  async disconnect(userId: string, platformString: string): Promise<SocialDisconnectResultDto> {
    const platform = this.parsePlatform(platformString);

    return await this.prisma.$transaction(async (tx: any) => {
      // Lock user row
      await tx.$executeRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;

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

        await this.userRepository.update(tx, userId, {
          gp: { decrement: gpClawedBack }
        });

        await this.ledgerRepository.createGpLedger(tx, {
          userId,
          amount: -gpClawedBack,
          type: LedgerType.DEBIT,
          source: LedgerSource.SOCIAL_CLAWBACK,
          refId: platform
        });
      }

      const updatedConnection = await this.socialRepo.update(tx, connection.id, {
        connected: false,
        unlinkedAt: new Date(),
        clawbackApplied: clawbackApplied ? true : connection.clawbackApplied
      });

      // Log audit trail
      await this.auditLogRepository.log(tx, {
        userId,
        action: 'SOCIAL_ACCOUNT_DISCONNECTED',
        metadata: { platform: platformString, clawbackApplied, gpClawedBack }
      });

      // Scrub credentials from connection
      const { accessToken, refreshToken, ...scrubbedConnection } = updatedConnection;

      return {
        platform: platformString,
        connected: false,
        clawbackApplied,
        gpClawedBack,
        connection: scrubbedConnection
      };
    }, { maxWait: 10000, timeout: 20000 });
  }

  async listQuests(userId: string): Promise<SocialQuestDto[]> {
    // 1. Fetch all social quests
    const socialQuests = await this.socialRepo.findAllSocialQuests(this.prisma);

    // 2. Fetch user's social connections
    const userConnections = await this.socialRepo.findActiveByUserId(this.prisma, userId);

    // 3. Fetch user's social quest claims
    const connectionIds = userConnections.map((c: any) => c.id);
    const claims = await this.socialRepo.findSocialQuestClaims(this.prisma, connectionIds);

    return socialQuests.map((quest: any) => {
      const periodKey = getQuestPeriodKey(quest.frequency);
      const connection = userConnections.find((c: any) => c.platform === quest.platform);

      const isCompleted = claims.some((c: any) =>
        c.socialQuestId === quest.id &&
        c.socialConnectionId === connection?.id &&
        (c.periodKey === periodKey || quest.frequency === 'ONE_TIME' || quest.frequency === 'ACHIEVEMENT')
      );

      return {
        id: quest.id,
        code: quest.code,
        platform: quest.platform.toLowerCase(),
        name: quest.name,
        description: quest.description,
        gpReward: quest.gpReward,
        xpReward: quest.xpReward,
        rpXpReward: quest.rpXpReward,
        frequency: quest.frequency,
        completed: isCompleted,
        canClaim: !!connection && !isCompleted
      };
    });
  }

  async claimQuest(userId: string, questIdOrCode: string): Promise<SocialQuestClaimResultDto> {
    // 1. Find social quest
    const quest = await this.socialRepo.findSocialQuestByIdOrCode(this.prisma, questIdOrCode);

    if (!quest) {
      throw new NotFoundError(
        ErrorMessages[ErrorCode.QUEST_NOT_FOUND],
        ErrorCode.QUEST_NOT_FOUND
      );
    }

    // 2. Find active social connection for the platform
    const connection = await this.socialRepo.findByUserAndPlatform(this.prisma, userId, quest.platform);

    if (!connection || !connection.connected) {
      throw new BadRequestError(
        `Please connect your ${quest.platform} account to claim this quest.`,
        ErrorCode.NOT_CONNECTED
      );
    }

    const periodKey = getQuestPeriodKey(quest.frequency);

    return await this.prisma.$transaction(async (tx: any) => {
      // Lock user row
      await tx.$executeRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;

      // Check if already claimed for period
      const existingClaim = await this.socialRepo.findSocialQuestClaim(tx, connection.id, quest.id, periodKey);

      if (existingClaim) {
        throw new ConflictError(
          ErrorMessages[ErrorCode.ALREADY_CLAIMED],
          ErrorCode.ALREADY_CLAIMED
        );
      }

      // Create quest claim
      await this.socialRepo.createSocialQuestClaim(tx, {
        socialConnectionId: connection.id,
        socialQuestId: quest.id,
        periodKey,
        gpAwarded: quest.gpReward,
        xpAwarded: quest.xpReward
      });

      // Award GP & XP
      await this.ledgerService.awardGp(tx, userId, quest.gpReward, LedgerSource.SOCIAL, quest.id);
      await this.ledgerService.awardXp(tx, userId, quest.xpReward, LedgerSource.SOCIAL, quest.id);

      // Award Rare Pass XP
      let rpXpAwarded = 0;
      if (quest.rpXpReward > 0) {
        rpXpAwarded = await this.rarePassService.awardRpXp(
          tx,
          userId,
          quest.rpXpReward,
          RpXpSource.SOCIAL,
          quest.id,
          `social_quest_rpxp:${userId}:${quest.id}:${periodKey}`
        );
      }

      await this.rarePassService.updateMissionProgress(tx, userId, 'mission_complete_quests_daily', 1);

      // Log audit trail
      await this.auditLogRepository.log(tx, {
        userId,
        action: 'SOCIAL_QUEST_CLAIM',
        metadata: { questCode: quest.code, gpAwarded: quest.gpReward, xpAwarded: quest.xpReward, rpXpAwarded }
      });

      return {
        gpAwarded: quest.gpReward,
        xpAwarded: quest.xpReward,
        rpXpAwarded
      };
    }, { maxWait: 10000, timeout: 20000 });
  }
}
