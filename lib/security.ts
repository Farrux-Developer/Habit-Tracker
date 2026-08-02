// ============================================================
// Security utilities — XSS protection, rate limiting, encryption
// ============================================================

/** Strip HTML tags, scripts, and event handlers from user input */
export function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")           // strip HTML tags
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "") // strip event handlers
    .replace(/javascript\s*:/gi, "")    // strip javascript: URIs
    .trim()
    .slice(0, 200);                     // max 200 chars
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 100;
}

/** Validate password strength */
export function isValidPassword(pw: string): boolean {
  return pw.length >= 4 && pw.length <= 128 && !/<[^>]*>/.test(pw);
}

// ============================================================
// Rate limiting (in-memory, per-session)
// ============================================================
interface RateEntry { count: number; resetAt: number; blockedUntil: number }

const rateStore = new Map<string, RateEntry>();

/** Returns true if action is allowed, false if rate limited */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
  blockMs: number = 60000,
): boolean {
  const now = Date.now();
  let entry = rateStore.get(key);

  if (!entry || now > entry.resetAt + windowMs) {
    entry = { count: 0, resetAt: now, blockedUntil: 0 };
    rateStore.set(key, entry);
  }

  if (entry.blockedUntil > now) return false;

  entry.count++;
  if (entry.count > maxAttempts) {
    entry.blockedUntil = now + blockMs;
    return false;
  }

  return true;
}

/** Get remaining attempts for a key */
export function getRateRemaining(key: string, maxAttempts: number): number {
  const entry = rateStore.get(key);
  if (!entry) return maxAttempts;
  return Math.max(0, maxAttempts - entry.count);
}

// ============================================================
// Simple localStorage obfuscation (not crypto, but hides plaintext)
// ============================================================
const XOR_KEY = "LiG-2026-sec";

export function obfuscate(data: string): string {
  let result = "";
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(
      data.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length),
    );
  }
  return btoa(result);
}

export function deobfuscate(encoded: string): string {
  try {
    const data = atob(encoded);
    let result = "";
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(
        data.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length),
      );
    }
    return result;
  } catch {
    return "";
  }
}
