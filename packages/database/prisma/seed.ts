import { PrismaClient, QuestFrequency, SocialPlatform, RarePassSeasonStatus, RarePassTrack, RarePassRewardType, RarePassMissionType, AvatarVariantType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // ── 1. Seed Avatars & Variants ──────────────────────────
  console.log('Seeding Avatars...');
  
  // Cosmic Explorer
  const cosmicExplorer = await prisma.avatar.upsert({
    where: { characterKey: 'cosmic_explorer' },
    update: {},
    create: {
      name: 'Cosmic Explorer',
      characterKey: 'cosmic_explorer'
    }
  });

  const explorerBasic = await prisma.avatarVariant.upsert({
    where: { id: 'var_cosmic_explorer_basic' },
    update: {},
    create: {
      id: 'var_cosmic_explorer_basic',
      avatarId: cosmicExplorer.id,
      type: AvatarVariantType.BASIC,
      imageUrl: '/optimized/avatars/cosmic_explorer_basic.webp'
    }
  });

  const explorer3D = await prisma.avatarVariant.upsert({
    where: { id: 'var_cosmic_explorer_3d' },
    update: {},
    create: {
      id: 'var_cosmic_explorer_3d',
      avatarId: cosmicExplorer.id,
      type: AvatarVariantType.THREE_D,
      imageUrl: '/optimized/avatars/cosmic_explorer_3d.webp'
    }
  });

  // Space Ranger
  const spaceRanger = await prisma.avatar.upsert({
    where: { characterKey: 'space_ranger' },
    update: {},
    create: {
      name: 'Space Ranger',
      characterKey: 'space_ranger'
    }
  });

  const rangerBasic = await prisma.avatarVariant.upsert({
    where: { id: 'var_space_ranger_basic' },
    update: {},
    create: {
      id: 'var_space_ranger_basic',
      avatarId: spaceRanger.id,
      type: AvatarVariantType.BASIC,
      imageUrl: '/optimized/avatars/space_ranger_basic.webp'
    }
  });

  const ranger3D = await prisma.avatarVariant.upsert({
    where: { id: 'var_space_ranger_3d' },
    update: {},
    create: {
      id: 'var_space_ranger_3d',
      avatarId: spaceRanger.id,
      type: AvatarVariantType.THREE_D,
      imageUrl: '/optimized/avatars/space_ranger_3d.webp'
    }
  });

  // ── 2. Seed Quests with RP XP rewards ──────────────────────────
  console.log('Seeding Quests...');
  await prisma.quest.upsert({
    where: { code: 'quest_connect_wallet' },
    update: { rpXpReward: 0 },
    create: { code: 'quest_connect_wallet', name: 'Connect Wallet', gpReward: 100, xpReward: 50, rpXpReward: 0, fragmentReward: 1, frequency: QuestFrequency.ONE_TIME }
  });

  await prisma.quest.upsert({
    where: { code: 'quest_complete_profile' },
    update: { rpXpReward: 0 },
    create: { code: 'quest_complete_profile', name: 'Complete Profile', gpReward: 100, xpReward: 50, rpXpReward: 0, fragmentReward: 1, frequency: QuestFrequency.ONE_TIME }
  });

  await prisma.quest.upsert({
    where: { code: 'quest_invite_friend' },
    update: { rpXpReward: 200 },
    create: { code: 'quest_invite_friend', name: 'Invite 1 Friend', gpReward: 150, xpReward: 75, rpXpReward: 200, fragmentReward: 2, frequency: QuestFrequency.REPEATABLE }
  });

  await prisma.quest.upsert({
    where: { code: 'quest_3_daily_spins' },
    update: { rpXpReward: 20 },
    create: { code: 'quest_3_daily_spins', name: 'Complete 3 Daily Spins', gpReward: 100, xpReward: 40, rpXpReward: 20, fragmentReward: 1, frequency: QuestFrequency.DAILY }
  });

  // One-time social connections
  await prisma.quest.upsert({
    where: { code: 'quest_connect_x' },
    update: { rpXpReward: 40 },
    create: { code: 'quest_connect_x', name: 'Connect X (Twitter)', gpReward: 100, xpReward: 50, rpXpReward: 40, fragmentReward: 1, frequency: QuestFrequency.ONE_TIME }
  });

  await prisma.quest.upsert({
    where: { code: 'quest_connect_discord' },
    update: { rpXpReward: 40 },
    create: { code: 'quest_connect_discord', name: 'Join Discord + Link Account', gpReward: 100, xpReward: 50, rpXpReward: 40, fragmentReward: 1, frequency: QuestFrequency.ONE_TIME }
  });

  await prisma.quest.upsert({
    where: { code: 'quest_connect_telegram' },
    update: { rpXpReward: 40 },
    create: { code: 'quest_connect_telegram', name: 'Join Telegram + Link Account', gpReward: 100, xpReward: 50, rpXpReward: 40, fragmentReward: 1, frequency: QuestFrequency.ONE_TIME }
  });

  // ── 3. Seed Recurring Social Quests with RP XP rewards ──────────────────────────
  console.log('Seeding Social Quests...');
  await prisma.socialQuest.upsert({
    where: { code: 'x_follow' },
    update: { rpXpReward: 40 },
    create: { code: 'x_follow', platform: SocialPlatform.X, name: 'Follow official account', gpReward: 50, xpReward: 25, rpXpReward: 40, frequency: QuestFrequency.ONE_TIME }
  });

  await prisma.socialQuest.upsert({
    where: { code: 'x_retweet' },
    update: { rpXpReward: 40 },
    create: { code: 'x_retweet', platform: SocialPlatform.X, name: 'Retweet/Repost featured post', gpReward: 30, xpReward: 15, rpXpReward: 40, frequency: QuestFrequency.WEEKLY }
  });

  await prisma.socialQuest.upsert({
    where: { code: 'discord_react' },
    update: { rpXpReward: 40 },
    create: { code: 'discord_react', platform: SocialPlatform.DISCORD, name: 'React to weekly announcement', gpReward: 20, xpReward: 10, rpXpReward: 40, frequency: QuestFrequency.WEEKLY }
  });

  await prisma.socialQuest.upsert({
    where: { code: 'telegram_tapin' },
    update: { rpXpReward: 40 },
    create: { code: 'telegram_tapin', platform: SocialPlatform.TELEGRAM, name: 'Daily tap-in in group', gpReward: 15, xpReward: 10, rpXpReward: 40, frequency: QuestFrequency.DAILY }
  });

  // ── 4. Seed System Config ──────────────────────────
  console.log('Seeding System Config...');
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

  // ── 5. Seed Rare Cards ──────────────────────────
  console.log('Seeding Rare Cards...');
  const rareCardsData = Array.from({ length: 16 }).map((_, i) => ({
    name: `Card ${i + 1}`,
    imageUrl: `/optimized/collect-${i + 1}.webp`,
  }));

  const existingCardsCount = await prisma.rareCard.count();
  if (existingCardsCount === 0) {
    await prisma.rareCard.createMany({
      data: rareCardsData,
    });
  }

  // ── 6. Seed Rare Pass Season, Levels, Rewards, and Missions ──────────────────────────
  console.log('Seeding Rare Pass active season...');
  const now = new Date();
  const startAt = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const endAt = new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000);

  // Clear existing seasons and cascade relations if needed (in local dev seed)
  const activeSeasonCount = await prisma.rarePassSeason.count({
    where: { status: RarePassSeasonStatus.ACTIVE }
  });

  if (activeSeasonCount === 0) {
    const season = await prisma.rarePassSeason.create({
      data: {
        name: 'Season 01: Cosmic Origins',
        status: RarePassSeasonStatus.ACTIVE,
        startAt,
        endAt,
        maxLevel: 30
      }
    });

    console.log(`Created Rare Pass Season: ${season.name} (${season.id})`);

    // Create 30 levels with cumulative RP XP requirements
    // L1: 0, L2: 100, L3: 220, L4: 360, ... L(n): L(n-1) + 100 + 20*(n-2)
    console.log('Seeding Rare Pass Levels and Rewards...');
    let cumulativeXp = 0;
    for (let l = 1; l <= 30; l++) {
      if (l > 1) {
        cumulativeXp += 100 + 20 * (l - 2);
      }

      const levelRecord = await prisma.rarePassLevel.create({
        data: {
          seasonId: season.id,
          level: l,
          requiredRpXp: cumulativeXp
        }
      });

      // Seed Free Rewards
      if (l === 1) {
        await prisma.rarePassReward.create({
          data: { levelId: levelRecord.id, track: RarePassTrack.FREE, rewardType: RarePassRewardType.GP, amount: 50, sortOrder: 1 }
        });
        await prisma.rarePassReward.create({
          data: { levelId: levelRecord.id, track: RarePassTrack.PREMIUM, rewardType: RarePassRewardType.GP, amount: 100, sortOrder: 1 }
        });
      } else if (l === 5) {
        await prisma.rarePassReward.create({
          data: { levelId: levelRecord.id, track: RarePassTrack.FREE, rewardType: RarePassRewardType.GP, amount: 100, sortOrder: 1 }
        });
        await prisma.rarePassReward.create({
          data: { levelId: levelRecord.id, track: RarePassTrack.FREE, rewardType: RarePassRewardType.AVATAR, amount: null, metadata: { variantId: explorerBasic.id }, sortOrder: 2 }
        });
        await prisma.rarePassReward.create({
          data: { levelId: levelRecord.id, track: RarePassTrack.PREMIUM, rewardType: RarePassRewardType.GP, amount: 200, sortOrder: 1 }
        });
        await prisma.rarePassReward.create({
          data: { levelId: levelRecord.id, track: RarePassTrack.PREMIUM, rewardType: RarePassRewardType.AVATAR, amount: null, metadata: { variantId: explorer3D.id }, sortOrder: 2 }
        });
      } else if (l === 10) {
        await prisma.rarePassReward.create({
          data: { levelId: levelRecord.id, track: RarePassTrack.FREE, rewardType: RarePassRewardType.FRAGMENT, amount: 3, sortOrder: 1 }
        });
        await prisma.rarePassReward.create({
          data: { levelId: levelRecord.id, track: RarePassTrack.PREMIUM, rewardType: RarePassRewardType.FRAGMENT, amount: 10, sortOrder: 1 }
        });
      } else if (l === 15) {
        await prisma.rarePassReward.create({
          data: { levelId: levelRecord.id, track: RarePassTrack.FREE, rewardType: RarePassRewardType.CARD, amount: 1, sortOrder: 1 }
        });
        await prisma.rarePassReward.create({
          data: { levelId: levelRecord.id, track: RarePassTrack.PREMIUM, rewardType: RarePassRewardType.CARD, amount: 1, sortOrder: 1 }
        });
      } else if (l === 25) {
        await prisma.rarePassReward.create({
          data: { levelId: levelRecord.id, track: RarePassTrack.FREE, rewardType: RarePassRewardType.FRAGMENT, amount: 5, sortOrder: 1 }
        });
        await prisma.rarePassReward.create({
          data: { levelId: levelRecord.id, track: RarePassTrack.PREMIUM, rewardType: RarePassRewardType.FRAGMENT, amount: 15, sortOrder: 1 }
        });
      } else if (l === 30) {
        await prisma.rarePassReward.create({
          data: { levelId: levelRecord.id, track: RarePassTrack.FREE, rewardType: RarePassRewardType.CARD, amount: 1, sortOrder: 1 }
        });
        await prisma.rarePassReward.create({
          data: { levelId: levelRecord.id, track: RarePassTrack.PREMIUM, rewardType: RarePassRewardType.CARD, amount: 1, sortOrder: 1 } // season legendary card
        });
      } else {
        // Normal levels get small rewards
        await prisma.rarePassReward.create({
          data: { levelId: levelRecord.id, track: RarePassTrack.FREE, rewardType: RarePassRewardType.GP, amount: 10 + l, sortOrder: 1 }
        });
        await prisma.rarePassReward.create({
          data: { levelId: levelRecord.id, track: RarePassTrack.PREMIUM, rewardType: RarePassRewardType.GP, amount: 30 + l * 2, sortOrder: 1 }
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
        { seasonId: season.id, code: 'mission_invite_friends_weekly', name: 'Invite 2 users', description: 'Invite 2 unique friends to link wallets', rpXpReward: 300, type: RarePassMissionType.WEEKLY, targetCount: 2 }
      ]
    });
  } else {
    console.log('Active Rare Pass Season already exists. Skipping season levels/rewards/missions creation.');
  }

  console.log('Seed complete successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
