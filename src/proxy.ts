import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// WordPress/PHP scanner bot paths — return 404 instantly
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

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Block bot scanner paths before any auth processing
  if (isBlockedPath(req.nextUrl.pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
