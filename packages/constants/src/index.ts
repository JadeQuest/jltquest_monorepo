export const APP_NAME = 'JLTQuest';
export const API_VERSION = 'v1';
export const DEFAULT_PAGINATION_LIMIT = 20;

export enum ErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  ALREADY_CLAIMED = 'ALREADY_CLAIMED',
  ACCOUNT_ALREADY_LINKED = 'ACCOUNT_ALREADY_LINKED',
  NOT_CONNECTED = 'NOT_CONNECTED',
  INSUFFICIENT_SPINS = 'INSUFFICIENT_SPINS',
  INSUFFICIENT_GP = 'INSUFFICIENT_GP',
  INSUFFICIENT_JLT = 'INSUFFICIENT_JLT',
  INSUFFICIENT_FRAGMENTS = 'INSUFFICIENT_FRAGMENTS',
  NO_CARDS_AVAILABLE = 'NO_CARDS_AVAILABLE',
  REQUIREMENTS_NOT_MET = 'REQUIREMENTS_NOT_MET',
  INVITE_CODE_INVALID = 'INVITE_CODE_INVALID',
  INVALID_SELF_INVITE = 'INVALID_SELF_INVITE',
  ALREADY_REDEEMED = 'ALREADY_REDEEMED',
  INVALID_PLATFORM = 'INVALID_PLATFORM',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  QUEST_NOT_FOUND = 'QUEST_NOT_FOUND',
  SEASON_NOT_ACTIVE = 'SEASON_NOT_ACTIVE',
  REWARD_NOT_FOUND = 'REWARD_NOT_FOUND',
  REWARD_ALREADY_CLAIMED = 'REWARD_ALREADY_CLAIMED',
  REWARD_LEVEL_NOT_REACHED = 'REWARD_LEVEL_NOT_REACHED',
  PREMIUM_NOT_PURCHASED = 'PREMIUM_NOT_PURCHASED',
  MISSION_NOT_FOUND = 'MISSION_NOT_FOUND',
  MISSION_ALREADY_COMPLETED = 'MISSION_ALREADY_COMPLETED',
  AVATAR_VARIANT_NOT_FOUND = 'AVATAR_VARIANT_NOT_FOUND',
  AVATAR_NOT_UNLOCKED = 'AVATAR_NOT_UNLOCKED',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  SIGNATURE_EXPIRED = 'SIGNATURE_EXPIRED',
  REFRESH_TOKEN_EXPIRED = 'REFRESH_TOKEN_EXPIRED',
  REFRESH_TOKEN_REVOKED = 'REFRESH_TOKEN_REVOKED',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  UNAUTHORIZED_ROLE = 'UNAUTHORIZED_ROLE',
  CSRF_TOKEN_INVALID = 'CSRF_TOKEN_INVALID',
  CIRCULAR_INVITE_NOT_ALLOWED = 'CIRCULAR_INVITE_NOT_ALLOWED',
}

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.INVALID_INPUT]: 'Invalid input provided.',
  [ErrorCode.BAD_REQUEST]: 'Bad request.',
  [ErrorCode.UNAUTHORIZED]: 'Unauthorized access.',
  [ErrorCode.FORBIDDEN]: 'Access forbidden.',
  [ErrorCode.NOT_FOUND]: 'Resource not found.',
  [ErrorCode.CONFLICT]: 'Conflict occurred.',
  [ErrorCode.INTERNAL_ERROR]: 'An unexpected error occurred.',
  [ErrorCode.ALREADY_CLAIMED]: 'You have already checked in or claimed this today.',
  [ErrorCode.ACCOUNT_ALREADY_LINKED]: 'Social account linked to another wallet.',
  [ErrorCode.NOT_CONNECTED]: 'Platform not connected.',
  [ErrorCode.INSUFFICIENT_SPINS]: 'No free spins available.',
  [ErrorCode.INSUFFICIENT_GP]: 'Not enough GP balance.',
  [ErrorCode.INSUFFICIENT_JLT]: 'Not enough JLT balance.',
  [ErrorCode.INSUFFICIENT_FRAGMENTS]: 'Not enough fragments. 10 required.',
  [ErrorCode.NO_CARDS_AVAILABLE]: 'No rare cards exist in the system.',
  [ErrorCode.REQUIREMENTS_NOT_MET]: 'Quest requirements are not met yet.',
  [ErrorCode.INVITE_CODE_INVALID]: 'Invalid invite code.',
  [ErrorCode.INVALID_SELF_INVITE]: 'Cannot use your own invite code.',
  [ErrorCode.ALREADY_REDEEMED]: 'You have already redeemed an invite code.',
  [ErrorCode.INVALID_PLATFORM]: 'Invalid social platform.',
  [ErrorCode.USER_NOT_FOUND]: 'User not found.',
  [ErrorCode.QUEST_NOT_FOUND]: 'Quest not found.',
  [ErrorCode.SEASON_NOT_ACTIVE]: 'No active Rare Pass season found.',
  [ErrorCode.REWARD_NOT_FOUND]: 'Rare Pass reward not found.',
  [ErrorCode.REWARD_ALREADY_CLAIMED]: 'Rare Pass reward already claimed.',
  [ErrorCode.REWARD_LEVEL_NOT_REACHED]: 'Required Rare Pass level not reached.',
  [ErrorCode.PREMIUM_NOT_PURCHASED]: 'Premium Rare Pass is required for this reward.',
  [ErrorCode.MISSION_NOT_FOUND]: 'Rare Pass mission not found.',
  [ErrorCode.MISSION_ALREADY_COMPLETED]: 'Rare Pass mission already completed.',
  [ErrorCode.AVATAR_VARIANT_NOT_FOUND]: 'Avatar variant not found.',
  [ErrorCode.AVATAR_NOT_UNLOCKED]: 'Avatar variant not unlocked for this user.',
  [ErrorCode.INVALID_SIGNATURE]: 'Cryptographic verification failed: wallet signature does not match address.',
  [ErrorCode.SIGNATURE_EXPIRED]: 'Signature challenge expired. Please re-sign.',
  [ErrorCode.REFRESH_TOKEN_EXPIRED]: 'Refresh token has expired.',
  [ErrorCode.REFRESH_TOKEN_REVOKED]: 'Session revoked due to token reuse detection.',
  [ErrorCode.INVALID_REFRESH_TOKEN]: 'Invalid refresh token provided.',
  [ErrorCode.UNAUTHORIZED_ROLE]: 'Unauthorized role access.',
  [ErrorCode.CSRF_TOKEN_INVALID]: 'Invalid or missing CSRF token.',
  [ErrorCode.CIRCULAR_INVITE_NOT_ALLOWED]: 'Circular invites are not allowed.',
};

