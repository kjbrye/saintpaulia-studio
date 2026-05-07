/**
 * App Component
 *
 * Root component that sets up:
 * - React Query for data fetching
 * - Auth provider for authentication
 * - Router for navigation
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SettingsProvider } from './hooks/useSettings.jsx';
import { ToastProvider } from './hooks/useToast.jsx';
import AppShell from './components/AppShell';
import ToastContainer from './components/ui/ToastContainer';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Wraps React.lazy so that a stale chunk after a deploy triggers a one-time
// reload instead of an ErrorBoundary crash. Uses sessionStorage to avoid an
// infinite reload loop if the failure is real (e.g., offline).
function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const reloadKey = 'page-has-been-force-refreshed';
    const hasRefreshed = sessionStorage.getItem(reloadKey) === 'true';
    try {
      const component = await componentImport();
      sessionStorage.setItem(reloadKey, 'false');
      return component;
    } catch (error) {
      if (!hasRefreshed) {
        sessionStorage.setItem(reloadKey, 'true');
        window.location.reload();
        return { default: () => null };
      }
      throw error;
    }
  });
}

// Lazy-loaded pages
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const Library = lazyWithRetry(() => import('./pages/Library'));
const PlantDetail = lazyWithRetry(() => import('./pages/PlantDetail'));
const AddPlant = lazyWithRetry(() => import('./pages/AddPlant'));
const CareLog = lazyWithRetry(() => import('./pages/CareLog'));
const Settings = lazyWithRetry(() => import('./pages/Settings'));
const Login = lazyWithRetry(() => import('./pages/Login'));
const About = lazyWithRetry(() => import('./pages/About'));
const Legal = lazyWithRetry(() => import('./pages/Legal'));
const Propagation = lazyWithRetry(() => import('./pages/Propagation'));
const PropagationDetail = lazyWithRetry(() => import('./pages/PropagationDetail'));
const Breeding = lazyWithRetry(() => import('./pages/Breeding'));
const CrossDetail = lazyWithRetry(() => import('./pages/CrossDetail'));
const Lineage = lazyWithRetry(() => import('./pages/Lineage'));
const Analytics = lazyWithRetry(() => import('./pages/Analytics'));
const Notes = lazyWithRetry(() => import('./pages/Notes'));
const Sports = lazyWithRetry(() => import('./pages/Sports'));
const SportDetail = lazyWithRetry(() => import('./pages/SportDetail'));
const SportRegistrationForm = lazyWithRetry(() =>
  import('./components/sports/SportRegistrationForm'),
);
const NotFound = lazyWithRetry(() => import('./pages/NotFound'));

// Create a client with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// App routes
function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-[var(--text-muted)]">Loading...</p>
        </div>
      }
    >
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<About />} />
      <Route path="/legal" element={<Legal />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Library */}
      <Route
        path="/library"
        element={
          <ProtectedRoute>
            <Library />
          </ProtectedRoute>
        }
      />

      {/* Care Log */}
      <Route
        path="/care"
        element={
          <ProtectedRoute>
            <CareLog />
          </ProtectedRoute>
        }
      />

      {/* Settings */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Propagation */}
      <Route
        path="/propagation"
        element={
          <ProtectedRoute>
            <Propagation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/propagation/:id"
        element={
          <ProtectedRoute>
            <PropagationDetail />
          </ProtectedRoute>
        }
      />

      {/* Breeding */}
      <Route
        path="/breeding"
        element={
          <ProtectedRoute>
            <Breeding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/breeding/:id"
        element={
          <ProtectedRoute>
            <CrossDetail />
          </ProtectedRoute>
        }
      />

      {/* Lineage */}
      <Route
        path="/lineage"
        element={
          <ProtectedRoute>
            <Lineage />
          </ProtectedRoute>
        }
      />

      {/* Analytics */}
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />

      {/* Notes */}
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
        }
      />

      {/* Sports - /new must come before /:id */}
      <Route
        path="/sports"
        element={
          <ProtectedRoute>
            <Sports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sports/new"
        element={
          <ProtectedRoute>
            <SportRegistrationForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sports/:id"
        element={
          <ProtectedRoute>
            <SportDetail />
          </ProtectedRoute>
        }
      />

      {/* Add Plant - must come before /plants/:id */}
      <Route
        path="/plants/new"
        element={
          <ProtectedRoute>
            <AddPlant />
          </ProtectedRoute>
        }
      />

      {/* Plant Detail */}
      <Route
        path="/plants/:id"
        element={
          <ProtectedRoute>
            <PlantDetail />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <ToastProvider>
            <BrowserRouter>
              <ErrorBoundary>
                <AppShell>
                  <div className="relative min-h-screen">
                    {/* Background layer with reduced opacity */}
                    <div
                      className="fixed inset-0 -z-10"
                      style={{
                        backgroundImage: 'url(/Background.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        opacity: 0.3,
                      }}
                    />
                    <AppRoutes />
                  </div>
                </AppShell>
              </ErrorBoundary>
              <ToastContainer />
            </BrowserRouter>
          </ToastProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
