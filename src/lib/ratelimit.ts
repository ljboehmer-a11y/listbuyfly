import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Rate limiting for public-facing write endpoints.
 *
 * Uses Upstash Redis over REST (works from any Vercel region, no persistent
 * connection). Falls back to "disabled" (always allow) if env vars aren't
 * configured — so local dev and preview builds don't need Upstash, but
 * production will rate limit once the env is set.
 *
 * Env vars required in production:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Lazy so a broken env var doesn't crash module load.
let _redis: Redis | null = null;
function getRedis(): Redis | null {
  if (!hasUpstash) return null;
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}

// Lead form: 5 submissions per 10 minutes per IP. Tight because this sends
// an email + writes to the DB on every hit, and buyers aren't signed in.
let _leadLimiter: Ratelimit | null = null;
function getLeadLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  if (!_leadLimiter) {
    _leadLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '10 m'),
      analytics: true,
      prefix: 'rl:lead',
    });
  }
  return _leadLimiter;
}

// Listing create: 10 new listings per hour per signed-in user. Covers a
// reasonable dealer workflow, blocks mass-spam.
let _listingLimiter: Ratelimit | null = null;
function getListingLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  if (!_listingLimiter) {
    _listingLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      analytics: true,
      prefix: 'rl:listing',
    });
  }
  return _listingLimiter;
}

/**
 * Best-effort client IP extraction for IP-based rate limiting.
 * Vercel populates x-forwarded-for with the real client IP at the front.
 * Falls back to x-real-ip, then a constant "unknown" bucket.
 */
function clientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const xri = request.headers.get('x-real-ip');
  if (xri) return xri;
  return 'unknown';
}

/**
 * Build a standard 429 response with Retry-After and X-RateLimit-* headers.
 */
function tooManyRequests(reset: number, limit: number, remaining: number): NextResponse {
  const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return NextResponse.json(
    {
      error: 'Too many requests. Please wait a few minutes and try again.',
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSec),
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': String(Math.ceil(reset / 1000)),
      },
    }
  );
}

/**
 * Enforce the lead-form rate limit. Returns null if the request is allowed,
 * or a 429 NextResponse if it isn't. Silently allows traffic through if
 * Upstash isn't configured (so preview envs still work).
 */
export async function enforceLeadRateLimit(
  request: NextRequest
): Promise<NextResponse | null> {
  const limiter = getLeadLimiter();
  if (!limiter) return null;

  const ip = clientIp(request);
  const { success, reset, limit, remaining } = await limiter.limit(ip);
  if (success) return null;

  console.warn('Lead rate limit hit', { ip, reset });
  return tooManyRequests(reset, limit, remaining);
}

/**
 * Enforce the listing-create rate limit. Keyed by userId (already authenticated
 * by the route before this is called). Returns null if allowed, 429 otherwise.
 */
export async function enforceListingRateLimit(
  userId: string
): Promise<NextResponse | null> {
  const limiter = getListingLimiter();
  if (!limiter) return null;

  const { success, reset, limit, remaining } = await limiter.limit(userId);
  if (success) return null;

  console.warn('Listing rate limit hit', { userId, reset });
  return tooManyRequests(reset, limit, remaining);
}
