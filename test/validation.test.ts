import { describe, it, expect } from 'vitest';
import { signupSchema, loginSchema, sessionSchema } from '../src/lib/validation';

describe('validation', () => {
  it('accepts a valid signup', () => {
    expect(signupSchema.safeParse({ email: 'A@b.com', password: 'abcdef12', displayName: 'Zee_16' }).success).toBe(true);
  });
  it('rejects weak or malformed input', () => {
    expect(signupSchema.safeParse({ email: 'nope', password: 'abcdef12', displayName: 'Zee' }).success).toBe(false);
    expect(signupSchema.safeParse({ email: 'a@b.com', password: 'short1', displayName: 'Zee' }).success).toBe(false);
    expect(signupSchema.safeParse({ email: 'a@b.com', password: 'abcdefgh', displayName: 'Zee' }).success).toBe(false);
    expect(signupSchema.safeParse({ email: 'a@b.com', password: 'abcdef12', displayName: '<script>' }).success).toBe(false);
  });
  it('requires a password on login', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false);
  });
  it('rejects impossible session values', () => {
    const ok = { score: 100, roundsSurvived: 1, falls: 0, accuracy: 100, avgDecisionMs: 900, durationSeconds: 60, level: 1, reachedExit: true };
    expect(sessionSchema.safeParse(ok).success).toBe(true);
    expect(sessionSchema.safeParse({ ...ok, score: -5 }).success).toBe(false);
    expect(sessionSchema.safeParse({ ...ok, accuracy: 140 }).success).toBe(false);
  });
});