export const AuthMessages = {
  MISSING_LOGIN_PARAMS: 'walletAddress, signature, and message are required for login',
  MISSING_TIMESTAMP: 'Message must contain a valid Timestamp value.',
  SIGNATURE_VERIFICATION_FAILED: 'Cryptographic verification failed: wallet signature does not match address.',
  REFRESH_TOKEN_REQUIRED: 'Refresh token is required.',
  SESSION_EXPIRED_RECONNECT: 'Session expired. Please reconnect your wallet.',
  TOKEN_REUSE_REVOKED: 'Session revoked due to token reuse detection.',
  LOGOUT_SUCCESS: 'Logged out successfully',
};

export const UserMessages = {
  PROFILE_FETCHED: 'User profile retrieved successfully',
  GP_CONVERTED_SUCCESS: 'Gold Points converted to JLT tokens successfully',
  MINIMUM_GP_REQUIRED: 'Minimum 100 GP required for conversion',
  GP_MULTIPLE_100: 'GP amount must be a multiple of 100',
};

export const CheckInMessages = {
  STATUS_FETCHED: 'Daily check-in status retrieved successfully',
  CLAIM_SUCCESS: 'Daily check-in claimed successfully',
  ALREADY_CHECKED_IN: 'You have already checked in today',
};

export const QuestMessages = {
  QUESTS_FETCHED: 'Quests list retrieved successfully',
  QUEST_CLAIMED_SUCCESS: 'Quest reward claimed successfully',
};

