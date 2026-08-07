import { PrismaClient, QuestFrequency, SocialPlatform } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ── Quests ──────────────────────────
  await prisma.quest.createMany({
    data: [
      { code: 'quest_connect_wallet', name: 'Connect Wallet', gpReward: 100, xpReward: 50, frequency: QuestFrequency.ONE_TIME },
      { code: 'quest_complete_profile', name: 'Complete Profile', gpReward: 100, xpReward: 50, frequency: QuestFrequency.ONE_TIME },
      { code: 'quest_invite_friend', name: 'Invite 1 Friend', gpReward: 150, xpReward: 75, frequency: QuestFrequency.REPEATABLE },
      { code: 'quest_3_daily_spins', name: 'Complete 3 Daily Spins', gpReward: 100, xpReward: 40, frequency: QuestFrequency.DAILY },
    ],
    skipDuplicates: true,
  });

  // ── One-time social connection quests ─
  await prisma.quest.createMany({
    data: [
      { code: 'quest_connect_x', name: 'Connect X (Twitter)', gpReward: 100, xpReward: 50, frequency: QuestFrequency.ONE_TIME },
      { code: 'quest_connect_discord', name: 'Join Discord + Link Account', gpReward: 100, xpReward: 50, frequency: QuestFrequency.ONE_TIME },
      { code: 'quest_connect_telegram', name: 'Join Telegram + Link Account', gpReward: 100, xpReward: 50, frequency: QuestFrequency.ONE_TIME },
    ],
    skipDuplicates: true,
  });

  // ── Recurring social quests ───────
  await prisma.socialQuest.createMany({
    data: [
      { code: 'x_follow', platform: SocialPlatform.X, name: 'Follow official account', gpReward: 50, xpReward: 25, frequency: QuestFrequency.ONE_TIME },
      { code: 'x_retweet', platform: SocialPlatform.X, name: 'Retweet/Repost featured post', gpReward: 30, xpReward: 15, frequency: QuestFrequency.WEEKLY },
      { code: 'discord_react', platform: SocialPlatform.DISCORD, name: 'React to weekly announcement', gpReward: 20, xpReward: 10, frequency: QuestFrequency.WEEKLY },
      { code: 'telegram_tapin', platform: SocialPlatform.TELEGRAM, name: 'Daily tap-in in group', gpReward: 15, xpReward: 10, frequency: QuestFrequency.DAILY },
    ],
    skipDuplicates: true,
  });

  // ── System config ──────────────
  await prisma.systemConfig.createMany({
    data: [
      { key: 'gp_to_jlt_rate', value: '100' },      // 100 GP = 1 JLT
      { key: 'xp_level_base', value: '500' },        // XP required for level 2
      { key: 'xp_level_growth', value: '1.3' },       // multiplier per level
      { key: 'checkin_base_gp', value: '50' },
      { key: 'checkin_base_xp', value: '50' },
      { key: 'checkin_streak_increment', value: '0.1' }, // +10% per day, capped day 7
      { key: 'checkin_streak_cap_day', value: '7' },
      { key: 'spin_gp_small', value: '20' },
      { key: 'spin_gp_medium', value: '50' },
      { key: 'spin_gp_large', value: '100' },
      { key: 'spin_purchase_gp_cost', value: '200' },
    ],
    skipDuplicates: true,
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
