import * as Sentry from '@sentry/nextjs';

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Lower sample rate on server — most interesting signals come from errors,
    // not performance traces. Raise to 0.2-0.5 if you want route timing data.
    tracesSampleRate: 0.05,
  });
}
