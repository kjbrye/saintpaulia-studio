/**
 * App Component
 *
 * Root component that sets up:
 * - React Query for data fetching
 * - Auth provider for authentication
 * - Router for navigation
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SettingsProvider } from './hooks/useSettings.jsx';
import { ToastProvider } from './hooks/useToast.jsx';
import AppShell from './components/AppShell';
import AppLayout from './components/layout/AppLayout';
import ToastContainer from './components/ui/ToastContainer';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Wraps React.lazy so that a stale chunk after a deploy triggers a retry, then
// a one-time reload, instead of an ErrorBoundary crash. Most import failures
// are transient (flaky network, mobile suspend) — a quick in-place retry wins
// without the full reload. Uses sessionStorage to avoid an infinite reload
// loop if the failure is real (e.g., offline).
function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const reloadKey = 'page-has-been-force-refreshed';
    const hasRefreshed = sessionStorage.getItem(reloadKey) === 'true';

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const component = await componentImport();
        sessionStorage.setItem(reloadKey, 'false');
        return component;
      } catch (error) {
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
          continue;
        }
        if (!hasRefreshed) {
          sessionStorage.setItem(reloadKey, 'true');
          window.location.reload();
          return { default: () => null };
        }
        throw error;
      }
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
const Landing = lazyWithRetry(() => import('./pages/Landing'));
const About = lazyWithRetry(() => import('./pages/About'));
const Legal = lazyWithRetry(() => import('./pages/Legal'));
const Help = lazyWithRetry(() => import('./pages/Help'));
const HelpArticle = lazyWithRetry(() => import('./pages/HelpArticle'));
const Roadmap = lazyWithRetry(() => import('./pages/Roadmap'));
const Propagation = lazyWithRetry(() => import('./pages/Propagation'));
const PropagationDetail = lazyWithRetry(() => import('./pages/PropagationDetail'));
const Breeding = lazyWithRetry(() => import('./pages/Breeding'));
const CrossDetail = lazyWithRetry(() => import('./pages/CrossDetail'));
const Lineage = lazyWithRetry(() => import('./pages/Lineage'));
const Analytics = lazyWithRetry(() => import('./pages/Analytics'));
const Notes = lazyWithRetry(() => import('./pages/Notes'));
const Sports = lazyWithRetry(() => import('./pages/Sports'));
const SportDetail = lazyWithRetry(() => import('./pages/SportDetail'));
const ImportPlants = lazyWithRetry(() => import('./pages/Import'));
const Wishlist = lazyWithRetry(() => import('./pages/Wishlist'));
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

// Protected layout — auth gate + the shared AppLayout shell (sidebar + top
// bar). Its child routes render into <Outlet /> inside the shell, so every
// authenticated page appears within the same navigation chrome.
function ProtectedLayout() {
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

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

// Home route — shows Landing for signed-out users, and the Dashboard inside the
// shared shell for signed-in users.
function HomeRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--text-muted)]">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
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
      <Route path="/welcome" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/help" element={<Help />} />
      <Route path="/help/roadmap" element={<Roadmap />} />
      <Route path="/help/:slug" element={<HelpArticle />} />
      <Route path="/help/:section/:slug" element={<HelpArticle />} />

      {/* Home — auth-aware: Landing for signed-out, Dashboard for signed-in */}
      <Route path="/" element={<HomeRoute />} />

      {/* Protected routes — all rendered inside the shared AppLayout shell */}
      <Route element={<ProtectedLayout />}>
        {/* Library */}
        <Route path="/library" element={<Library />} />

        {/* Care Log */}
        <Route path="/care" element={<CareLog />} />

        {/* Settings */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/:pane" element={<Settings />} />

        {/* Propagation */}
        <Route path="/propagation" element={<Propagation />} />
        <Route path="/propagation/:id" element={<PropagationDetail />} />

        {/* Breeding */}
        <Route path="/breeding" element={<Breeding />} />
        <Route path="/breeding/:id" element={<CrossDetail />} />

        {/* Lineage */}
        <Route path="/lineage" element={<Lineage />} />

        {/* Analytics */}
        <Route path="/analytics" element={<Analytics />} />

        {/* Notes */}
        <Route path="/notes" element={<Notes />} />

        {/* Sports - /new must come before /:id */}
        <Route path="/sports" element={<Sports />} />
        <Route path="/sports/new" element={<SportRegistrationForm />} />
        <Route path="/sports/:id" element={<SportDetail />} />

        {/* Wishlist */}
        <Route path="/wishlist" element={<Wishlist />} />

        {/* Import */}
        <Route path="/import" element={<ImportPlants />} />

        {/* Add Plant - must come before /plants/:id */}
        <Route path="/plants/new" element={<AddPlant />} />

        {/* Plant Detail */}
        <Route path="/plants/:id" element={<PlantDetail />} />
      </Route>

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
                        opacity: 0.42,
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
