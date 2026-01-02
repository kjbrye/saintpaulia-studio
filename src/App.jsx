/**
 * App Component
 * 
 * Root component that sets up:
 * - React Query for data fetching
 * - Auth provider for authentication
 * - Router for navigation
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SettingsProvider } from './hooks/useSettings.jsx';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import PlantDetail from './pages/PlantDetail';
import AddPlant from './pages/AddPlant';
import CareLog from './pages/CareLog';
import Settings from './pages/Settings';
import Login from './pages/Login';

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
// TODO: Remove DEV_BYPASS before production
const DEV_BYPASS = true;

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Bypass auth for development preview
  if (DEV_BYPASS) {
    return children;
  }

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
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      
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
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
