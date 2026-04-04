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

// Lazy-loaded pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Library = lazy(() => import('./pages/Library'));
const PlantDetail = lazy(() => import('./pages/PlantDetail'));
const AddPlant = lazy(() => import('./pages/AddPlant'));
const CareLog = lazy(() => import('./pages/CareLog'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));
const About = lazy(() => import('./pages/About'));
const Propagation = lazy(() => import('./pages/Propagation'));
const PropagationDetail = lazy(() => import('./pages/PropagationDetail'));
const Breeding = lazy(() => import('./pages/Breeding'));
const CrossDetail = lazy(() => import('./pages/CrossDetail'));
const Lineage = lazy(() => import('./pages/Lineage'));
const Analytics = lazy(() => import('./pages/Analytics'));
const NotFound = lazy(() => import('./pages/NotFound'));

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
