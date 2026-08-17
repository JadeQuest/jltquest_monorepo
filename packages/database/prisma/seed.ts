import {
  PrismaClient,
  QuestFrequency,
  QuestCategory,
  SocialPlatform,
  RarePassSeasonStatus,
  RarePassTrack,
  RarePassRewardType,
  RarePassMissionType,
  AvatarVariantType,
  CardRarity,
} from '@prisma/client';

const prisma = new PrismaClient();

export async function seedQuests() {
  console.log('Seeding Quests...');
  const quests = [
    // Standard Onboarding Quests
    {
      code: 'quest_connect_wallet',
      name: 'Connect Wallet',
      description: 'Connect your Web3 wallet to your account.',
      gpReward: 100,
      xpReward: 50,
      rpXpReward: 0,
      fragmentReward: 1,
      frequency: QuestFrequency.ONE_TIME,
      category: QuestCategory.GENERAL,
    },
    {
      code: 'quest_complete_profile',
      name: 'Complete Profile',
      description: 'Set up your display name and email address.',
      gpReward: 100,
      xpReward: 50,
      rpXpReward: 0,
      fragmentReward: 1,
      frequency: QuestFrequency.ONE_TIME,
      category: QuestCategory.GENERAL,
    },
    {
      code: 'quest_invite_friend',
      name: 'Invite 1 Friend',
      description: 'Invite a friend using your unique referral link.',
      gpReward: 150,
      xpReward: 75,
      rpXpReward: 200,
      fragmentReward: 2,
      frequency: QuestFrequency.REPEATABLE,
      category: QuestCategory.REFERRAL,
    },
    {
      code: 'quest_3_daily_spins',
      name: 'Complete 3 Daily Spins',
      description: 'Spin the wheel 3 times today.',
      gpReward: 100,
      xpReward: 40,
      rpXpReward: 20,
      fragmentReward: 1,
      frequency: QuestFrequency.DAILY,
      category: QuestCategory.DAILY,
    },
    {
      code: 'quest_connect_x',
      name: 'Connect X (Twitter)',
      description: 'Link your X account to receive rewards.',
      gpReward: 100,
      xpReward: 50,
      rpXpReward: 40,
      fragmentReward: 1,
      frequency: QuestFrequency.ONE_TIME,
      category: QuestCategory.SOCIAL,
    },
    {
      code: 'quest_connect_discord',
      name: 'Join Discord + Link Account',
      description: 'Link your Discord account to receive rewards.',
      gpReward: 100,
      xpReward: 50,
      rpXpReward: 40,
      fragmentReward: 1,
      frequency: QuestFrequency.ONE_TIME,
      category: QuestCategory.SOCIAL,
    },
    {
      code: 'quest_connect_telegram',
      name: 'Join Telegram + Link Account',
      description: 'Link your Telegram account to receive rewards.',
      gpReward: 100,
      xpReward: 50,
      rpXpReward: 40,
      fragmentReward: 1,
      frequency: QuestFrequency.ONE_TIME,
      category: QuestCategory.SOCIAL,
    },

    // Daily Quests
    {
      code: 'daily_checkin',
      name: 'Daily Check-in',
      description: 'Log in and claim your daily check-in streak reward.',
      gpReward: 50,
      xpReward: 50,
      rpXpReward: 20,
      fragmentReward: 0,
      frequency: QuestFrequency.DAILY,
      category: QuestCategory.DAILY,
    },
    {
      code: 'daily_spin',
      name: 'Complete 1 Spin',
      description: 'Try your luck on the Spin to Win wheel.',
      gpReward: 25,
      xpReward: 15,
      rpXpReward: 10,
      fragmentReward: 0,
      frequency: QuestFrequency.DAILY,
      category: QuestCategory.DAILY,
    },

    // Earning Quests
    {
      code: 'earn_500gp',
      name: 'Earn 500 GP',
      description: 'Accumulate a total balance of 500 GP.',
      gpReward: 75,
      xpReward: 35,
      rpXpReward: 50,
      fragmentReward: 0,
      frequency: QuestFrequency.ONE_TIME,
      category: QuestCategory.EARNING,
    },
    {
      code: 'earn_1000gp',
      name: 'Earn 1,000 GP',
      description: 'Accumulate a total balance of 1,000 GP.',
      gpReward: 150,
      xpReward: 75,
      rpXpReward: 100,
      fragmentReward: 0,
      frequency: QuestFrequency.ONE_TIME,
      category: QuestCategory.EARNING,
    },
    {
      code: 'earn_5000gp',
      name: 'Earn 5,000 GP',
      description: 'Accumulate a total balance of 5,000 GP.',
      gpReward: 500,
      xpReward: 250,
      rpXpReward: 250,
      fragmentReward: 0,
      frequency: QuestFrequency.ONE_TIME,
      category: QuestCategory.EARNING,
    },

    // Milestone Quests
    {
      code: 'ms_lvl_5',
      name: 'Reach Level 5',
      description: 'Level up your account to level 5.',
      gpReward: 300,
      xpReward: 0,
      rpXpReward: 100,
      fragmentReward: 0,
      frequency: QuestFrequency.ONE_TIME,
      category: QuestCategory.MILESTONE,
    },
    {
      code: 'ms_lvl_10',
      name: 'Reach Level 10',
      description: 'Level up your account to level 10.',
      gpReward: 600,
      xpReward: 0,
      rpXpReward: 200,
      fragmentReward: 0,
      frequency: QuestFrequency.ONE_TIME,
      category: QuestCategory.MILESTONE,
    },
    {
      code: 'ms_lvl_20',
      name: 'Reach Level 20',
      description: 'Level up your account to level 20.',
      gpReward: 1200,
      xpReward: 0,
      rpXpReward: 400,
      fragmentReward: 0,
      frequency: QuestFrequency.ONE_TIME,
      category: QuestCategory.MILESTONE,
    },
    {
      code: 'ms_lvl_30',
      name: 'Reach Level 30',
      description: 'Level up your account to level 30.',
      gpReward: 2500,
      xpReward: 0,
      rpXpReward: 800,
      fragmentReward: 0,
      frequency: QuestFrequency.ONE_TIME,
      category: QuestCategory.MILESTONE,
    },

    // Achievement Quests
    {
      code: 'ach_connect_wallet',
      name: 'Connect Wallet (Achievement)',
      description: 'Connect your Web3 wallet to your account.',
      gpReward: 100,
      xpReward: 50,
      rpXpReward: 50,
      fragmentReward: 0,
      frequency: QuestFrequency.ACHIEVEMENT,
      category: QuestCategory.ACHIEVEMENT,
    },
    {
      code: 'ach_first_login',
      name: 'First Login',
      description: 'Log into your account for the first time.',
      gpReward: 50,
      xpReward: 25,
      rpXpReward: 25,
      fragmentReward: 0,
      frequency: QuestFrequency.ACHIEVEMENT,
      category: QuestCategory.ACHIEVEMENT,
    },
    {
      code: 'ach_first_spin',
      name: 'First Spin',
      description: 'Use the Spin to Win feature for the first time.',
      gpReward: 25,
      xpReward: 10,
      rpXpReward: 10,
      fragmentReward: 0,
      frequency: QuestFrequency.ACHIEVEMENT,
      category: QuestCategory.ACHIEVEMENT,
    },

    // Social Quests
    {
      code: 'soc_x_connect',
      name: 'Connect X',
      description: 'Connect your X (Twitter) account.',
      gpReward: 100,
      xpReward: 50,
      rpXpReward: 40,
      fragmentReward: 0,
      frequency: QuestFrequency.ONE_TIME,
      category: QuestCategory.SOCIAL,
    },
    {
      code: 'soc_discord_connect',
      name: 'Connect Discord',
      description: 'Connect your Discord account.',
      gpReward: 100,
      xpReward: 50,
      rpXpReward: 40,
      fragmentReward: 0,
      frequency: QuestFrequency.ONE_TIME,
      category: QuestCategory.SOCIAL,
    },
    {
      code: 'soc_instagram_connect',
      name: 'Follow Instagram',
      description: 'Follow our official Instagram page.',
      gpReward: 100,
      xpReward: 50,
      rpXpReward: 40,
      fragmentReward: 0,
      frequency: QuestFrequency.ONE_TIME,
      category: QuestCategory.SOCIAL,
    },
    {
      code: 'soc_facebook_connect',
      name: 'Like Facebook',
      description: 'Like our official Facebook page.',
      gpReward: 100,
      xpReward: 50,
      rpXpReward: 40,
      fragmentReward: 0,
      frequency: QuestFrequency.ONE_TIME,
      category: QuestCategory.SOCIAL,
    },
  ];

  for (const q of quests) {
    await prisma.quest.upsert({
      where: { code: q.code },
      update: { ...q },
      create: { ...q },
    });
  }
  console.log(`Seeded ${quests.length} quests.`);
}

