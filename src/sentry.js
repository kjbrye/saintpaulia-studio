import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'https://5658da1ecf7c6b3116ece6ac0a8e4ef6@o4511162117783552.ingest.us.sentry.io/4511162124271616',
  environment: import.meta.env.MODE,
  sendDefaultPii: true,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  tracesSampleRate: 0.2,
  tracePropagationTargets: ['localhost', /^https:\/\/.*\.supabase\.co/],

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
