import { z } from 'zod';

// Ethereum address validation
export const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
export const ethAddressSchema = z.string().regex(ethAddressRegex, 'Invalid Ethereum address');

// ─────────────────────────────────────────────
// Auth Schemas
// ─────────────────────────────────────────────
export const loginSchema = z.object({
  walletAddress: ethAddressSchema,
  signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/, 'Invalid signature format'),
  message: z.string().min(1, 'Message is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required').optional(),
});

// ─────────────────────────────────────────────
// User Schemas
// ─────────────────────────────────────────────
export const convertGpSchema = z.object({
  gpAmount: z
    .number({ invalid_type_error: 'GP amount must be a number' })
    .int('GP amount must be an integer')
    .min(100, 'Minimum 100 GP required for conversion')
    .refine((val) => val % 100 === 0, 'GP amount must be a multiple of 100'),
});

// ─────────────────────────────────────────────
// Quest Schemas
// ─────────────────────────────────────────────
export const claimQuestSchema = z.object({
  questId: z.string().min(1, 'Quest ID is required'),
});

// ─────────────────────────────────────────────
// Spin Schemas
// ─────────────────────────────────────────────
export const spinSchema = z.object({
  useFreeSpin: z.boolean().optional().default(false),
});

// ─────────────────────────────────────────────
// Invite Schemas
// ─────────────────────────────────────────────
export const redeemInviteSchema = z.object({
  inviteCode: z.string().optional(),
  code: z.string().optional(),
}).refine((data) => !!(data.inviteCode || data.code), {
  message: 'Invite code is required',
  path: ['inviteCode'],
});

export const claimMilestoneSchema = z.object({
  inviteeCount: z.coerce.number().int().min(1, 'Invitee count must be at least 1'),
  levelReached: z.coerce.number().int().min(1, 'Level reached must be at least 1'),
});

// ─────────────────────────────────────────────
// Social Schemas
// ─────────────────────────────────────────────
export const socialPlatformEnum = z.enum([
  'x',
  'twitter',
  'discord',
  'telegram',
  'linkedin',
  'whatsapp',
  'email',
  'instagram',
  'facebook',
]);

export const socialOAuthUrlParamsSchema = z.object({
  platform: socialPlatformEnum,
});

export const socialCallbackParamsSchema = z.object({
  platform: socialPlatformEnum,
});

export const socialCallbackSchema = z.object({
  code: z.string().optional(),
  handle: z.string().optional(),
  email: z.string().email().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  platformUserId: z.string().optional(),
}).passthrough();

export const socialDisconnectParamsSchema = z.object({
  platform: socialPlatformEnum,
});

export const socialClaimQuestParamsSchema = z.object({
  questId: z.string().min(1, 'Quest ID is required'),
});

// ─────────────────────────────────────────────
// Level Schemas
// ─────────────────────────────────────────────
export const getLevelRequirementParamsSchema = z.object({
  level: z.coerce.number().int().min(1, 'Level must be at least 1'),
});

// ─────────────────────────────────────────────
// Collection Schemas
// ─────────────────────────────────────────────
export const mergeFragmentsSchema = z.object({}).optional();

// ─────────────────────────────────────────────
// Rare Pass Schemas
// ─────────────────────────────────────────────
export const claimRarePassRewardSchema = z.object({
  rewardId: z.string().min(1, 'Reward ID is required'),
});

export const claimRarePassMissionParamsSchema = z.object({
  missionId: z.string().min(1, 'Mission ID is required'),
});

// ─────────────────────────────────────────────
// Avatar Schemas
// ─────────────────────────────────────────────
export const selectAvatarSchema = z.object({
  variantId: z.string().min(1, 'Variant ID is required'),
});

export const unlockAvatarSchema = z.object({
  variantId: z.string().min(1, 'Variant ID is required'),
});

// ─────────────────────────────────────────────
// Leaderboard Schemas
// ─────────────────────────────────────────────
export const getLeaderboardQuerySchema = z.object({
  type: z.enum(['gp', 'jlt', 'level', 'streak', 'pass', 'total_gp', 'total_jlt', 'highest_streak', 'season_rank', 'xp']).optional().default('total_gp'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// ─────────────────────────────────────────────
// Inferred TypeScript Input Types
// ─────────────────────────────────────────────
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ConvertGpInput = z.infer<typeof convertGpSchema>;
export type ClaimQuestParamsInput = z.infer<typeof claimQuestSchema>;
export type SpinInput = z.infer<typeof spinSchema>;
export type RedeemInviteInput = z.infer<typeof redeemInviteSchema>;
export type ClaimMilestoneInput = z.infer<typeof claimMilestoneSchema>;
export type SocialOAuthUrlParamsInput = z.infer<typeof socialOAuthUrlParamsSchema>;
export type SocialCallbackParamsInput = z.infer<typeof socialCallbackParamsSchema>;
export type SocialCallbackInput = z.infer<typeof socialCallbackSchema>;
export type SocialDisconnectParamsInput = z.infer<typeof socialDisconnectParamsSchema>;
export type SocialClaimQuestParamsInput = z.infer<typeof socialClaimQuestParamsSchema>;
export type GetLevelRequirementParamsInput = z.infer<typeof getLevelRequirementParamsSchema>;
export type ClaimRarePassRewardInput = z.infer<typeof claimRarePassRewardSchema>;
export type ClaimRarePassMissionParamsInput = z.infer<typeof claimRarePassMissionParamsSchema>;
export type SelectAvatarInput = z.infer<typeof selectAvatarSchema>;
export type UnlockAvatarInput = z.infer<typeof unlockAvatarSchema>;
export type GetLeaderboardQueryInput = z.infer<typeof getLeaderboardQuerySchema>;
