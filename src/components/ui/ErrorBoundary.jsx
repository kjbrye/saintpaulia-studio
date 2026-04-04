import * as Sentry from '@sentry/react';
import Card from './Card';

function ErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 sm:p-10 text-center">
        <div className="text-4xl mb-4">🍂</div>
        <h1 className="heading text-2xl font-bold text-[var(--text-primary)] mb-2">
          Something went wrong
        </h1>
        <p className="text-[var(--text-muted)] mb-6">
          An unexpected error occurred. Try refreshing the page or going back to the dashboard.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => window.location.assign('/')} className="btn btn-primary">
            Go to Dashboard
          </button>
          <button onClick={() => window.location.reload()} className="btn btn-secondary">
            Try Again
          </button>
        </div>
      </Card>
    </div>
  );
}

export default function ErrorBoundary({ children }) {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>{children}</Sentry.ErrorBoundary>
  );
}
