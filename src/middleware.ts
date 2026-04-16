import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware: Canonical host redirect
 * Redirects www.listbuyfly.com → listbuyfly.com (301)
 * so Google doesn't index duplicate URLs.
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  // Redirect www → non-www (permanent 301)
  if (host.startsWith('www.')) {
    const newUrl = new URL(request.url);
    newUrl.host = host.replace(/^www\./, '');
    return NextResponse.redirect(newUrl, 301);
  }

  return NextResponse.next();
}

// Run on all paths except static assets, _next internals, and API routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.svg|api/).*)',
  ],
};
