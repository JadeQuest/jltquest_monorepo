export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserAuthPayload {
  userId: string;
  walletAddress?: string;
  role?: string;
}

export interface DecodedToken {
  userId: string;
  walletAddress?: string;
  role?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserAuthPayload;
    }
  }
}

// ─────────────────────────────────────────────
// Auth Domain DTOs
// ─────────────────────────────────────────────
export interface LoginResponseData {
  token: string;
  refreshToken?: string;
  expiresIn: number;
  user: {
    id: string;
    walletAddress?: string | null;
    walletConnected: boolean;
    level: number;
    xp: number;
    gp: number;
    streak?: any;
    spinState?: any;
  };
}

export interface RefreshTokenResponseData {
  token: string;
  expiresIn: number;
}

export interface LogoutResponseData {
  message: string;
}

// ─────────────────────────────────────────────
// User & Dashboard DTOs
// ─────────────────────────────────────────────
export interface UserSocialConnectionItem {
  connected: boolean;
  handle?: string | null;
  email?: string | null;
  linkedAt?: Date | string | null;
}

export interface ActiveAvatarInfo {
  variantId: string;
  type: string;
  imageUrl?: string | null;
  modelUrl?: string | null;
  name?: string;
  characterKey?: string;
}

export interface UserDashboardDto {
  user: {
    id: string;
    walletAddress?: string | null;
    level: number;
    levelTier?: string;
    xp: number;
    gp: number;
    jlt: number;
    streak?: any;
    activeAvatar?: ActiveAvatarInfo | null;
  };
  leveling: {
    currentXp: number;
    nextLevelXp: number;
    progress: number;
  };
  socialConnections: Record<string, UserSocialConnectionItem>;
}

export interface ConvertGpResultDto {
  convertedGp: number;
  jltReceived: number;
  newGpBalance: number;
  newJltBalance: number;
}

// ─────────────────────────────────────────────
// Check-In Domain DTOs
// ─────────────────────────────────────────────
export interface CheckInStatusDto {
  streak: number;
  canClaim: boolean;
  nextRewardGp: number;
  nextRewardXp: number;
}

export interface CheckInClaimResultDto {
  gpAwarded: number;
  xpAwarded: number;
  rpXpAwarded: number;
  newStreak: number;
}

// ─────────────────────────────────────────────
// Quests Domain DTOs
// ─────────────────────────────────────────────
export interface QuestDto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  gpReward: number;
  xpReward: number;
  rpXpReward: number;
  fragmentReward: number;
  frequency: string;
  category: string;
  completed: boolean;
  canClaim: boolean;
  completedCount?: number;
  isHidden?: boolean;
}

export interface QuestClaimResultDto {
  gpAwarded: number;
  xpAwarded: number;
  rpXpAwarded: number;
  fragmentsAwarded: number;
}

// ─────────────────────────────────────────────
// Spin to Win Domain DTOs
// ─────────────────────────────────────────────
export interface SpinStatusDto {
  availableFreeSpins: number;
  purchasedSpinsAvailable: number;
  lastFreeSpinAt: Date | string | null;
  totalSpins: number;
}

export interface SpinResultDto {
  outcome: string;
  gpAwarded: number;
  xpAwarded: number;
  rpXpAwarded: number;
  fragmentsAwarded: number;
  freeSpinAwarded: number;
}

export interface SpinPurchaseResultDto {
  success: boolean;
}

// ─────────────────────────────────────────────
// Invites Domain DTOs
// ─────────────────────────────────────────────
export interface InviteStatsDto {
  inviteCode: string;
  totalInvited: number;
  gpEarnedFromInvites: number;
  hasRedeemed: boolean;
  redemptions: any[];
  milestoneClaims: any[];
}

export interface RedeemInviteResultDto {
  success: boolean;
  inviteeGpAwarded: number;
}

export interface ClaimMilestoneResultDto {
  success: boolean;
  gpAwarded: number;
  xpAwarded: number;
}

// ─────────────────────────────────────────────
// Social Connections Domain DTOs
// ─────────────────────────────────────────────
export interface SocialOAuthUrlDto {
  oauthUrl: string;
  type?: string;
  url?: string;
  webUrl?: string;
}

export interface SocialCallbackResultDto {
  platform: string;
  connected: boolean;
  connectionBonusAwarded: boolean;
  gpAwarded: number;
  xpAwarded: number;
  connection: any;
}

export interface SocialDisconnectResultDto {
  platform: string;
  connected: boolean;
  clawbackApplied: boolean;
  gpClawedBack: number;
  connection: any;
}

