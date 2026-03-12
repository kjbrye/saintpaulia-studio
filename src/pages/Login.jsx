/**
 * Login Page
 * 
 * Email/password authentication with sign in and sign up modes.
 */

import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resetPassword } from '../services/auth';
import { Card, Button } from '../components/ui';

export default function Login() {
  const { isAuthenticated, loading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin', 'signup', or 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in — redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      if (mode === 'reset') {
        await resetPassword(email);
        setMessage('Check your email for a password reset link.');
      } else if (mode === 'signin') {
        await signIn(email, password);
      } else {
        const result = await signUp(email, password);
        // If email confirmation is required, the user won't be auto-signed in
        if (result.user && !result.session) {
          setMessage('Check your email to confirm your account before signing in.');
          setMode('signin');
        }
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
      <Card className="w-full max-w-md p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="heading text-3xl font-bold text-[var(--text-primary)] mb-2">
            Saintpaulia Studio
          </h1>
          <p className="text-[var(--text-muted)]">
            {mode === 'reset'
              ? 'Enter your email to reset your password'
              : mode === 'signin'
                ? 'Welcome back'
                : 'Create your account'}
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
              className="input w-full"
              placeholder="you@example.com"
            />
          </div>

          {mode !== 'reset' && (
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
                className="input w-full"
                placeholder="••••••••"
              />
            </div>
          )}

          {/* Success message */}
          {message && (
            <div className="p-3 rounded-xl bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)]">
              <p className="text-sm" style={{ color: 'var(--sage-700)' }}>{message}</p>
            </div>
          )}

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
              : mode === 'reset'
                ? 'Send Reset Link'
                : mode === 'signin'
                  ? 'Sign In'
                  : 'Create Account'
            }
          </Button>
        </form>

        {/* Toggle mode */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-[var(--text-muted)] text-sm">
            {mode === 'reset'
              ? 'Remember your password?'
              : mode === 'signin'
                ? "Don't have an account?"
                : 'Already have an account?'}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
                setMessage('');
              }}
              className="ml-2 text-[var(--sage-600)] hover:text-[var(--sage-700)] font-medium"
            >
              {mode === 'reset' ? 'Sign In' : mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
          {mode === 'signin' && (
            <p>
              <button
                type="button"
                onClick={() => {
                  setMode('reset');
                  setError('');
                  setMessage('');
                }}
                className="text-sm text-[var(--text-muted)] hover:text-[var(--sage-700)]"
              >
                Forgot your password?
              </button>
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
