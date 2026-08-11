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
};

export const APP_CONFIG = {
  AUTH: {
    TOKEN_EXPIRES_IN_SECONDS: 86400,
    TOKEN_EXPIRES_IN_STR: '1d',
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
  }
};
