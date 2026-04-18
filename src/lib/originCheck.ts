import { NextRequest, NextResponse } from 'next/server';

/**
 * Defense-in-depth origin check for state-changing API routes.
 *
 * Clerk already gives us CSRF protection via SameSite=Lax session cookies,
 * but an explicit Origin check is cheap, well-understood, and rejects a
 * whole class of misconfigured-browser / proxied-request attacks before
 * they hit our auth logic.
 *
 * Accepts requests whose Origin header matches our production/preview
 * domains OR is absent (same-origin fetches from old browsers sometimes
 * omit Origin). Rejects everything else with 403.
 *
 * Returns null on success, or a NextResponse to return directly on failure.
 */
export function requireSameOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');

  // No Origin header = same-origin request from an old browser, or a
  // server-to-server call (e.g. Stripe webhook). We don't block these —
  // they have their own auth gates.
  if (!origin) return null;

  let hostname: string;
  try {
    hostname = new URL(origin).hostname.toLowerCase();
  } catch {
    return NextResponse.json({ error: 'Bad origin' }, { status: 403 });
  }

  // Accept our canonical domain, the www variant, any Vercel preview URL
  // ending in .vercel.app, and localhost during development.
  const allowed =
    hostname === 'listbuyfly.com' ||
    hostname === 'www.listbuyfly.com' ||
    hostname.endsWith('.vercel.app') ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1';

  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
  }

  return null;
}
