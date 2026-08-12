import { z } from 'zod';

// Ethereum address validation
const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
export const ethAddressSchema = z.string().regex(ethAddressRegex, 'Invalid Ethereum address');

export const loginSchema = z.object({
  walletAddress: ethAddressSchema,
  signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/, 'Invalid signature format'),
  message: z.string().min(1, 'Message is required'),
});

export const claimQuestSchema = z.object({
  questId: z.string().uuid('Invalid quest ID format'),
});

export const selectAvatarSchema = z.object({
  variantId: z.string().uuid('Invalid variant ID format'),
});

export const socialCallbackSchema = z.object({
  platform: z.enum(['x', 'twitter', 'discord', 'telegram', 'linkedin', 'whatsapp', 'email']),
  payload: z.object({
    code: z.string().optional(),
    handle: z.string().optional(),
    email: z.string().email().optional(),
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
    platformUserId: z.string().optional(),
  }).passthrough(),
});

export const convertGpSchema = z.object({
  gpAmount: z.number().int().min(100, 'Minimum 100 GP required for conversion'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ClaimQuestInput = z.infer<typeof claimQuestSchema>;
export type SelectAvatarInput = z.infer<typeof selectAvatarSchema>;
export type ConvertGpInput = z.infer<typeof convertGpSchema>;
