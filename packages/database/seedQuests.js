const { PrismaClient, QuestFrequency, QuestCategory, SocialPlatform } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Quests...');

  // General Quests
  const quests = [
    // Daily
    { code: 'daily_checkin', name: 'Daily Check-in', description: 'Log in and claim your daily reward.', gpReward: 50, xpReward: 50, frequency: QuestFrequency.DAILY, category: QuestCategory.DAILY },
    { code: 'daily_spin', name: 'Complete 1 Spin', description: 'Try your luck on the Spin to Win wheel.', gpReward: 25, xpReward: 15, frequency: QuestFrequency.DAILY, category: QuestCategory.DAILY },

    // Earning
    { code: 'earn_500gp', name: 'Earn 500 GP', description: 'Accumulate a total of 500 GP.', gpReward: 75, xpReward: 35, frequency: QuestFrequency.ONE_TIME, category: QuestCategory.EARNING },
    { code: 'earn_1000gp', name: 'Earn 1,000 GP', description: 'Accumulate a total of 1,000 GP.', gpReward: 150, xpReward: 75, frequency: QuestFrequency.ONE_TIME, category: QuestCategory.EARNING },
    { code: 'earn_5000gp', name: 'Earn 5,000 GP', description: 'Accumulate a total of 5,000 GP.', gpReward: 500, xpReward: 250, frequency: QuestFrequency.ONE_TIME, category: QuestCategory.EARNING },

    // Milestone
    { code: 'ms_lvl_5', name: 'Reach Level 5', description: 'Level up your account to level 5.', gpReward: 300, xpReward: 0, frequency: QuestFrequency.ONE_TIME, category: QuestCategory.MILESTONE },
    { code: 'ms_lvl_10', name: 'Reach Level 10', description: 'Level up your account to level 10.', gpReward: 600, xpReward: 0, frequency: QuestFrequency.ONE_TIME, category: QuestCategory.MILESTONE },
    { code: 'ms_lvl_20', name: 'Reach Level 20', description: 'Level up your account to level 20.', gpReward: 1200, xpReward: 0, frequency: QuestFrequency.ONE_TIME, category: QuestCategory.MILESTONE },
    { code: 'ms_lvl_30', name: 'Reach Level 30', description: 'Level up your account to level 30.', gpReward: 2500, xpReward: 0, frequency: QuestFrequency.ONE_TIME, category: QuestCategory.MILESTONE },

    // Achievement
    { code: 'ach_connect_wallet', name: 'Connect Wallet', description: 'Connect your Web3 wallet to your account.', gpReward: 100, xpReward: 50, frequency: QuestFrequency.ACHIEVEMENT, category: QuestCategory.ACHIEVEMENT },
    { code: 'ach_first_login', name: 'First Login', description: 'Log into your account for the first time.', gpReward: 50, xpReward: 25, frequency: QuestFrequency.ACHIEVEMENT, category: QuestCategory.ACHIEVEMENT },
    { code: 'ach_first_spin', name: 'First Spin', description: 'Use the Spin to Win feature for the first time.', gpReward: 25, xpReward: 10, frequency: QuestFrequency.ACHIEVEMENT, category: QuestCategory.ACHIEVEMENT },

    // Social Quests
    { code: 'soc_x_connect', name: 'Connect X', description: 'Connect your X (Twitter) account.', gpReward: 100, xpReward: 50, frequency: QuestFrequency.ONE_TIME, category: QuestCategory.SOCIAL },
    { code: 'soc_discord_connect', name: 'Connect Discord', description: 'Connect your Discord account.', gpReward: 100, xpReward: 50, frequency: QuestFrequency.ONE_TIME, category: QuestCategory.SOCIAL },
    { code: 'soc_instagram_connect', name: 'Follow Instagram', description: 'Follow our official Instagram page.', gpReward: 100, xpReward: 50, frequency: QuestFrequency.ONE_TIME, category: QuestCategory.SOCIAL },
    { code: 'soc_facebook_connect', name: 'Like Facebook', description: 'Like our official Facebook page.', gpReward: 100, xpReward: 50, frequency: QuestFrequency.ONE_TIME, category: QuestCategory.SOCIAL },
  ];

  await prisma.quest.deleteMany({});

  for (const q of quests) {
    await prisma.quest.upsert({
      where: { code: q.code },
      update: { ...q },
      create: { ...q },
    });
  }

  console.log('Quests seeded successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
