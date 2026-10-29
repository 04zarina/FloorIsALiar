import { z } from 'zod';

export const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address').max(254);

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/[0-9]/, 'Include at least one number');

export const displayNameSchema = z
  .string()
  .trim()
  .min(3, 'Display name must be at least 3 characters')
  .max(20, 'Display name must be at most 20 characters')
  .regex(/^[A-Za-z0-9_ -]+$/, 'Use letters, numbers, spaces, - and _ only');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password'),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
});

export const sessionSchema = z.object({
  score: z.number().int().min(0).max(50000),
  roundsSurvived: z.number().int().min(0).max(10),
  falls: z.number().int().min(0).max(50),
  accuracy: z.number().min(0).max(100),
  avgDecisionMs: z.number().int().min(0).max(600000),
  durationSeconds: z.number().int().min(0).max(7200),
  level: z.number().int().min(1).max(10),
  reachedExit: z.boolean(),
});