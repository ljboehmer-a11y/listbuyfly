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
let _redisInitFailed = false;
function getRedis(): Redis | null {
  if (!hasUpstash) return null;
  if (_redisInitFailed) return null;
  if (!_redis) {
    try {
      _redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
    } catch (err) {
      console.error('Upstash Redis init failed; rate limiting disabled:', err);
      _redisInitFailed = true;
      return null;
    }
  }
  return _redis;
}

// Lead form: 5 submissions per 10 minutes per IP. Tight because this sends
// an email + writes to the DB on every hit, and buyers aren't signed in.
// Analytics is disabled to keep us on the free Upstash tier with no extra
// commands-per-request overhead.
let _leadLimiter: Ratelimit | null = null;
function getLeadLimiter(): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  if (!_leadLimiter) {
    try {
      _leadLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '10 m'),
        analytics: false,
        prefix: 'rl:lead',
      });
    } catch (err) {
      console.error('Lead rate limiter init failed:', err);
      return null;
    }
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
    try {
      _listingLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 h'),
        analytics: false,
        prefix: 'rl:listing',
      });
    } catch (err) {
      console.error('Listing rate limiter init failed:', err);
      return null;
    }
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
  // Fail OPEN: if Upstash is slow, unreachable, mis-configured, or throws
  // for any reason, we log the error and let the request through. A broken
  // rate limiter must never take down the lead form — email delivery is
  // the critical path, rate limiting is a nice-to-have.
  try {
    const { success, reset, limit, remaining } = await limiter.limit(ip);
    if (success) return null;
    console.warn('Lead rate limit hit', { ip, reset });
    return tooManyRequests(reset, limit, remaining);
  } catch (err) {
    console.error('Lead rate limit check failed (failing open):', err);
    return null;
  }
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

  // Fail OPEN — see comment on enforceLeadRateLimit.
  try {
    const { success, reset, limit, remaining } = await limiter.limit(userId);
    if (success) return null;
    console.warn('Listing rate limit hit', { userId, reset });
    return tooManyRequests(reset, limit, remaining);
  } catch (err) {
    console.error('Listing rate limit check failed (failing open):', err);
    return null;
  }
}