async function main() {
  console.log('Starting seeding database...');

  // ── 1. Seed Avatars & Variants ──────────────────────────
  console.log('Seeding Avatars...');

  // ── 1. Seed Exact 5 Avatars (3 Free, 2 from Pass) ──────────────────────────
  console.log('Seeding Avatars (3 Free, 2 Pass)...');

  // 1. Cosmic Mascot (Default Free)
  const defaultAvatar = await prisma.avatar.upsert({
    where: { characterKey: 'default' },
    update: { name: 'Cosmic Mascot' },
    create: {
      name: 'Cosmic Mascot',
      characterKey: 'default',
    },
  });

  const defaultVariant = await prisma.avatarVariant.upsert({
    where: { id: 'var_default_avatar' },
    update: { imageUrl: '/avatar/avatar.webp', unlockDescription: 'Default Starter Avatar' },
    create: {
      id: 'var_default_avatar',
      avatarId: defaultAvatar.id,
      type: AvatarVariantType.BASIC,
      imageUrl: '/avatar/avatar.webp',
      unlockDescription: 'Default Starter Avatar',
    },
  });

  // 2. Star Cadet (Free 1)
  const starCadet = await prisma.avatar.upsert({
    where: { characterKey: 'star_cadet' },
    update: { name: 'Star Cadet' },
    create: {
      name: 'Star Cadet',
      characterKey: 'star_cadet',
    },
  });

  const starCadetVariant = await prisma.avatarVariant.upsert({
    where: { id: 'var_star_cadet' },
    update: { imageUrl: '/avatar/1.webp', unlockDescription: 'Free Starter Avatar' },
    create: {
      id: 'var_star_cadet',
      avatarId: starCadet.id,
      type: AvatarVariantType.BASIC,
      imageUrl: '/avatar/1.webp',
      unlockDescription: 'Free Starter Avatar',
    },
  });

  // 3. Nova Pilot (Free 2)
  const novaPilot = await prisma.avatar.upsert({
    where: { characterKey: 'nova_pilot' },
    update: { name: 'Nova Pilot' },
    create: {
      name: 'Nova Pilot',

      characterKey: 'nova_pilot',
    },
  });

  const novaPilotVariant = await prisma.avatarVariant.upsert({
    where: { id: 'var_nova_pilot' },
    update: { imageUrl: '/avatar/2.webp', unlockDescription: 'Free Starter Avatar' },
    create: {
      id: 'var_nova_pilot',
      avatarId: novaPilot.id,
      type: AvatarVariantType.BASIC,
      imageUrl: '/avatar/2.webp',
      unlockDescription: 'Free Starter Avatar',
    },
  });

  // 4 & 5. Cosmic Explorer (Season 01 Pass - Free Lv 10 & Premium Lv 10)
  const cosmicExplorer = await prisma.avatar.upsert({
    where: { characterKey: 'cosmic_explorer' },
    update: { name: 'Cosmic Explorer' },
    create: {
      name: 'Cosmic Explorer',
      characterKey: 'cosmic_explorer',
    },
  });

  const explorerBasic = await prisma.avatarVariant.upsert({
    where: { id: 'var_cosmic_explorer_basic' },
    update: { imageUrl: '/avatar/pass/s1/s1b.webp', unlockDescription: 'Rare Pass Season 1 Free track level 10' },
    create: {
      id: 'var_cosmic_explorer_basic',
      avatarId: cosmicExplorer.id,
      type: AvatarVariantType.BASIC,
      imageUrl: '/avatar/pass/s1/s1b.webp',
      unlockDescription: 'Rare Pass Season 1 Free track level 10',
    },
  });

  const explorer3D = await prisma.avatarVariant.upsert({
    where: { id: 'var_cosmic_explorer_3d' },
    update: { imageUrl: '/avatar/pass/s1/s1p.webp', unlockDescription: 'Rare Pass Season 1 Premium track level 10' },
    create: {
      id: 'var_cosmic_explorer_3d',
      avatarId: cosmicExplorer.id,
      type: AvatarVariantType.THREE_D,
      imageUrl: '/avatar/pass/s1/s1p.webp',
      unlockDescription: 'Rare Pass Season 1 Premium track level 10',
    },
  });

  // Unlock the 3 free starter avatars for all existing users
  const allUsers = await prisma.user.findMany({ select: { id: true, activeAvatarVariantId: true } });
  for (const u of allUsers) {
    const starterVariantIds = [defaultVariant.id, starCadetVariant.id, novaPilotVariant.id];
    for (const vId of starterVariantIds) {
      await prisma.userAvatar.upsert({
        where: { userId_variantId: { userId: u.id, variantId: vId } },
        update: {},
        create: { userId: u.id, variantId: vId },
      });
    }
    if (!u.activeAvatarVariantId) {
      await prisma.user.update({
        where: { id: u.id },
        data: { activeAvatarVariantId: defaultVariant.id },
      });
    }
  }

  // ── 2. Seed Quests ──────────────────────────
  await seedQuests();

  // ── 3. Seed Recurring Social Quests ──────────────────────────
  console.log('Seeding Social Quests...');
  await prisma.socialQuest.upsert({
    where: { code: 'x_follow' },
    update: { rpXpReward: 40 },
    create: {
      code: 'x_follow',
      platform: SocialPlatform.X,
      name: 'Follow official account',
      gpReward: 50,
      xpReward: 25,
      rpXpReward: 40,
      frequency: QuestFrequency.ONE_TIME,
    },
  });

  await prisma.socialQuest.upsert({
    where: { code: 'x_retweet' },
    update: { rpXpReward: 40 },
    create: {
      code: 'x_retweet',
      platform: SocialPlatform.X,
      name: 'Retweet/Repost featured post',
      gpReward: 30,
      xpReward: 15,
      rpXpReward: 40,
      frequency: QuestFrequency.WEEKLY,
    },
  });

  await prisma.socialQuest.upsert({
    where: { code: 'discord_react' },
    update: { rpXpReward: 40 },
    create: {
      code: 'discord_react',
      platform: SocialPlatform.DISCORD,
      name: 'React to weekly announcement',
      gpReward: 20,
      xpReward: 10,
      rpXpReward: 40,
      frequency: QuestFrequency.WEEKLY,
    },
  });

  await prisma.socialQuest.upsert({
    where: { code: 'telegram_tapin' },
    update: { rpXpReward: 40 },
    create: {
      code: 'telegram_tapin',
      platform: SocialPlatform.TELEGRAM,
      name: 'Daily tap-in in group',
      gpReward: 15,
      xpReward: 10,
      rpXpReward: 40,
      frequency: QuestFrequency.DAILY,
    },
  });

  // ── 4. Seed System Config ──────────────────────────
  console.log('Seeding System Config...');
  const systemConfigs = [
    { key: 'gp_to_jlt_rate', value: '100' },
    { key: 'xp_level_base', value: '500' },
    { key: 'xp_level_growth', value: '1.3' },
    { key: 'checkin_base_gp', value: '50' },
    { key: 'checkin_base_xp', value: '50' },
    { key: 'checkin_streak_increment', value: '0.1' },
    { key: 'checkin_streak_cap_day', value: '7' },
    { key: 'spin_gp_small', value: '20' },
    { key: 'spin_gp_medium', value: '50' },
    { key: 'spin_gp_large', value: '100' },
    { key: 'spin_purchase_gp_cost', value: '200' },
  ];

  for (const cfg of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: cfg.key },
      update: { value: cfg.value },
      create: { key: cfg.key, value: cfg.value },
    });
  }

  // ── 5. Seed Rare Cards ──────────────────────────
  console.log('Seeding Rare Cards...');
  const totalCards = 30;
  let seededNewCount = 0;

  const cardsData = [
    { name: "Cosmic Drone", rarity: CardRarity.RARE },
    { name: "Forest Druid", rarity: CardRarity.RARE },
    { name: "Apprentice Mage", rarity: CardRarity.COMMON },
    { name: "Astronaut", rarity: CardRarity.RARE },
    { name: "Hacker", rarity: CardRarity.COMMON },
    { name: "Pirate Captain", rarity: CardRarity.COMMON },
    { name: "Deep Sea Diver", rarity: CardRarity.COMMON },
    { name: "Master Chef", rarity: CardRarity.COMMON },
    { name: "Jungle Explorer", rarity: CardRarity.COMMON },
    { name: "Dragon Rider", rarity: CardRarity.LEGENDARY },
    { name: "Inventor", rarity: CardRarity.EPIC },
    { name: "Cosmic Monarch", rarity: CardRarity.MYTHICAL },
    { name: "City Defender", rarity: CardRarity.LEGENDARY },
    { name: "Samurai", rarity: CardRarity.EPIC },
    { name: "Arctic Explorer", rarity: CardRarity.COMMON },
    { name: "Desert Nomad", rarity: CardRarity.COMMON },
    { name: "Private Detective", rarity: CardRarity.RARE },
    { name: "Painter", rarity: CardRarity.RARE },
    { name: "Firefighter", rarity: CardRarity.COMMON },
    { name: "Pilot", rarity: CardRarity.COMMON },
    { name: "Cyberpunk Racer", rarity: CardRarity.EPIC },
    { name: "Cosmic Gardener", rarity: CardRarity.RARE },
    { name: "Ghost Hunter", rarity: CardRarity.EPIC },
    { name: "Viking Warrior", rarity: CardRarity.RARE },
    { name: "Pharaoh", rarity: CardRarity.EPIC },
    { name: "Time Traveler", rarity: CardRarity.MYTHICAL },
    { name: "DJ", rarity: CardRarity.EPIC },
    { name: "Mountain Climber", rarity: CardRarity.RARE },
    { name: "Rune Smith", rarity: CardRarity.LEGENDARY },
    { name: "Gondolier", rarity: CardRarity.COMMON }
  ];

  for (let i = 0; i < totalCards; i++) {
    const cardData = cardsData[i] || { name: `Card ${i + 1}`, rarity: CardRarity.COMMON };
    const cardUrl = `/card/collect-${i + 1}.webp`;

    // Check if card already exists under any variant of its path
    const existingCard = await prisma.rareCard.findFirst({
      where: {
        imageUrl: {
          in: [
            cardUrl,
            `/card/collect-${i + 1}.avif`,
            `/optimized/collect-${i + 1}.avif`,
            `/optimized/collect-${i + 1}.webp`
          ]
        }
      }
    });

    if (!existingCard) {
      await prisma.rareCard.create({
        data: {
          name: cardData.name,
          imageUrl: cardUrl,
          rarity: cardData.rarity,
        }
      });
      seededNewCount++;
    } else {
      const newUrl = existingCard.imageUrl && (existingCard.imageUrl.endsWith('.avif') || existingCard.imageUrl.includes('/optimized/'))
        ? existingCard.imageUrl.replace(/\.avif$/, '.webp').replace('/optimized/', '/card/')
        : existingCard.imageUrl;

      await prisma.rareCard.update({
        where: { id: existingCard.id },
        data: {
          name: cardData.name,
          imageUrl: newUrl,
          rarity: cardData.rarity
        },
      });
    }
  }

  if (seededNewCount > 0) {
    console.log(`Seeded ${seededNewCount} new Rare Cards (out of ${totalCards} total).`);
  } else {
    console.log(`All ${totalCards} Rare Cards are already seeded and up-to-date.`);
  }

  // ── 6. Seed Rare Pass Season, Levels, Rewards, and Missions ──────────────────────────
  console.log('Seeding Rare Pass active season...');
  const now = new Date();
  const startAt = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const endAt = new Date(now.getTime() + 55 * 24 * 60 * 60 * 1000); // 60 days total duration

  const activeSeasonCount = await prisma.rarePassSeason.count({
    where: { status: RarePassSeasonStatus.ACTIVE },
  });

  if (activeSeasonCount === 0) {
    const season = await prisma.rarePassSeason.create({
      data: {
        name: 'Season 01: Cosmic Origins',
        status: RarePassSeasonStatus.ACTIVE,
        startAt,
        endAt,
        maxLevel: 50,
      },
    });

    console.log(`Created Rare Pass Season: ${season.name} (${season.id})`);

    // Create 50 levels with cumulative RP XP requirements
    console.log('Seeding Rare Pass Levels and Rewards...');
    const rewardsMap: Record<number, { free: { type: RarePassRewardType, amount?: number, metadata?: any }, premium: { type: RarePassRewardType, amount?: number, metadata?: any } }> = {
      1: { free: { type: RarePassRewardType.GP, amount: 50 }, premium: { type: RarePassRewardType.GP, amount: 100 } },
      2: { free: { type: RarePassRewardType.XP, amount: 50 }, premium: { type: RarePassRewardType.XP, amount: 100 } },
      3: { free: { type: RarePassRewardType.GP, amount: 75 }, premium: { type: RarePassRewardType.GP, amount: 150 } },
      4: { free: { type: RarePassRewardType.FRAGMENT, amount: 1 }, premium: { type: RarePassRewardType.FRAGMENT, amount: 2 } },
      5: { free: { type: RarePassRewardType.GP, amount: 75 }, premium: { type: RarePassRewardType.GP, amount: 150 } },
      6: { free: { type: RarePassRewardType.XP, amount: 75 }, premium: { type: RarePassRewardType.XP, amount: 150 } },
      7: { free: { type: RarePassRewardType.SPIN, amount: 1 }, premium: { type: RarePassRewardType.SPIN, amount: 2 } },
      8: { free: { type: RarePassRewardType.GP, amount: 100 }, premium: { type: RarePassRewardType.GP, amount: 200 } },
      9: { free: { type: RarePassRewardType.XP, amount: 100 }, premium: { type: RarePassRewardType.XP, amount: 200 } },
      10: { free: { type: RarePassRewardType.AVATAR, metadata: { variantId: explorerBasic.id } }, premium: { type: RarePassRewardType.AVATAR, metadata: { variantId: explorer3D.id } } },
      11: { free: { type: RarePassRewardType.GP, amount: 100 }, premium: { type: RarePassRewardType.GP, amount: 200 } },
      12: { free: { type: RarePassRewardType.XP, amount: 100 }, premium: { type: RarePassRewardType.XP, amount: 200 } },
      13: { free: { type: RarePassRewardType.FRAGMENT, amount: 1 }, premium: { type: RarePassRewardType.FRAGMENT, amount: 3 } },
      14: { free: { type: RarePassRewardType.GP, amount: 150 }, premium: { type: RarePassRewardType.GP, amount: 300 } },
      15: { free: { type: RarePassRewardType.SPIN, amount: 1 }, premium: { type: RarePassRewardType.SPIN, amount: 3 } },
      16: { free: { type: RarePassRewardType.XP, amount: 150 }, premium: { type: RarePassRewardType.XP, amount: 300 } },
      17: { free: { type: RarePassRewardType.GP, amount: 150 }, premium: { type: RarePassRewardType.GP, amount: 300 } },
      18: { free: { type: RarePassRewardType.FRAGMENT, amount: 1 }, premium: { type: RarePassRewardType.FRAGMENT, amount: 3 } },
      19: { free: { type: RarePassRewardType.XP, amount: 150 }, premium: { type: RarePassRewardType.XP, amount: 300 } },
      20: { free: { type: RarePassRewardType.GP, amount: 200 }, premium: { type: RarePassRewardType.GP, amount: 400 } },
      21: { free: { type: RarePassRewardType.SPIN, amount: 1 }, premium: { type: RarePassRewardType.SPIN, amount: 3 } },
      22: { free: { type: RarePassRewardType.XP, amount: 150 }, premium: { type: RarePassRewardType.XP, amount: 300 } },
      23: { free: { type: RarePassRewardType.FRAGMENT, amount: 1 }, premium: { type: RarePassRewardType.FRAGMENT, amount: 3 } },
      24: { free: { type: RarePassRewardType.GP, amount: 200 }, premium: { type: RarePassRewardType.GP, amount: 400 } },
      25: { free: { type: RarePassRewardType.XP, amount: 200 }, premium: { type: RarePassRewardType.XP, amount: 400 } },
      26: { free: { type: RarePassRewardType.SPIN, amount: 1 }, premium: { type: RarePassRewardType.SPIN, amount: 3 } },
      27: { free: { type: RarePassRewardType.GP, amount: 200 }, premium: { type: RarePassRewardType.GP, amount: 400 } },
      28: { free: { type: RarePassRewardType.FRAGMENT, amount: 1 }, premium: { type: RarePassRewardType.FRAGMENT, amount: 3 } },
      29: { free: { type: RarePassRewardType.XP, amount: 200 }, premium: { type: RarePassRewardType.XP, amount: 400 } },
      30: { free: { type: RarePassRewardType.GP, amount: 250 }, premium: { type: RarePassRewardType.GP, amount: 500 } },
      31: { free: { type: RarePassRewardType.SPIN, amount: 1 }, premium: { type: RarePassRewardType.SPIN, amount: 3 } },
      32: { free: { type: RarePassRewardType.XP, amount: 200 }, premium: { type: RarePassRewardType.XP, amount: 400 } },
      33: { free: { type: RarePassRewardType.FRAGMENT, amount: 2 }, premium: { type: RarePassRewardType.FRAGMENT, amount: 5 } },
      34: { free: { type: RarePassRewardType.GP, amount: 250 }, premium: { type: RarePassRewardType.GP, amount: 500 } },
      35: { free: { type: RarePassRewardType.XP, amount: 200 }, premium: { type: RarePassRewardType.XP, amount: 400 } },
      36: { free: { type: RarePassRewardType.SPIN, amount: 2 }, premium: { type: RarePassRewardType.SPIN, amount: 5 } },
      37: { free: { type: RarePassRewardType.GP, amount: 250 }, premium: { type: RarePassRewardType.GP, amount: 500 } },
      38: { free: { type: RarePassRewardType.FRAGMENT, amount: 2 }, premium: { type: RarePassRewardType.FRAGMENT, amount: 5 } },
      39: { free: { type: RarePassRewardType.XP, amount: 200 }, premium: { type: RarePassRewardType.XP, amount: 400 } },
      40: { free: { type: RarePassRewardType.GP, amount: 250 }, premium: { type: RarePassRewardType.GP, amount: 500 } },
      41: { free: { type: RarePassRewardType.SPIN, amount: 2 }, premium: { type: RarePassRewardType.SPIN, amount: 5 } },
      42: { free: { type: RarePassRewardType.XP, amount: 200 }, premium: { type: RarePassRewardType.XP, amount: 400 } },
      43: { free: { type: RarePassRewardType.FRAGMENT, amount: 2 }, premium: { type: RarePassRewardType.FRAGMENT, amount: 5 } },
      44: { free: { type: RarePassRewardType.GP, amount: 300 }, premium: { type: RarePassRewardType.GP, amount: 600 } },
      45: { free: { type: RarePassRewardType.XP, amount: 250 }, premium: { type: RarePassRewardType.XP, amount: 500 } },
      46: { free: { type: RarePassRewardType.SPIN, amount: 3 }, premium: { type: RarePassRewardType.SPIN, amount: 6 } },
      47: { free: { type: RarePassRewardType.GP, amount: 350 }, premium: { type: RarePassRewardType.GP, amount: 700 } },
      48: { free: { type: RarePassRewardType.FRAGMENT, amount: 3 }, premium: { type: RarePassRewardType.FRAGMENT, amount: 10 } },
      49: { free: { type: RarePassRewardType.XP, amount: 300 }, premium: { type: RarePassRewardType.XP, amount: 600 } },
      50: { free: { type: RarePassRewardType.CARD, amount: 1 }, premium: { type: RarePassRewardType.CARD, amount: 1 } },
    };

    for (let l = 1; l <= 50; l++) {
      const requiredRpXp = (l - 1) * 100;

      const levelRecord = await prisma.rarePassLevel.create({
        data: {
          seasonId: season.id,
          level: l,
          requiredRpXp,
        },
      });

      const rewardsForLevel = rewardsMap[l];
      if (rewardsForLevel) {
        await prisma.rarePassReward.create({
          data: {
            levelId: levelRecord.id,
            track: RarePassTrack.FREE,
            rewardType: rewardsForLevel.free.type,
            amount: rewardsForLevel.free.amount ?? null,
            metadata: rewardsForLevel.free.metadata ?? null,
            sortOrder: 1,
          },
        });
        await prisma.rarePassReward.create({
          data: {
            levelId: levelRecord.id,
            track: RarePassTrack.PREMIUM,
            rewardType: rewardsForLevel.premium.type,
            amount: rewardsForLevel.premium.amount ?? null,
            metadata: rewardsForLevel.premium.metadata ?? null,
            sortOrder: 1,
          },
        });
      }
    }

    // Seed Rare Pass Missions
    console.log('Seeding Rare Pass Missions...');
    await prisma.rarePassMission.createMany({
      data: [
        { seasonId: season.id, code: 'mission_checkin_daily', name: 'Check in today', description: 'Complete your daily check-in', rpXpReward: 10, type: RarePassMissionType.DAILY, targetCount: 1 },
        { seasonId: season.id, code: 'mission_complete_quests_daily', name: 'Complete 2 quests', description: 'Complete any 2 quests today', rpXpReward: 40, type: RarePassMissionType.DAILY, targetCount: 2 },
        { seasonId: season.id, code: 'mission_spin_daily', name: 'Spin the wheel 1 time', description: 'Spin the wheel today', rpXpReward: 20, type: RarePassMissionType.DAILY, targetCount: 1 },
        { seasonId: season.id, code: 'mission_craft_card_weekly', name: 'Craft 1 Card', description: 'Merge 10 fragments into a Rare Card', rpXpReward: 250, type: RarePassMissionType.WEEKLY, targetCount: 1 },
        { seasonId: season.id, code: 'mission_invite_friends_weekly', name: 'Invite 2 users', description: 'Invite 2 unique friends to link wallets', rpXpReward: 300, type: RarePassMissionType.WEEKLY, targetCount: 2 },
      ],
    });
  } else {
    console.log('Active Rare Pass Season already exists. Skipping season levels/rewards/missions creation.');
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
