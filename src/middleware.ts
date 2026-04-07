import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';

// Paths that bots probe for WordPress/PHP — return 404 instantly
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

const clerk = clerkMiddleware();

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  const path = request.nextUrl.pathname.toLowerCase();
  if (BLOCKED_PREFIXES.some((p) => path.startsWith(p))) {
    return new NextResponse(null, { status: 404 });
  }
  return clerk(request, event);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
