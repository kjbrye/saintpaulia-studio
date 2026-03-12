/**
 * ErrorBoundary Component
 *
 * Catches React rendering errors and displays a friendly fallback
 * instead of a white screen.
 */

import { Component } from 'react';
import Card from './Card';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
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
              <button
                onClick={() => window.location.assign('/')}
                className="btn btn-primary"
              >
                Go to Dashboard
              </button>
              <button
                onClick={this.handleReset}
                className="btn btn-secondary"
              >
                Try Again
              </button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