export const SpinMessages = {
  STATUS_FETCHED: 'Spin status retrieved successfully',
  SPIN_SUCCESS: 'Spin executed successfully',
  PURCHASE_SUCCESS: 'Spin purchased successfully',
};

export const InviteMessages = {
  STATS_FETCHED: 'Invite stats retrieved successfully',
  REDEEM_SUCCESS: 'Invite code redeemed successfully',
  MILESTONE_CLAIMED: 'Invite milestone claimed successfully',
};

export const SocialMessages = {
  OAUTH_URL_GENERATED: 'OAuth URL generated successfully',
  ACCOUNT_CONNECTED: 'Social account connected successfully',
  ACCOUNT_DISCONNECTED: 'Social account disconnected successfully',
  QUESTS_FETCHED: 'Social quests list retrieved successfully',
  QUEST_CLAIMED: 'Social quest reward claimed successfully',
};

export const CollectionMessages = {
  COLLECTION_FETCHED: 'User card collection retrieved successfully',
  MERGE_SUCCESS: 'Fragments merged into rare card successfully',
};

export const RarePassMessages = {
  STATUS_FETCHED: 'Rare Pass status retrieved successfully',
  REWARDS_FETCHED: 'Rare Pass rewards retrieved successfully',
  REWARD_CLAIMED: 'Rare Pass reward claimed successfully',
  MISSIONS_FETCHED: 'Rare Pass missions retrieved successfully',
  MISSION_CLAIMED: 'Rare Pass mission claimed successfully',
  PREMIUM_PURCHASED: 'Premium Rare Pass unlocked successfully',
};

export const AvatarMessages = {
  AVATARS_FETCHED: 'Avatars catalog retrieved successfully',
  AVATAR_SELECTED: 'Active avatar updated successfully',
  AVATAR_UNLOCKED: 'Avatar unlocked successfully',
};

export const LevelMessages = {
  REQUIREMENT_FETCHED: 'Level requirement retrieved successfully',
};

export const LeaderboardMessages = {
  LEADERBOARD_FETCHED: 'Leaderboard rankings retrieved successfully',
};

export const APP_CONFIG = {
  AUTH: {
    TOKEN_EXPIRES_IN_SECONDS: 900, // 15 minutes
    TOKEN_EXPIRES_IN_STR: '15m',
    REFRESH_TOKEN_EXPIRES_IN_SECONDS: 604800, // 7 days
    REFRESH_TOKEN_EXPIRES_IN_STR: '7d',
    WALLET_ADDRESS_REQUIRED_MSG: 'walletAddress required',
  },
  CHECKIN: {
    DAILY_REWARD_GP: 50,
    DAILY_REWARD_XP: 50,
  },
  SPIN: {
    COST_GP: 200,
    FREE_SPINS_DEFAULT: 1,
    RATES: {
      NOTHING: 0.15,
      GP_20: 0.35,
      GP_50: 0.50,
      GP_100: 0.60,
      XP_20: 0.70,
      FRAGMENT_1: 0.80,
      RP_XP_20: 0.90,
      FREE_SPIN_1: 1.00,
    }
  },
  COLLECTION: {
    MERGE_FRAGMENTS_REQUIRED: 10,
    RARITY_PROBABILITIES: {
      COMMON: 0.60,
      RARE: 0.25,
      EPIC: 0.12,
      LEGENDARY: 0.03,
    },
  },
  INVITE: {
    INVITER_GP_REWARD: 100,
    INVITEE_GP_REWARD: 50,
  },
  SOCIAL: {
    CONNECTION_GP_REWARD: 100,
    CONNECTION_XP_REWARD: 50,
    CLAWBACK_GP_AMOUNT: 100,
  },
  RARE_PASS: {
    DAILY_CAP_RP_XP: 500,
    WEEKLY_CAP_RP_XP: 2500,
    PREMIUM_COST_GP: 1000,
    PREMIUM_COST_JLT: 50,
  }
};
