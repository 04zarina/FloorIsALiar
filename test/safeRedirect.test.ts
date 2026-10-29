import { describe, it, expect } from 'vitest';
import { safeRedirectPath } from '../src/lib/safeRedirect';

describe('safeRedirectPath', () => {
  it('allows normal in-app paths', () => {
    expect(safeRedirectPath('/dashboard')).toBe('/dashboard');
    expect(safeRedirectPath('/game')).toBe('/game');
  });
  it('blocks external and malformed targets', () => {
    expect(safeRedirectPath('https://evil.com')).toBe('/game');
    expect(safeRedirectPath('//evil.com')).toBe('/game');
    expect(safeRedirectPath('/\\evil.com')).toBe('/game');
    expect(safeRedirectPath('javascript:alert(1)')).toBe('/game');
  });
  it('falls back for non-strings', () => {
    expect(safeRedirectPath(undefined)).toBe('/game');
    expect(safeRedirectPath(42)).toBe('/game');
  });
});