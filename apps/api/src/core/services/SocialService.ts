import { SocialConnectionRepository } from '../../infrastructure/database/repositories/SocialConnectionRepository';
import { LedgerService } from './LedgerService';
import { SocialPlatform, LedgerSource } from '@jlt/database';

export class SocialService {
  constructor(
    private socialRepo: SocialConnectionRepository,
    private ledgerService: LedgerService,
    private prisma: any
  ) {}

  async getOAuthUrl(platform: string, userId: string) {
    return `mock_oauth_url_for_${platform}?state=${userId}`;
  }

  async handleCallback(userId: string, platformString: string, code: string) {
    let platform: SocialPlatform;
    if (platformString === 'x') platform = SocialPlatform.X;
    else if (platformString === 'discord') platform = SocialPlatform.DISCORD;
    else if (platformString === 'telegram') platform = SocialPlatform.TELEGRAM;
    else throw { code: 'INVALID_PLATFORM', message: 'Invalid social platform.' };

    return await this.prisma.$transaction(async (tx: any) => {
      const platformUserId = `mock_${platform}_${userId}`;
      const handle = `@mock_${platform}`;

      const existingConnection = await this.socialRepo.findByPlatformAndUserId(tx, platform, platformUserId);

      if (existingConnection && existingConnection.userId !== userId) {
        throw { code: 'ACCOUNT_ALREADY_LINKED', message: 'Social account linked to another wallet.' };
      }

      let connection = await this.socialRepo.findByUserAndPlatform(tx, userId, platform);

      if (connection && connection.connected) {
        throw { code: 'ALREADY_CLAIMED', message: 'Platform already connected.' };
      }

      let gpAwarded = 0;
      let xpAwarded = 0;
      let connectionBonusAwarded = false;

      if (connection) {
        connection = await this.socialRepo.update(tx, connection.id, {
          connected: true, unlinkedAt: null
        });
      } else {
        connection = await this.socialRepo.create(tx, {
          userId,
          platform,
          platformUserId,
          handle,
          connected: true,
          connectionBonusPaid: true
        });
        
        connectionBonusAwarded = true;
        gpAwarded = 100;
        xpAwarded = 50;

        await this.ledgerService.awardGp(tx, userId, gpAwarded, LedgerSource.SOCIAL, platform);
        await this.ledgerService.awardXp(tx, userId, xpAwarded, LedgerSource.SOCIAL, platform);
      }

      return {
        platform: platformString,
        connected: true,
        connectionBonusAwarded,
        gpAwarded,
        xpAwarded
      };
    });
  }

  async disconnect(userId: string, platformString: string) {
    let platform: SocialPlatform;
    if (platformString === 'x') platform = SocialPlatform.X;
    else if (platformString === 'discord') platform = SocialPlatform.DISCORD;
    else if (platformString === 'telegram') platform = SocialPlatform.TELEGRAM;
    else throw { code: 'INVALID_PLATFORM', message: 'Invalid social platform.' };

    return await this.prisma.$transaction(async (tx: any) => {
      const connection = await this.socialRepo.findByUserAndPlatform(tx, userId, platform);

      if (!connection || !connection.connected) {
        throw { code: 'NOT_CONNECTED', message: 'Platform not connected.' };
      }

      let clawbackApplied = false;
      let gpClawedBack = 0;

      if (connection.connectionBonusPaid && !connection.clawbackApplied) {
        clawbackApplied = true;
        gpClawedBack = 100;
        
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
}
