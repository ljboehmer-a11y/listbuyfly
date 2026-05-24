import * as Sentry from '@sentry/nextjs';

// Only initialize if DSN is set — missing DSN in dev/preview is normal
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Capture 10% of sessions for performance profiling. Adjust after seeing
    // real traffic — 10% gives enough data without burning quota.
    tracesSampleRate: 0.1,

    // Replay captures a video-like replay of sessions that hit an error.
    // 1% of all sessions, 100% of sessions with an error.
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.replayIntegration(),
    ],

    // Suppress noisy browser extension errors that aren't our bugs.
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      /^Network request failed$/,
      /^Failed to fetch$/,
      /^Load failed$/,
    ],
  });
}
