/**
 * Login Page
 * 
 * Email/password authentication with sign in and sign up modes.
 */

import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card, Button } from '../components/ui';

export default function Login() {
  const { isAuthenticated, loading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in — redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="heading text-3xl font-bold text-[var(--text-primary)] mb-2">
            Saintpaulia Studio
          </h1>
          <p className="text-[var(--text-muted)]">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl neuro-inset bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl neuro-inset bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              placeholder="••••••••"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-xl bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.3)]">
              <p className="text-sm text-[var(--color-error)]">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting 
              ? 'Loading...' 
              : mode === 'signin' 
                ? 'Sign In' 
                : 'Create Account'
            }
          </Button>
        </form>

        {/* Toggle mode */}
        <div className="mt-6 text-center">
          <p className="text-[var(--text-muted)] text-sm">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
              className="ml-2 text-[var(--accent-secondary)] hover:text-[var(--accent-primary)] font-medium"
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