export interface SocialQuestDto {
  id: string;
  code: string;
  platform: string;
  name: string;
  description?: string | null;
  gpReward: number;
  xpReward: number;
  rpXpReward: number;
  frequency: string;
  completed: boolean;
  canClaim: boolean;
}

export interface SocialQuestClaimResultDto {
  gpAwarded: number;
  xpAwarded: number;
  rpXpAwarded: number;
}

// ─────────────────────────────────────────────
// Leveling DTOs
// ─────────────────────────────────────────────
export interface LevelRequirementDto {
  level: number;
  levelTier: string;
  xpRequired: number;
  rewards?: {
    type: string;
    amount: number;
  }[];
}

// ─────────────────────────────────────────────
// Collection & Cards DTOs
// ─────────────────────────────────────────────
export interface CardItemDto {
  id: string;
  name: string;
  imageUrl: string;
  rarity?: string;
  quantity: number;
  acquiredAt?: Date | string;
}

export interface CollectionDto {
  fragments: number;
  cards: CardItemDto[];
}

export interface MergeFragmentsResultDto {
  success: boolean;
  fragmentsRemaining: number;
  rpXpAwarded: number;
  cardAwarded: CardItemDto;
}

// ─────────────────────────────────────────────
// Rare Pass Domain DTOs
// ─────────────────────────────────────────────
export interface RarePassSeasonDto {
  id: string;
  name: string;
  startAt: string;
  endAt: string;
  maxLevel: number;
}

export interface RarePassProgressionDto {
  totalRpXp: number;
  currentLevel: number;
  xpInCurrentLevel: number;
  xpRequiredForNext: number;
  progress: number;
  isPremium: boolean;
}

export interface RarePassStatusDto {
  season: RarePassSeasonDto;
  progression: RarePassProgressionDto;
}

export interface RarePassRewardItemDto {
  id: string;
  track: 'FREE' | 'PREMIUM';
  rewardType: 'GP' | 'XP' | 'FRAGMENT' | 'SPIN' | 'CARD' | 'AVATAR' | string;
  amount?: number | null;
  claimed?: boolean;
  isClaimed?: boolean;
  canClaim?: boolean;
  isClaimable?: boolean;
  metadata?: any;
}

export interface RarePassLevelConfigDto {
  level: number;
  requiredRpXp: number;
  rewards: RarePassRewardItemDto[];
}

export interface RarePassMissionDto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  rpXpReward: number;
  type: 'DAILY' | 'WEEKLY' | 'SEASONAL' | string;
  targetCount: number;
  progress: number;
  completed: boolean;
  canClaim: boolean;
}

export interface RarePassClaimResultDto {
  success: boolean;
  rewardType?: string;
  amount?: number;
  grantDetails?: any;
}

export interface RarePassMissionClaimResultDto {
  success: boolean;
  rpXpAwarded: number;
}

export interface RarePassPurchaseResultDto {
  success: boolean;
  message?: string;
}

// ─────────────────────────────────────────────
// Avatars Domain DTOs
// ─────────────────────────────────────────────
export interface AvatarVariantDto {
  id: string;
  type: string;
  imageUrl?: string | null;
  modelUrl?: string | null;
  unlocked: boolean;
  active: boolean;
  unlockDescription?: string | null;
  isPurchasable: boolean;
  costGp: number;
  costJlt: number;
}

export interface AvatarDto {
  id: string;
  name: string;
  characterKey: string;
  variants: AvatarVariantDto[];
}

export interface AvatarSelectResultDto {
  success: boolean;
  activeAvatar: ActiveAvatarInfo;
}

export interface AvatarUnlockResultDto {
  success: boolean;
  message: string;
}

// ─────────────────────────────────────────────
// Leaderboard Domain DTOs
// ─────────────────────────────────────────────
export type LeaderboardCategory =
  | 'gp'
  | 'jlt'
  | 'level'
  | 'streak'
  | 'pass'
  | 'total_gp'
  | 'total_jlt'
  | 'highest_streak'
  | 'season_rank'
  | 'xp';

export interface LeaderboardEntryDto {
  rank: number;
  id: string;
  walletAddress?: string | null;
  maskedAddress: string;
  level: number;
  levelTier: string;
  xp: number;
  totalLifetimeXp: number;
  gp: number;
  totalGp: number;
  jlt: number;
  totalJlt: number;
  currentStreak: number;
  longestStreak: number;
  seasonRpXp: number;
  seasonName: string;
  avatarUrl: string;
}
