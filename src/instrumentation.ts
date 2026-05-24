// Next.js instrumentation hook — runs once on server startup.
// Sentry reads this file automatically when using withSentryConfig in next.config.ts.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

// Forward unhandled server-side errors to Sentry. Next.js calls this when
// an error propagates out of a route handler or server component.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onRequestError: any = async (
  err: unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any
) => {
  const { captureRequestError } = await import('@sentry/nextjs');
  captureRequestError(err, request, context);
};
