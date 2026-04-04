import React from 'react';
import * as Sentry from '@sentry/react';
import {
  useLocation,
  useNavigationType,
  createRoutesFromChildren,
  matchRoutes,
} from 'react-router-dom';

Sentry.init({
  dsn: 'https://5658da1ecf7c6b3116ece6ac0a8e4ef6@o4511162117783552.ingest.us.sentry.io/4511162124271616',
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,
  sendDefaultPii: true,

  integrations: [
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect: React.useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Tracing — lower in production
  tracesSampleRate: 0.2,
  tracePropagationTargets: ['localhost', /^https:\/\/.*\.supabase\.co/],

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

export default Sentry;
