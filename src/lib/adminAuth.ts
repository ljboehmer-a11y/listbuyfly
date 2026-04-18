import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

/**
 * Admin token gate for maintenance/DB routes.
 *
 * Requires the `x-admin-token` request header to match `process.env.ADMIN_SETUP_SECRET`
 * using a constant-time comparison. Fails closed: if the env var isn't configured,
 * ALL calls are rejected (so a forgotten env var can never leave these routes open).
 *
 * Returns null on success, or a NextResponse to return directly on failure.
 */
export function requireAdminToken(request: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_SETUP_SECRET;

  // Fail closed — if the secret isn't configured, these routes are unusable.
  if (!expected || expected.length < 16) {
    console.error('ADMIN_SETUP_SECRET is not configured (or too short); refusing admin route access.');
    return NextResponse.json(
      { error: 'Admin routes disabled: server not configured' },
      { status: 503 }
    );
  }

  const supplied = request.headers.get('x-admin-token') || '';

  // Pad to equal length so timingSafeEqual doesn't throw.
  // Unequal lengths are still treated as "not equal" via the length check after.
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  let equal = false;
  if (a.length === b.length) {
    equal = timingSafeEqual(a, b);
  }

  if (!equal) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null;
}
