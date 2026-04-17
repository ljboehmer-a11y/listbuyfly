import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';

// WordPress/PHP scanner bot paths — block before Clerk touches them
const BLOCKED_PREFIXES = [
  '/wp-admin',
  '/wp-login',
  '/wp-content',
  '/wp-includes',
  '/wordpress',
  '/xmlrpc.php',
  '/.env',
  '/phpmyadmin',
  '/admin.php',
  '/wp-config',
  '/wp-cron.php',
];

function isBlockedPath(pathname: string): boolean {
  const lower = pathname.toLowerCase();
  return BLOCKED_PREFIXES.some((p) => lower.startsWith(p));
}

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/create(.*)',
]);

const clerk = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

// Intercept BEFORE Clerk so its handshake logic never fires on bot paths
export default function proxy(req: NextRequest, event: NextFetchEvent) {
  // Block WordPress/PHP scanner bots
  if (isBlockedPath(req.nextUrl.pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  // Canonical host redirect: www → non-www (301)
  const host = req.headers.get('host') || '';
  if (host.startsWith('www.')) {
    const url = req.nextUrl.clone();
    url.host = host.replace(/^www\./, '');
    return NextResponse.redirect(url, 301);
  }

  return clerk(req, event);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
