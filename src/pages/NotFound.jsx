/**
 * 404 Not Found Page
 */

import { Link } from 'react-router-dom';
import { Card } from '../components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 sm:p-10 text-center">
        <div className="text-5xl mb-4">🌿</div>
        <h1 className="heading text-3xl font-bold text-[var(--text-primary)] mb-2">
          Page not found
        </h1>
        <p className="text-[var(--text-muted)] mb-6">
          This page doesn't exist — it may have been moved or removed.
        </p>
        <Link to="/" className="btn btn-primary inline-block">
          Back to Dashboard
        </Link>
      </Card>
    </div>
  );
}
