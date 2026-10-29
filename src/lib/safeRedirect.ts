/** Only allow in-app paths like "/game". Blocks "//evil.com", "/\evil.com" and full URLs. */
export function safeRedirectPath(value: unknown, fallback = '/game'): string {
  if (typeof value !== 'string') return fallback;
  if (!value.startsWith('/')) return fallback;
  if (value.startsWith('//') || value.includes('\\')) return fallback;
  if (/[\u0000-\u001f]/.test(value)) return fallback;
  return value;
}